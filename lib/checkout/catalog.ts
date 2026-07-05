import { PRICING_PLANS, type BillingInterval, type PricingPlanId } from "@/lib/pricing-plans"
import {
  AI_CREDIT_PACKS,
  CREDIT_PACK_IDS,
  getCreditPack,
  isCreditPackId,
  type CreditPackId,
} from "@/lib/ai-credits/packs"

export type CheckoutPlanId = Extract<PricingPlanId, "pro" | "team">

const CHECKOUT_PLAN_IDS: CheckoutPlanId[] = ["pro", "team"]

export function isCheckoutPlanId(planId: string): planId is CheckoutPlanId {
  return CHECKOUT_PLAN_IDS.includes(planId as CheckoutPlanId)
}

export function getCheckoutAmountUsd(planId: CheckoutPlanId, interval: BillingInterval): number {
  const plan = PRICING_PLANS.find((p) => p.id === planId)
  if (!plan) throw new Error("Invalid plan")

  if (interval === "annual") {
    const monthly = plan.annualPrice
    if (monthly === null || monthly <= 0) throw new Error("Plan not available for annual checkout")
    return monthly * 12
  }

  const monthly = plan.monthlyPrice
  if (monthly === null || monthly <= 0) throw new Error("Plan not available for monthly checkout")
  return monthly
}

export function getCreditPackAmountUsd(packId: CreditPackId): number {
  if (!isCreditPackId(packId)) throw new Error("Invalid credit pack")
  return getCreditPack(packId).priceUsd
}

export function getCheckoutPlanSummary(planId: CheckoutPlanId, interval: BillingInterval) {
  const plan = PRICING_PLANS.find((p) => p.id === planId)!
  const amountUsd = getCheckoutAmountUsd(planId, interval)

  return {
    kind: "subscription" as const,
    planId,
    planName: plan.name,
    description: plan.description,
    billingInterval: interval,
    amountUsd,
    amountLabel:
      interval === "annual"
        ? `$${amountUsd} / year`
        : `$${amountUsd} / month`,
    creditsPerMonth:
      planId === "pro" ? 500 : 2_500,
  }
}

export function getCreditPackSummary(packId: CreditPackId) {
  const pack = getCreditPack(packId)
  return {
    kind: "credits" as const,
    creditPackId: packId,
    packLabel: pack.label,
    description: pack.description,
    credits: pack.credits,
    amountUsd: pack.priceUsd,
    amountLabel: `$${pack.priceUsd}`,
  }
}

export const CHECKOUT_STABLECOINS = ["USDC", "USDT"] as const

export { AI_CREDIT_PACKS, CREDIT_PACK_IDS, isCreditPackId, type CreditPackId }
