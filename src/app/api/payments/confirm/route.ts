import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

const confirmPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
})

// POST /api/payments/confirm - Capture escrow payment after job completion
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
        { success: false, error: 'Only hirers can confirm payments' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = confirmPaymentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { bookingId } = validation.data

    // Find booking scoped to authenticated hirer, must be completed
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        hirerId: session.user.id,
        status: 'completed',
      },
      select: {
        id: true,
        workerId: true,
        agreedAmount: true,
        finalAmount: true,
        paymentStatus: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Completed booking not found' },
        { status: 404 }
      )
    }

    // Find the pending escrow PaymentRecord for this booking
    const paymentRecord = await prisma.paymentRecord.findFirst({
      where: {
        bookingId: booking.id,
        userId: session.user.id,
        type: 'escrow_hold',
        status: 'pending',
      },
    })

    if (!paymentRecord) {
      return NextResponse.json(
        { success: false, error: 'No pending escrow payment found for this booking' },
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

    // Capture the held payment
    await stripe.paymentIntents.capture(paymentRecord.externalId)

    // Update the PaymentRecord to completed
    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        status: 'completed',
        processedAt: new Date(),
      },
    })

    // Update booking payment status
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: 'paid' },
    })

    // Increment worker's total earnings
    const payoutAmount = booking.finalAmount || booking.agreedAmount
    await prisma.workerProfile.updateMany({
      where: { userId: booking.workerId },
      data: {
        totalEarnings: { increment: payoutAmount },
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Payment captured successfully', amount: payoutAmount },
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
