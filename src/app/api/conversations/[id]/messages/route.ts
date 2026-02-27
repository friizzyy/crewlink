import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sanitizeHtml } from '@/lib/sanitize'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  messageType: z.enum(['text', 'image', 'offer']).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// GET /api/conversations/[id]/messages - Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is participant
    const participant = await prisma.threadParticipant.findUnique({
      where: {
        threadId_userId: {
          threadId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const before = searchParams.get('before') // cursor for pagination

    const where: Record<string, unknown> = {
      threadId: params.id,
      isDeleted: false,
    }

    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Mark as read
    await prisma.threadParticipant.update({
      where: {
        threadId_userId: {
          threadId: params.id,
          userId: session.user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    })

    return NextResponse.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[id]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limit: 30 messages per minute per user
    const { success: allowed } = rateLimit(
      getRateLimitKey(session.user.id, 'messages/send'),
      { windowMs: 60_000, maxRequests: 30 }
    )
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please slow down.' },
        { status: 429 }
      )
    }

    // Check if user is participant
    const conversation = await prisma.messageThread.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate input
    const body = await request.json()
    const validation = messageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content, messageType, metadata } = validation.data
    const sanitizedContent = sanitizeHtml(content)

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId: params.id,
        senderId: session.user.id,
        content: sanitizedContent,
        messageType: messageType || 'text',
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            image: true,
          },
        },
      },
    })

    // Update conversation
    await prisma.messageThread.update({
      where: { id: params.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: sanitizedContent.substring(0, 100),
      },
    })

    // Update unread count for other participants
    await prisma.threadParticipant.updateMany({
      where: {
        threadId: params.id,
        userId: { not: session.user.id },
      },
      data: { unreadCount: { increment: 1 } },
    })

    // Notify other participants
    const otherParticipants = conversation.participants.filter(
      (p) => p.userId !== session.user.id
    )

    for (const participant of otherParticipants) {
      await prisma.notification.create({
        data: {
          userId: participant.userId,
          type: 'new_message',
          title: 'New Message',
          body: `${session.user.name || 'Someone'}: ${sanitizedContent.substring(0, 50)}${sanitizedContent.length > 50 ? '...' : ''}`,
          data: { conversationId: params.id, messageId: message.id },
          actionUrl: `/messages/${params.id}`,
        },
      })
    }

    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
