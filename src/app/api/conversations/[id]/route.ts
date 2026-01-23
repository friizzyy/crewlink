import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/conversations/[id] - Get a conversation
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

    const conversation = await prisma.messageThread.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            category: true,
            address: true,
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
                role: true,
                workerProfile: {
                  select: {
                    headline: true,
                    averageRating: true,
                    isVerified: true,
                  },
                },
                hirerProfile: {
                  select: {
                    companyName: true,
                    averageRating: true,
                    isVerified: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Mark as read
    await prisma.threadParticipant.updateMany({
      where: {
        threadId: params.id,
        userId: session.user.id,
      },
      data: {
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    })

    return NextResponse.json({ success: true, data: conversation })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}
