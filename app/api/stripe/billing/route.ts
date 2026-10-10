import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getAiSubscription } from "@/lib/ai-credits/service"
import { isStripeConfigured, isStripeSecretConfigured } from "@/lib/stripe/config"
import {
  detachPaymentMethod,
  getBillingSnapshot,
  setCancelAtPeriodEnd,
  setDefaultPaymentMethod,
  updateBillingProfile,
} from "@/lib/stripe/billing"

export const dynamic = "force-dynamic"

const mutationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("default_payment_method"),
    paymentMethodId: z.string().min(1),
  }),
  z.object({
    action: z.literal("detach_payment_method"),
    paymentMethodId: z.string().min(1),
  }),
  z.object({
    action: z.literal("update_profile"),
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().email().optional(),
  }),
  z.object({
    action: z.literal("cancel_subscription"),
    subscriptionId: z.string().min(1),
    cancelAtPeriodEnd: z.boolean(),
  }),
])

async function requireCustomerId(ownerId: string) {
  const subscription = await getAiSubscription(ownerId)
  const customerId = subscription.stripeCustomerId
  if (!customerId) {
    throw new Error("No Stripe customer on this account yet")
  }
  return customerId
}

export async function GET() {
  try {
    if (!isStripeSecretConfigured()) {
      return NextResponse.json({ configured: false, customer: null, paymentMethods: [], invoices: [], subscription: null, defaultPaymentMethodId: null })
    }

    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await getAiSubscription(session.user.id)
    const snapshot = await getBillingSnapshot(subscription.stripeCustomerId ?? null)
    return NextResponse.json(snapshot)
  } catch (error) {
    console.error("Stripe billing GET error:", error)
    return NextResponse.json({ error: "Could not load billing" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Card billing is not configured" }, { status: 503 })
    }

    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = mutationSchema.parse(await request.json())
    const customerId = await requireCustomerId(session.user.id)

    if (body.action === "default_payment_method") {
      await setDefaultPaymentMethod(customerId, body.paymentMethodId)
    } else if (body.action === "detach_payment_method") {
      await detachPaymentMethod(customerId, body.paymentMethodId)
    } else if (body.action === "update_profile") {
      await updateBillingProfile(customerId, { name: body.name, email: body.email })
    } else {
      await setCancelAtPeriodEnd(customerId, body.subscriptionId, body.cancelAtPeriodEnd)
    }

    const snapshot = await getBillingSnapshot(customerId)
    return NextResponse.json(snapshot)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid billing request" }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Could not update billing"
    console.error("Stripe billing POST error:", error)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
