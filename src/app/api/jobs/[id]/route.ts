import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/jobs/[id] - Get a single job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            image: true,
            hirerProfile: {
              select: {
                companyName: true,
                totalJobsPosted: true,
                averageRating: true,
                isVerified: true,
              },
            },
          },
        },
        bids: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            worker: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                workerProfile: {
                  select: {
                    headline: true,
                    averageRating: true,
                    completedJobs: true,
                    isVerified: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { bids: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.job.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        bidCount: job._count.bids,
      },
    })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

// PATCH /api/jobs/[id] - Update a job
export async function PATCH(
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

    // Check ownership
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true, status: true },
    })

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    if (existingJob.posterId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own jobs' },
        { status: 403 }
      )
    }

    // Only allow editing draft or posted jobs
    if (!['draft', 'posted'].includes(existingJob.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot edit a job that is in progress or completed' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const allowedFields = [
      'title', 'description', 'category', 'skills', 'address', 'lat', 'lng',
      'city', 'isRemote', 'scheduleType', 'startDate', 'endDate', 'estimatedHours',
      'budgetType', 'budgetMin', 'budgetMax',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const job = await prisma.job.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: job })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/[id] - Delete a job
export async function DELETE(
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

    // Check ownership
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true, status: true },
    })

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    if (existingJob.posterId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own jobs' },
        { status: 403 }
      )
    }

    // Don't allow deleting jobs in progress
    if (['in_progress', 'completed'].includes(existingJob.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete a job that is in progress or completed' },
        { status: 400 }
      )
    }

    await prisma.job.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
