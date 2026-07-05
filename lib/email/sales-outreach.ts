import "server-only"

import { getResend } from "@/lib/email/resend"

function getSalesFromAddress() {
  return (
    process.env.RESEND_SALES_FROM ??
    process.env.RESEND_CEO_FROM ??
    "Trackify Sales <hey@mytrackify.com>"
  )
}

export async function sendSalesOutreachEmail(input: {
  to: string
  subject: string
  body: string
  replyTo?: string
}): Promise<{ id: string }> {
  const to = input.to.trim()
  if (!to) throw new Error("Recipient email is required")

  const resend = getResend()
  const textBody = `${input.body.trim()}\n\n---\nSent via Trackify Sales`

  const result = await resend.emails.send({
    from: getSalesFromAddress(),
    to,
    subject: input.subject.trim(),
    text: textBody,
    replyTo: input.replyTo,
  })

  if (result.error) {
    throw new Error(result.error.message || "Failed to send email")
  }

  return { id: result.data?.id ?? "unknown" }
}
