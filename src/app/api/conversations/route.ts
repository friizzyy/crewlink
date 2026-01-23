import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/conversations - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const conversations = await prisma.messageThread.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                image: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Transform to include other participant and unread count
    const transformedConversations = conversations.map((conv) => {
      const myParticipation = conv.participants.find((p) => p.userId === session.user.id)
      const otherParticipant = conv.participants.find((p) => p.userId !== session.user.id)

      return {
        id: conv.id,
        job: conv.job,
        otherUser: otherParticipant?.user,
        lastMessage: conv.messages[0] || null,
        lastMessageAt: conv.lastMessageAt,
        lastMessagePreview: conv.lastMessagePreview,
        unreadCount: myParticipation?.unreadCount || 0,
        isMuted: myParticipation?.isMuted || false,
      }
    })

    return NextResponse.json({ success: true, data: transformedConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { participantId, jobId, initialMessage } = body

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    // Check if conversation already exists
    const existingConversation = await prisma.messageThread.findFirst({
      where: {
        ...(jobId ? { jobId } : {}),
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
    })

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        data: { id: existingConversation.id, existing: true },
      })
    }

    // Create new conversation
    const conversation = await prisma.messageThread.create({
      data: {
        jobId: jobId || null,
        participants: {
          create: [
            { userId: session.user.id },
            { userId: participantId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    })

    // Add initial message if provided
    if (initialMessage) {
      await prisma.message.create({
        data: {
          threadId: conversation.id,
          senderId: session.user.id,
          content: initialMessage,
        },
      })

      await prisma.messageThread.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: initialMessage.substring(0, 100),
        },
      })

      // Update unread count for other participant
      await prisma.threadParticipant.updateMany({
        where: {
          threadId: conversation.id,
          userId: { not: session.user.id },
        },
        data: { unreadCount: { increment: 1 } },
      })

      // Notify other participant
      await prisma.notification.create({
        data: {
          userId: participantId,
          type: 'new_message',
          title: 'New Message',
          body: `${session.user.name || 'Someone'} sent you a message`,
          data: { conversationId: conversation.id },
          actionUrl: `/messages/${conversation.id}`,
        },
      })
    }

    return NextResponse.json({ success: true, data: conversation }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
