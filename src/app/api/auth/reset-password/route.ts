import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { createHash } from 'crypto'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per minute per IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success: allowed } = rateLimit(
      getRateLimitKey(ip, 'auth/reset-password'),
      { windowMs: 60_000, maxRequests: 5 }
    )
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    // Hash the provided token to compare with stored hash
    const hashedToken = createHash('sha256').update(token).digest('hex')

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: hashedToken,
        expires: { gt: new Date() }, // Not expired
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    // Find the user by email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Delete the used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: verificationToken.identifier },
    })

    // Invalidate all existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
