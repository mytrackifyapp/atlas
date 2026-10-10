import { NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { isStripeConfigured } from "@/lib/stripe/config"
import { createBillingSetupIntent } from "@/lib/stripe/billing"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Card billing is not configured" }, { status: 503 })
    }

    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const setup = await createBillingSetupIntent({
      ownerId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })

    return NextResponse.json(setup)
  } catch (error) {
    console.error("Stripe setup intent error:", error)
    const message = error instanceof Error ? error.message : "Could not start card setup"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
