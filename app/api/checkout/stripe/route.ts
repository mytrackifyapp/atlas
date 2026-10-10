import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getCreditPack, isCreditPackId } from "@/lib/ai-credits/packs"
import { isCheckoutPlanId } from "@/lib/checkout/catalog"
import { isStripeConfigured, getStripePublishableKey } from "@/lib/stripe/config"
import { createStripeCheckoutSession } from "@/lib/stripe/sessions"

export const dynamic = "force-dynamic"

const bodySchema = z.union([
  z.object({
    kind: z.literal("subscription").optional().default("subscription"),
    planId: z.enum(["pro", "team"]),
    billingInterval: z.enum(["monthly", "annual"]),
  }),
  z.object({
    kind: z.literal("credits"),
    creditPackId: z.enum(["pack_250", "pack_500", "pack_1000"]),
  }),
])

export async function GET() {
  return NextResponse.json({
    configured: isStripeConfigured(),
    publishableKey: getStripePublishableKey() || null,
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Card checkout is not configured yet. Add a Stripe secret key." },
        { status: 503 },
      )
    }

    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Sign in to continue checkout" }, { status: 401 })
    }

    const body = bodySchema.parse(await request.json())
    const cancelQuery = new URLSearchParams()
    if (body.kind === "credits") {
      cancelQuery.set("mode", "credits")
      cancelQuery.set("pack", body.creditPackId)
      cancelQuery.set("pay", "card")
    } else {
      cancelQuery.set("plan", body.planId)
      cancelQuery.set("interval", body.billingInterval)
      cancelQuery.set("pay", "card")
    }

    const checkout =
      body.kind === "credits"
        ? await createStripeCheckoutSession({
            ownerId: session.user.id,
            email: session.user.email,
            name: session.user.name,
            kind: "credits",
            creditPackId: body.creditPackId,
            creditsAmount: isCreditPackId(body.creditPackId)
              ? getCreditPack(body.creditPackId).credits
              : undefined,
            cancelPath: `/checkout?${cancelQuery.toString()}`,
          })
        : await createStripeCheckoutSession({
            ownerId: session.user.id,
            email: session.user.email,
            name: session.user.name,
            kind: "subscription",
            planId: isCheckoutPlanId(body.planId) ? body.planId : undefined,
            billingInterval: body.billingInterval,
            cancelPath: `/checkout?${cancelQuery.toString()}`,
          })

    if (!checkout.client_secret) {
      return NextResponse.json({ error: "Stripe did not return a client secret" }, { status: 502 })
    }

    return NextResponse.json({
      clientSecret: checkout.client_secret,
      id: checkout.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 })
    }
    console.error("Stripe checkout error:", error)
    const message = error instanceof Error ? error.message : "Failed to start card checkout"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
