import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

const createIntentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
})

// POST /api/payments/create-intent - Create a payment intent for escrow
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
        { success: false, error: 'Only hirers can create payment intents' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createIntentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { bookingId } = validation.data

    // Find booking scoped to the authenticated hirer
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        hirerId: session.user.id,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
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

    if (booking.paymentStatus !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Payment has already been initiated for this booking' },
        { status: 400 }
      )
    }

    const amountInCents = Math.round(booking.agreedAmount * 100)

    const stripe = getStripe()

    // Create a PaymentIntent with manual capture for escrow hold
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      capture_method: 'manual',
      metadata: {
        bookingId: booking.id,
        hirerId: session.user.id,
        workerId: booking.workerId,
        jobTitle: booking.job.title,
      },
    })

    // Create a PaymentRecord for the escrow hold
    await prisma.paymentRecord.create({
      data: {
        bookingId: booking.id,
        userId: session.user.id,
        amount: booking.agreedAmount,
        type: 'escrow_hold',
        status: 'pending',
        externalId: paymentIntent.id,
        provider: 'stripe',
        description: `Escrow hold for "${booking.job.title}"`,
        metadata: {
          paymentIntentId: paymentIntent.id,
          jobId: booking.job.id,
          workerId: booking.workerId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: { clientSecret: paymentIntent.client_secret },
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
