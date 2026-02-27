import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendBidAcceptedEmail } from '@/lib/email'

// GET /api/bids/[id] - Get a single bid
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

    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            posterId: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            workerProfile: true,
          },
        },
      },
    })

    if (!bid) {
      return NextResponse.json(
        { success: false, error: 'Bid not found' },
        { status: 404 }
      )
    }

    // Only job owner or bid owner can view
    if (bid.workerId !== session.user.id && bid.job.posterId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, data: bid })
  } catch (error) {
    console.error('Error fetching bid:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bid' },
      { status: 500 }
    )
  }
}

// POST /api/bids/[id] - Accept or reject a bid
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

    const body = await request.json()
    const { action } = body // 'accept' or 'reject'

    if (!['accept', 'reject', 'withdraw'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use accept, reject, or withdraw' },
        { status: 400 }
      )
    }

    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            posterId: true,
            status: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!bid) {
      return NextResponse.json(
        { success: false, error: 'Bid not found' },
        { status: 404 }
      )
    }

    // Only job owner can accept/reject, only bid owner can withdraw
    if (action === 'withdraw') {
      if (bid.workerId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Only the bid owner can withdraw' },
          { status: 403 }
        )
      }
    } else {
      if (bid.job.posterId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Only the job owner can accept or reject bids' },
          { status: 403 }
        )
      }
    }

    // Check bid is still pending
    if (bid.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Cannot ${action} a bid that is ${bid.status}` },
        { status: 400 }
      )
    }

    // Handle action
    if (action === 'accept') {
      // Update bid status
      await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'accepted' },
      })

      // Reject all other pending bids
      await prisma.bid.updateMany({
        where: {
          jobId: bid.jobId,
          id: { not: params.id },
          status: 'pending',
        },
        data: { status: 'rejected' },
      })

      // Update job status and assign worker
      await prisma.job.update({
        where: { id: bid.jobId },
        data: {
          status: 'assigned',
          assignedWorkerId: bid.workerId,
        },
      })

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          jobId: bid.jobId,
          hirerId: bid.job.posterId,
          workerId: bid.workerId,
          agreedAmount: bid.amount,
          scheduledStart: new Date(), // Default to now, should be updated
        },
      })

      // Create notification for worker
      await prisma.notification.create({
        data: {
          userId: bid.workerId,
          type: 'bid_accepted',
          title: 'Bid Accepted',
          body: `Your bid for "${bid.job.title}" has been accepted`,
          data: { jobId: bid.jobId, bidId: bid.id, bookingId: booking.id },
          actionUrl: `/work/job/${bid.jobId}`,
        },
      })

      // Send bid accepted email (non-blocking)
      if (bid.worker.email) {
        sendBidAcceptedEmail(
          bid.worker.email,
          bid.worker.name || 'Worker',
          bid.job.title,
          bid.jobId
        ).catch((err) => {
          console.error('Failed to send bid accepted email:', err)
        })
      }

      // Create or get conversation between hirer and worker
      let conversation = await prisma.messageThread.findFirst({
        where: {
          jobId: bid.jobId,
          participants: {
            every: {
              userId: { in: [bid.job.posterId, bid.workerId] },
            },
          },
        },
      })

      if (!conversation) {
        conversation = await prisma.messageThread.create({
          data: {
            jobId: bid.jobId,
            participants: {
              create: [
                { userId: bid.job.posterId },
                { userId: bid.workerId },
              ],
            },
          },
        })

        // Add system message
        await prisma.message.create({
          data: {
            threadId: conversation.id,
            senderId: bid.job.posterId,
            content: `Bid accepted! You can now coordinate the job details.`,
            messageType: 'system',
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: { bidStatus: 'accepted', conversationId: conversation.id },
      })
    } else if (action === 'reject') {
      await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'rejected' },
      })

      // Create notification for worker
      await prisma.notification.create({
        data: {
          userId: bid.workerId,
          type: 'bid_rejected',
          title: 'Bid Not Selected',
          body: `Your bid for "${bid.job.title}" was not selected`,
          data: { jobId: bid.jobId, bidId: bid.id },
          actionUrl: `/work/jobs`,
        },
      })

      return NextResponse.json({ success: true, data: { bidStatus: 'rejected' } })
    } else if (action === 'withdraw') {
      await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'withdrawn' },
      })

      // Update job bid count
      await prisma.job.update({
        where: { id: bid.jobId },
        data: { bidCount: { decrement: 1 } },
      })

      return NextResponse.json({ success: true, data: { bidStatus: 'withdrawn' } })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing bid action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process bid' },
      { status: 500 }
    )
  }
}
