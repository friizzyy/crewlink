import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const payoutSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
})

// POST /api/payments/payout - Request a payout (worker only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'worker') {
      return NextResponse.json(
        { success: false, error: 'Only workers can request payouts' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = payoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { amount } = validation.data

    return NextResponse.json({
      success: true,
      data: {
        status: 'pending',
        amount,
        message: 'Please connect your Stripe account to receive payouts. Visit your payment settings to set up a connected account.',
      },
    })
  } catch (error) {
    console.error('Error processing payout request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process payout request' },
      { status: 500 }
    )
  }
}
