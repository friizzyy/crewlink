import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'

const bidSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  message: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
})

// GET /api/jobs/[id]/bids - Get all bids for a job (owner only)
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

    // Check if user owns the job
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.posterId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only view bids for your own jobs' },
        { status: 403 }
      )
    }

    const bids = await prisma.bid.findMany({
      where: { jobId: params.id },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            image: true,
            workerProfile: {
              select: {
                headline: true,
                bio: true,
                hourlyRate: true,
                skills: true,
                isVerified: true,
                completedJobs: true,
                averageRating: true,
                responseRate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: bids })
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bids' },
      { status: 500 }
    )
  }
}

// POST /api/jobs/[id]/bids - Submit a bid (workers only)
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

    // Rate limit: 10 bids per minute per user
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success: allowed } = rateLimit(
      getRateLimitKey(session.user.id, 'bids/create'),
      { windowMs: 60_000, maxRequests: 10 }
    )
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if user is a worker
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, workerProfile: true },
    })

    if (user?.role !== 'worker') {
      return NextResponse.json(
        { success: false, error: 'Only workers can submit bids' },
        { status: 403 }
      )
    }

    // Check if job exists and is accepting bids
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { id: true, posterId: true, status: true, title: true },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'posted') {
      return NextResponse.json(
        { success: false, error: 'This job is not accepting bids' },
        { status: 400 }
      )
    }

    // Check if user already bid
    const existingBid = await prisma.bid.findUnique({
      where: {
        jobId_workerId: {
          jobId: params.id,
          workerId: session.user.id,
        },
      },
    })

    if (existingBid) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a bid for this job' },
        { status: 400 }
      )
    }

    // Validate input
    const body = await request.json()
    const validation = bidSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { amount, message, estimatedHours } = validation.data

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        jobId: params.id,
        workerId: session.user.id,
        amount,
        message,
        estimatedHours,
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Update job bid count
    await prisma.job.update({
      where: { id: params.id },
      data: { bidCount: { increment: 1 } },
    })

    // Create notification for job poster
    await prisma.notification.create({
      data: {
        userId: job.posterId,
        type: 'new_bid',
        title: 'New Bid Received',
        body: `${session.user.name || 'A worker'} has submitted a bid of $${amount} for your job "${job.title}"`,
        data: { jobId: params.id, bidId: bid.id },
        actionUrl: `/hiring/job/${params.id}`,
      },
    })

    return NextResponse.json({ success: true, data: bid }, { status: 201 })
  } catch (error) {
    console.error('Error creating bid:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit bid' },
      { status: 500 }
    )
  }
}
