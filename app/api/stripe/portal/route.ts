import { NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getStripe } from "@/lib/stripe/client"
import { isStripeSecretConfigured, getAppUrl } from "@/lib/stripe/config"
import { getOrCreateStripeCustomer } from "@/lib/stripe/customers"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    if (!isStripeSecretConfigured()) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 })
    }

    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customer = await getOrCreateStripeCustomer({
      ownerId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })

    const portal = await getStripe().billingPortal.sessions.create({
      customer,
      return_url: `${getAppUrl()}${
        session.user.role === "founder" ? "/founder/settings" : "/dashboard/settings"
      }`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (error) {
    console.error("Stripe portal error:", error)
    return NextResponse.json({ error: "Could not open billing portal" }, { status: 500 })
  }
}
