/**
 * Email utility functions for sending transactional emails
 */

interface SendInviteEmailParams {
  to: string
  organizationName: string
  inviterName: string | null
  inviterEmail: string
  role: string
  inviteLink: string
}

/**
 * Send organization invitation email
 */
export async function sendInviteEmail({
  to,
  organizationName,
  inviterName,
  inviterEmail,
  role,
  inviteLink,
}: SendInviteEmailParams): Promise<{ success: boolean; error?: string }> {
  // Only send emails in production or if EMAIL_ENABLED is true
  if (process.env.NODE_ENV !== "production" && process.env.EMAIL_ENABLED !== "true") {
    console.log("[Email] Would send invite email:", {
      to,
      organizationName,
      inviteLink,
    })
    return { success: true }
  }

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email send")
    return { success: false, error: "Email service not configured" }
  }

  try {
    // Dynamic import to avoid bundling in client
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    const fromEmail = process.env.EMAIL_FROM || "noreply@devsync.app"
    const fromName = process.env.EMAIL_FROM_NAME || "DevSync"
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const inviterDisplay = inviterName || inviterEmail

    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: `${inviterDisplay} invited you to join ${organizationName} on DevSync`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Organization Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">You've been invited!</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin: 0 0 20px 0;">
                <strong>${inviterDisplay}</strong> has invited you to join <strong>${organizationName}</strong> on DevSync as a <strong>${role.toLowerCase()}</strong>.
              </p>
              
              <p style="font-size: 16px; margin: 0 0 30px 0; color: #6b7280;">
                DevSync is a code snippet manager that helps teams organize and share code snippets. Click the button below to accept the invitation and get started.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" 
                   style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #667eea; word-break: break-all;">${inviteLink}</a>
              </p>
              
              <p style="font-size: 12px; color: #9ca3af; margin: 30px 0 0 0;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">This email was sent by DevSync</p>
              <p style="margin: 5px 0 0 0;">
                <a href="${baseUrl}" style="color: #667eea; text-decoration: none;">Visit DevSync</a>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
You've been invited to join ${organizationName} on DevSync!

${inviterDisplay} has invited you to join ${organizationName} as a ${role.toLowerCase()}.

DevSync is a code snippet manager that helps teams organize and share code snippets.

Accept your invitation by clicking this link:
${inviteLink}

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.

---
This email was sent by DevSync
${baseUrl}
      `.trim(),
    })

    if (error) {
      console.error("[Email] Failed to send invite email:", error)
      return { success: false, error: error.message || "Failed to send email" }
    }

    return { success: true }
  } catch (error) {
    console.error("[Email] Error sending invite email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}
