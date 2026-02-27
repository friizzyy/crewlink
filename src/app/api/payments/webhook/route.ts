import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'

// POST /api/payments/webhook - Stripe webhook handler (no auth - Stripe calls this)
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const stripe = getStripe()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Webhook signature verification failed:', message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata?.bookingId

        if (bookingId) {
          // Update payment record status to succeeded
          await prisma.paymentRecord.updateMany({
            where: {
              externalId: paymentIntent.id,
              bookingId: bookingId,
            },
            data: {
              status: 'completed',
              processedAt: new Date(),
            },
          })

          console.log(`Payment succeeded for booking ${bookingId}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata?.bookingId

        if (bookingId) {
          // Update payment record status to failed
          await prisma.paymentRecord.updateMany({
            where: {
              externalId: paymentIntent.id,
              bookingId: bookingId,
            },
            data: {
              status: 'failed',
              processedAt: new Date(),
            },
          })

          // Notify the hirer about the failure
          const hirerId = paymentIntent.metadata?.hirerId
          if (hirerId) {
            await prisma.notification.create({
              data: {
                userId: hirerId,
                type: 'payment_failed',
                title: 'Payment Failed',
                body: `Your payment for "${paymentIntent.metadata?.jobTitle || 'a booking'}" has failed. Please update your payment method.`,
                data: { bookingId, paymentIntentId: paymentIntent.id },
                actionUrl: `/hiring/bookings/${bookingId}`,
              },
            })
          }

          console.log(`Payment failed for booking ${bookingId}`)
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        console.log(`Stripe Connect account updated: ${account.id}`)
        break
      }

      default: {
        console.log(`Unhandled webhook event type: ${event.type}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
