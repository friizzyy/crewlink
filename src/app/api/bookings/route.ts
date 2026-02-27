import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateBookingSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'cancelled', 'disputed']),
  cancelReason: z.string().max(500).optional(),
  finalAmount: z.number().positive().optional(),
})

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = {
      OR: [
        { hirerId: session.user.id },
        { workerId: session.user.id },
      ],
    }

    if (status) {
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              category: true,
              address: true,
              city: true,
            },
          },
          hirer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              image: true,
            },
          },
          worker: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              image: true,
              workerProfile: {
                select: {
                  headline: true,
                  averageRating: true,
                },
              },
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.booking.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: { total, limit, offset, hasMore: offset + bookings.length < total },
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// PATCH /api/bookings - Update a booking status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingId, ...updateFields } = body

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const validation = updateBookingSchema.safeParse(updateFields)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verify booking exists and user is a participant
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        hirerId: true,
        workerId: true,
        jobId: true,
        agreedAmount: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    const isHirer = booking.hirerId === session.user.id
    const isWorker = booking.workerId === session.user.id

    if (!isHirer && !isWorker) {
      return NextResponse.json(
        { success: false, error: 'You are not part of this booking' },
        { status: 403 }
      )
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled', 'disputed'],
      completed: [],
      cancelled: [],
      disputed: ['completed', 'cancelled'],
    }

    const allowed = validTransitions[booking.status]
    if (!allowed || !allowed.includes(data.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot transition from "${booking.status}" to "${data.status}"`,
        },
        { status: 400 }
      )
    }

    // Only hirer can mark as completed
    if (data.status === 'completed' && !isHirer) {
      return NextResponse.json(
        { success: false, error: 'Only the hirer can mark a booking as completed' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = { status: data.status }

    if (data.status === 'completed') {
      updateData.completedAt = new Date()
      updateData.finalAmount = data.finalAmount || booking.agreedAmount
    }

    if (data.status === 'cancelled') {
      updateData.cancelledAt = new Date()
      updateData.cancelReason = data.cancelReason || null
    }

    if (data.status === 'in_progress') {
      updateData.actualStart = new Date()
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    })

    // Update job status based on booking status
    if (data.status === 'completed') {
      await prisma.job.update({
        where: { id: booking.jobId },
        data: { status: 'completed' },
      })

      // Update worker stats
      await prisma.workerProfile.updateMany({
        where: { userId: booking.workerId },
        data: {
          completedJobs: { increment: 1 },
          totalEarnings: { increment: updated.finalAmount || booking.agreedAmount },
        },
      })

      // Update hirer stats
      await prisma.hirerProfile.updateMany({
        where: { userId: booking.hirerId },
        data: {
          totalSpent: { increment: updated.finalAmount || booking.agreedAmount },
        },
      })
    }

    if (data.status === 'cancelled') {
      await prisma.job.update({
        where: { id: booking.jobId },
        data: { status: 'cancelled' },
      })
    }

    // Notify the other party
    const otherUserId = isHirer ? booking.workerId : booking.hirerId
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: `booking_${data.status}`,
        title: `Booking ${data.status.replace('_', ' ')}`,
        body: `A booking has been marked as ${data.status.replace('_', ' ')}`,
        data: { bookingId: booking.id, jobId: booking.jobId },
        actionUrl: isHirer
          ? `/work/job/${booking.jobId}`
          : `/hiring/job/${booking.jobId}`,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
