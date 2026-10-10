import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getStripe } from "@/lib/stripe/client"
import { isStripeSecretConfigured } from "@/lib/stripe/config"
import { fulfillCheckoutSession } from "@/lib/stripe/fulfill"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    if (!isStripeSecretConfigured()) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 })
    }

    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = request.nextUrl.searchParams.get("session_id")?.trim()
    if (!sessionId) {
      return NextResponse.json({ error: "Missing checkout session" }, { status: 400 })
    }

    const checkout = await getStripe().checkout.sessions.retrieve(sessionId)
    if (checkout.metadata?.ownerId && checkout.metadata.ownerId !== session.user.id) {
      return NextResponse.json({ error: "This checkout session belongs to another account" }, { status: 403 })
    }

    if (checkout.status === "complete" || checkout.payment_status === "paid") {
      await fulfillCheckoutSession(checkout)
    }

    return NextResponse.json({
      status: checkout.status,
      paymentStatus: checkout.payment_status,
      kind: checkout.metadata?.kind ?? (checkout.mode === "subscription" ? "subscription" : "credits"),
      planId: checkout.metadata?.planId ?? null,
    })
  } catch (error) {
    console.error("Stripe session lookup failed:", error)
    return NextResponse.json({ error: "Could not load checkout session" }, { status: 500 })
  }
}
