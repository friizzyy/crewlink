import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

const refundSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be 500 characters or less'),
})

// POST /api/payments/refund - Issue a refund for a booking payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'hirer') {
      return NextResponse.json(
        { success: false, error: 'Only hirers can request refunds' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = refundSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { bookingId, reason } = validation.data

    // Find booking scoped to authenticated hirer
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        hirerId: session.user.id,
      },
      select: {
        id: true,
        workerId: true,
        agreedAmount: true,
        finalAmount: true,
        paymentStatus: true,
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Find the completed payment record for this booking
    const paymentRecord = await prisma.paymentRecord.findFirst({
      where: {
        bookingId: booking.id,
        userId: session.user.id,
        status: 'completed',
      },
    })

    if (!paymentRecord) {
      return NextResponse.json(
        { success: false, error: 'No completed payment found for this booking' },
        { status: 404 }
      )
    }

    if (!paymentRecord.externalId) {
      return NextResponse.json(
        { success: false, error: 'Payment record missing external reference' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // Create a refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentRecord.externalId,
      reason: 'requested_by_customer',
      metadata: {
        bookingId: booking.id,
        hirerId: session.user.id,
        reason: reason,
      },
    })

    // Create a refund PaymentRecord with negative amount
    await prisma.paymentRecord.create({
      data: {
        bookingId: booking.id,
        userId: session.user.id,
        amount: -paymentRecord.amount,
        type: 'refund',
        status: 'completed',
        externalId: refund.id,
        provider: 'stripe',
        description: `Refund for "${booking.job.title}": ${reason}`,
        metadata: {
          refundId: refund.id,
          originalPaymentId: paymentRecord.id,
          reason: reason,
          jobId: booking.job.id,
        },
        processedAt: new Date(),
      },
    })

    // Update booking payment status
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: 'refunded' },
    })

    // Notify the worker about the refund
    await prisma.notification.create({
      data: {
        userId: booking.workerId,
        type: 'payment_refunded',
        title: 'Payment Refunded',
        body: `A refund has been issued for "${booking.job.title}".`,
        data: { bookingId: booking.id, jobId: booking.job.id },
        actionUrl: `/work/bookings/${booking.id}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: paymentRecord.amount,
        message: 'Refund has been processed successfully',
      },
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}
