import {
  getCheckoutAmountUsd,
  getCreditPackAmountUsd,
  type CheckoutPlanId,
} from "@/lib/checkout/catalog"
import { getCreditPack, type CreditPackId } from "@/lib/ai-credits/packs"
import { PRICING_PLANS, type BillingInterval } from "@/lib/pricing-plans"
import type Stripe from "stripe"

function envPrice(name: string) {
  return process.env[name]?.trim() || null
}

function subscriptionPriceEnv(planId: CheckoutPlanId, interval: BillingInterval) {
  const key =
    planId === "pro"
      ? interval === "annual"
        ? "STRIPE_PRICE_PRO_ANNUAL"
        : "STRIPE_PRICE_PRO_MONTHLY"
      : interval === "annual"
        ? "STRIPE_PRICE_TEAM_ANNUAL"
        : "STRIPE_PRICE_TEAM_MONTHLY"
  return envPrice(key)
}

function creditPriceEnv(packId: CreditPackId) {
  if (packId === "pack_250") return envPrice("STRIPE_PRICE_CREDITS_250")
  if (packId === "pack_500") return envPrice("STRIPE_PRICE_CREDITS_500")
  return envPrice("STRIPE_PRICE_CREDITS_1000")
}

export function subscriptionLineItem(
  planId: CheckoutPlanId,
  interval: BillingInterval,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = subscriptionPriceEnv(planId, interval)
  if (priceId) return { price: priceId, quantity: 1 }

  const plan = PRICING_PLANS.find((item) => item.id === planId)!
  const amountUsd = getCheckoutAmountUsd(planId, interval)

  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: Math.round(amountUsd * 100),
      recurring: { interval: interval === "annual" ? "year" : "month" },
      product_data: {
        name: `Trackify ${plan.name}`,
        description: plan.description,
      },
    },
  }
}

export function creditPackLineItem(
  packId: CreditPackId,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = creditPriceEnv(packId)
  if (priceId) return { price: priceId, quantity: 1 }

  const pack = getCreditPack(packId)
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: Math.round(getCreditPackAmountUsd(packId) * 100),
      product_data: {
        name: `Trackify AI credits · ${pack.label}`,
        description: pack.description,
      },
    },
  }
}
