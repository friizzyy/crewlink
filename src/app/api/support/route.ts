import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { z } from 'zod'

const supportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  category: z.string().min(1, 'Category is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success: allowed } = rateLimit(
      getRateLimitKey(ip, 'support'),
      { windowMs: 60_000, maxRequests: 3 }
    )
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validation = supportSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, category, message } = validation.data

    if (!process.env.RESEND_API_KEY) {
      console.warn('[Support] RESEND_API_KEY not set. Logging support request.')
      console.log(`[Support] From: ${name} <${email}> | Category: ${category} | Message: ${message}`)
      return NextResponse.json({ success: true })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@crewlink.com'

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'CrewLink <noreply@crewlink.com>',
      to: supportEmail,
      replyTo: email,
      subject: `[Support] ${category} — from ${name}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support form error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
