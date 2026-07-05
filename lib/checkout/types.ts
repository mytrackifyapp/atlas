import type { BillingInterval, PricingPlanId } from "@/lib/pricing-plans"
import type { CreditPackId } from "@/lib/ai-credits/packs"

export type CheckoutStablecoin = "USDC" | "USDT"

export type CheckoutChainId = "base" | "polygon" | "ethereum"

export type CheckoutKind = "subscription" | "credits"

export type CheckoutIntentStatus =
  | "pending"
  | "submitted"
  | "confirmed"
  | "expired"
  | "failed"

export type CheckoutIntent = {
  id: string
  ownerId: string
  kind: CheckoutKind
  planId?: PricingPlanId
  billingInterval?: BillingInterval
  creditPackId?: CreditPackId
  creditsAmount?: number
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
  amountUsd: number
  amountAtomic: string
  treasuryAddress: string
  tokenAddress: string
  payerAddress?: string
  txHash?: string
  status: CheckoutIntentStatus
  expiresAt: string
  confirmedAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
}
