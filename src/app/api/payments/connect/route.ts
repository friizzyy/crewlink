import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'

// POST /api/payments/connect - Create Stripe Express connected account for worker payouts
export async function POST(request: NextRequest) {
  // Suppress unused variable warning - request is required by Next.js route handler signature
  void request

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
        { success: false, error: 'Only workers can connect a payout account' },
        { status: 403 }
      )
    }

    const stripe = getStripe()

    // Create a Stripe Express connected account
    const account = await stripe.accounts.create({
      type: 'express',
      email: session.user.email || undefined,
      metadata: {
        userId: session.user.id,
      },
      capabilities: {
        transfers: { requested: true },
      },
    })

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/work/settings/payments?refresh=true`,
      return_url: `${process.env.NEXTAUTH_URL}/work/settings/payments?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      success: true,
      data: {
        url: accountLink.url,
        accountId: account.id,
      },
    })
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payout account' },
      { status: 500 }
    )
  }
}
