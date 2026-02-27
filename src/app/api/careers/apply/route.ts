import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { z } from 'zod'

const applicationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  location: z.string().min(1, 'Location is required'),
  linkedIn: z.string().optional(),
  resumeLink: z.string().optional(),
  note: z.string().min(20, 'Please write at least a few sentences'),
  role: z.string().min(1, 'Role is required'),
  roleSlug: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success: allowed } = rateLimit(
      getRateLimitKey(ip, 'careers/apply'),
      { windowMs: 300_000, maxRequests: 3 }
    )
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many applications. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validation = applicationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, location, linkedIn, resumeLink, note, role } = validation.data

    if (!process.env.RESEND_API_KEY) {
      console.warn('[Careers] RESEND_API_KEY not set. Logging application.')
      console.log(`[Careers] Applicant: ${name} <${email}> | Role: ${role} | Location: ${location}`)
      return NextResponse.json({ success: true })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const careersEmail = process.env.CAREERS_EMAIL || 'careers@crewlink.com'

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'CrewLink <noreply@crewlink.com>',
      to: careersEmail,
      replyTo: email,
      subject: `[Application] ${role} — ${name}`,
      html: `
        <h2>New Job Application</h2>
        <p><strong>Position:</strong> ${role}</p>
        <hr />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Location:</strong> ${location}</p>
        ${linkedIn ? `<p><strong>LinkedIn/Portfolio:</strong> <a href="${linkedIn}">${linkedIn}</a></p>` : ''}
        ${resumeLink ? `<p><strong>Resume:</strong> <a href="${resumeLink}">${resumeLink}</a></p>` : ''}
        <hr />
        <h3>About the applicant</h3>
        <p>${note.replace(/\n/g, '<br />')}</p>
      `,
    })

    // Send confirmation to applicant
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'CrewLink <noreply@crewlink.com>',
      to: email,
      subject: `Application received — ${role} at CrewLink`,
      html: `
        <h2>Thanks for applying, ${name}!</h2>
        <p>We received your application for the <strong>${role}</strong> position.</p>
        <p>Our team will review it and get back to you within a week.</p>
        <br />
        <p>— The CrewLink Team</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Careers application error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}
