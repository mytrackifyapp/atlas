import type { CreditPackId } from "@/lib/ai-credits/packs"
import type { CheckoutPlanId } from "@/lib/checkout/catalog"
import type { BillingInterval } from "@/lib/pricing-plans"
import { getStripe } from "@/lib/stripe/client"
import { getAppUrl } from "@/lib/stripe/config"
import { creditPackLineItem, subscriptionLineItem } from "@/lib/stripe/catalog"
import { getOrCreateStripeCustomer } from "@/lib/stripe/customers"

const trialDays = () => {
  const raw = Number(process.env.STRIPE_TRIAL_DAYS ?? "")
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0
}

export async function createStripeCheckoutSession(input: {
  ownerId: string
  email?: string | null
  name?: string | null
  kind: "subscription" | "credits"
  planId?: CheckoutPlanId
  billingInterval?: BillingInterval
  creditPackId?: CreditPackId
  creditsAmount?: number
  cancelPath: string
}) {
  const stripe = getStripe()
  const customer = await getOrCreateStripeCustomer({
    ownerId: input.ownerId,
    email: input.email,
    name: input.name,
  })
  const origin = getAppUrl()
  const successKind = input.kind === "credits" ? "credits" : "subscription"

  if (input.kind === "credits") {
    if (!input.creditPackId || !input.creditsAmount) {
      throw new Error("Credit pack checkout requires a pack")
    }
    return stripe.checkout.sessions.create({
      ui_mode: "elements",
      mode: "payment",
      customer,
      line_items: [creditPackLineItem(input.creditPackId)],
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&kind=${successKind}`,
      client_reference_id: input.ownerId,
      metadata: {
        ownerId: input.ownerId,
        kind: "credits",
        creditPackId: input.creditPackId,
        creditsAmount: String(input.creditsAmount),
      },
    })
  }

  if (!input.planId || !input.billingInterval) {
    throw new Error("Subscription checkout requires a plan")
  }

  const days = trialDays()
  return stripe.checkout.sessions.create({
    ui_mode: "elements",
    mode: "subscription",
    customer,
    line_items: [subscriptionLineItem(input.planId, input.billingInterval)],
    return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&kind=${successKind}`,
    client_reference_id: input.ownerId,
    metadata: {
      ownerId: input.ownerId,
      kind: "subscription",
      planId: input.planId,
      billingInterval: input.billingInterval,
    },
    subscription_data: {
      ...(days ? { trial_period_days: days } : {}),
      metadata: {
        ownerId: input.ownerId,
        planId: input.planId,
        billingInterval: input.billingInterval,
      },
    },
  })
}
