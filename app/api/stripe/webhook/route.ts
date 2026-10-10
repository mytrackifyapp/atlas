import { NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"

import { getStripe } from "@/lib/stripe/client"
import {
  applyStripeSubscription,
  fulfillCheckoutSession,
  fulfillSubscriptionRenewal,
} from "@/lib/stripe/fulfill"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set" }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  const payload = await request.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await fulfillCheckoutSession(event.data.object)
        break
      case "invoice.paid":
        await fulfillSubscriptionRenewal(event.data.object)
        break
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applyStripeSubscription(event.data.object)
        break
      default:
        break
    }
  } catch (error) {
    console.error("Stripe webhook handler failed:", event.type, error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
