import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { randomBytes, createHash } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 reset requests per minute per IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success: allowed } = rateLimit(
      getRateLimitKey(ip, 'auth/forgot-password'),
      { windowMs: 60_000, maxRequests: 3 }
    )
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we sent a password reset link.',
    })

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, password: true },
    })

    // If no user or user has no password (social auth only), still return success
    if (!user || !user.password) {
      return successResponse
    }

    // Delete any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    })

    // Generate a secure token
    const rawToken = randomBytes(32).toString('hex')
    const hashedToken = createHash('sha256').update(rawToken).digest('hex')

    // Store hashed token in DB (expires in 1 hour)
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: hashedToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // Send the raw token in the email (we hash it when verifying)
    await sendPasswordResetEmail(normalizedEmail, rawToken)

    return successResponse
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
