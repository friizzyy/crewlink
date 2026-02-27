import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'CrewLink <noreply@crewlink.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set. Skipping email send.')
    console.log(`[Email] Would send to ${to}: ${subject}`)
    return { success: true, skipped: true }
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('[Email] Failed to send:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return { success: true, id: data?.id }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  return sendEmail({
    to: email,
    subject: 'Reset your CrewLink password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <tr>
              <td align="center" style="padding-bottom: 32px;">
                <span style="font-size: 24px; font-weight: bold; color: #0ea5e9;">CrewLink</span>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
                <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Reset your password</h1>
                <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                  <tr>
                    <td style="background: linear-gradient(to right, #06b6d4, #2563eb); border-radius: 8px; padding: 14px 32px;">
                      <a href="${resetUrl}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                  If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                </p>
                <p style="color: #475569; font-size: 12px; margin: 0; word-break: break-all;">
                  Or copy this link: ${resetUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 32px;">
                <p style="color: #475569; font-size: 12px; margin: 0;">
                  &copy; ${new Date().getFullYear()} CrewLink. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to CrewLink!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <tr>
              <td align="center" style="padding-bottom: 32px;">
                <span style="font-size: 24px; font-weight: bold; color: #0ea5e9;">CrewLink</span>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
                <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Welcome, ${name}!</h1>
                <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Your CrewLink account is ready. Start connecting with skilled workers and hirers in your area.
                </p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background: linear-gradient(to right, #06b6d4, #2563eb); border-radius: 8px; padding: 14px 32px;">
                      <a href="${APP_URL}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                        Get Started
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 32px;">
                <p style="color: #475569; font-size: 12px; margin: 0;">
                  &copy; ${new Date().getFullYear()} CrewLink. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export async function sendBidAcceptedEmail(
  email: string,
  workerName: string,
  jobTitle: string,
  jobId: string
) {
  const jobUrl = `${APP_URL}/work/job/${jobId}`

  return sendEmail({
    to: email,
    subject: `Your bid for "${jobTitle}" was accepted!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <tr>
              <td align="center" style="padding-bottom: 32px;">
                <span style="font-size: 24px; font-weight: bold; color: #0ea5e9;">CrewLink</span>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
                <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 16px 0;">Bid Accepted!</h1>
                <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Great news, ${workerName}! Your bid for <strong style="color: #ffffff;">"${jobTitle}"</strong> has been accepted. Head to the job to coordinate details with the hirer.
                </p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background: linear-gradient(to right, #06b6d4, #2563eb); border-radius: 8px; padding: 14px 32px;">
                      <a href="${jobUrl}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                        View Job Details
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 32px;">
                <p style="color: #475569; font-size: 12px; margin: 0;">
                  &copy; ${new Date().getFullYear()} CrewLink. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}
