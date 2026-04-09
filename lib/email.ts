import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'noreply@yourdomain.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to ProjectFlow!',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your account has been created. Get started by creating your first workspace.</p>
      <a href="${APP_URL}/onboarding">Get started →</a>
    `,
  })
}

export async function sendInviteEmail(
  email: string,
  workspaceName: string,
  inviterName: string,
  token: string
) {
  const link = `${APP_URL}/invite/${token}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${inviterName} invited you to ${workspaceName} on ProjectFlow`,
    html: `
      <h1>You're invited!</h1>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on ProjectFlow.</p>
      <p>This invite expires in 7 days.</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none;">
        Accept invite →
      </a>
      <p style="color:#666;font-size:12px;margin-top:16px;">Or copy this link: ${link}</p>
    `,
  })
}
