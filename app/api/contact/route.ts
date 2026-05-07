import { NextResponse } from "next/server"
import { z } from "zod"

import { sendContactConfirmationEmail, sendContactEmail } from "@/lib/email/resend"

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  subject: z.string().trim().min(1).max(200),
  workEmail: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(5000),
  // Honeypot: bots fill this, humans won't.
  company: z.string().trim().max(200).optional().default(""),
})

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = contactSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid form data" },
        { status: 400 }
      )
    }

    if (parsed.data.company) {
      // Intentionally pretend success to avoid tipping off bots.
      return NextResponse.json({ ok: true })
    }

    const payload = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      subject: parsed.data.subject,
      workEmail: parsed.data.workEmail,
      message: parsed.data.message,
    }

    // Deliver to Trackify team + confirm to user.
    // If confirmation fails, we still treat the submission as received (best-effort),
    // but we log it so we can monitor deliverability issues.
    await sendContactEmail(payload)
    const confirmation = await sendContactConfirmationEmail(payload).catch((e) => e)
    if (confirmation instanceof Error) {
      console.error("Contact confirmation email failed:", confirmation)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Contact email failed:", err)
    return NextResponse.json(
      { ok: false, error: "Failed to send message" },
      { status: 500 }
    )
  }
}

