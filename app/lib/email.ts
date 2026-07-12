import { render } from '@vue-email/render'
import { resend } from '~/lib/resend'
import WelcomeEmail from '~/emails/WelcomeEmail.vue'

export interface SendWelcomeEmailParams {
  to: string
  userName: string
  userEmail: string
  appName?: string
  baseUrl?: string
}

export async function sendWelcomeEmail({
  to,
  userName,
  userEmail,
  appName = 'YTShort',
  baseUrl = 'http://localhost:3000'
}: SendWelcomeEmailParams) {
  try {
    const html = await render(WelcomeEmail, {
      userName,
      userEmail,
      appName,
      baseUrl
    })

    const { data, error } = await resend.emails.send({
      from: process.env.NODE_ENV === 'production'
        ? 'onboarding@yourdomain.com'
        : 'onboarding@resend.dev',
      to: [process.env.NODE_ENV === 'production' ? to : 'delivered@resend.dev'],
      subject: `Welcome to ${appName}!`,
      html
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error)
    return { success: false, error }
  }
}
