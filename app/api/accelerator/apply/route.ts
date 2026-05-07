import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"
import { sendAcceleratorApplicationEmail, sendAcceleratorConfirmationEmail } from "@/lib/email/resend"

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  companyName: z.string().trim().min(1).max(120),
  website: z.string().trim().url().optional().nullable(),
  stage: z.string().trim().min(1).max(60),
  location: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(5000).optional().default(""),
  cohort: z.string().trim().min(1).max(120),
  // Honeypot
  company: z.string().trim().max(200).optional().default(""),
})

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const json = await request.json().catch(() => null)
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid application" }, { status: 400 })
    }

    if (parsed.data.company) {
      return NextResponse.json({ ok: true })
    }

    const db = await getDatabase()

    const doc = {
      ownerId: session.user.id,
      cohort: parsed.data.cohort,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      companyName: parsed.data.companyName,
      website: parsed.data.website ?? null,
      stage: parsed.data.stage,
      location: parsed.data.location,
      notes: parsed.data.notes ?? "",
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Basic de-dupe: one application per email per cohort per user
    const existing = await db.collection("accelerator_applications").findOne({
      ownerId: session.user.id,
      cohort: doc.cohort,
      email: doc.email,
    })

    if (!existing) {
      await db.collection("accelerator_applications").insertOne(doc)
    }

    // Notify Trackify team + confirm to applicant (best-effort confirmation)
    await sendAcceleratorApplicationEmail(doc)
    const confirmation = await sendAcceleratorConfirmationEmail(doc).catch((e) => e)
    if (confirmation instanceof Error) {
      console.error("Accelerator confirmation email failed:", confirmation)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Accelerator apply error:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}

