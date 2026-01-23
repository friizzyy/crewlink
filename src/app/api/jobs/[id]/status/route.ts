import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Valid status transitions
const validTransitions: Record<string, string[]> = {
  draft: ['posted', 'cancelled'],
  posted: ['in_review', 'assigned', 'cancelled'],
  in_review: ['assigned', 'posted', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

// POST /api/jobs/[id]/status - Transition job status
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
    const { status: newStatus } = body

    if (!newStatus) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Get current job
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: {
        posterId: true,
        status: true,
        assignedWorkerId: true,
      },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user is the poster or assigned worker
    const isPoster = job.posterId === session.user.id
    const isAssignedWorker = job.assignedWorkerId === session.user.id

    if (!isPoster && !isAssignedWorker) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to change this job status' },
        { status: 403 }
      )
    }

    // Validate transition
    const allowedTransitions = validTransitions[job.status] || []
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot transition from ${job.status} to ${newStatus}`,
          allowedTransitions,
        },
        { status: 400 }
      )
    }

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: { status: newStatus },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    })

    // Create notification for status change
    if (job.assignedWorkerId && job.assignedWorkerId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: job.assignedWorkerId,
          type: 'job_status_changed',
          title: 'Job Status Updated',
          body: `The job status has been changed to ${newStatus.replace('_', ' ')}`,
          data: { jobId: params.id },
          actionUrl: `/work/job/${params.id}`,
        },
      })
    }

    if (job.posterId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: job.posterId,
          type: 'job_status_changed',
          title: 'Job Status Updated',
          body: `Your job status has been changed to ${newStatus.replace('_', ' ')}`,
          data: { jobId: params.id },
          actionUrl: `/hiring/job/${params.id}`,
        },
      })
    }

    return NextResponse.json({ success: true, data: updatedJob })
  } catch (error) {
    console.error('Error updating job status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update job status' },
      { status: 500 }
    )
  }
}
