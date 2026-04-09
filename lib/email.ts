import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: email,
    subject: 'Welcome to your workspace!',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your account has been created. Get started by creating your first workspace.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding">Get started</a>
    `,
  })
}
