import type { PricingPlanId } from "@/lib/pricing-plans"

export type AiCreditPlanId = PricingPlanId

export type AiCreditFeature =
  | "finna_chat"
  | "agent_chat"
  | "agent_delegation"
  | "agent_run"
  | "agent_background"
  | "voice_tts"
  | "voice_stt"
  | "embedding"

export type AiSubscriptionStatus = "active" | "trial" | "cancelled"

export type AiSubscription = {
  ownerId: string
  planId: AiCreditPlanId
  status: AiSubscriptionStatus
  updatedAt: string
}

export type AiCreditBalance = {
  ownerId: string
  planId: AiCreditPlanId
  balance: number
  monthlyAllowance: number
  periodStart: string
  periodEnd: string
  updatedAt: string
}

export type AiUsageLedgerEntry = {
  ownerId: string
  feature: AiCreditFeature
  credits: number
  inputTokens?: number
  outputTokens?: number
  model?: string
  agentId?: string
  correlationId?: string
  description?: string
  createdAt: Date
}

export type AiCreditSnapshot = {
  planId: AiCreditPlanId
  planLabel: string
  balance: number
  monthlyAllowance: number
  periodStart: string
  periodEnd: string
  percentUsed: number
}

export class InsufficientCreditsError extends Error {
  readonly balance: number
  readonly required: number

  constructor(balance: number, required: number) {
    super(
      `Insufficient AI credits. You need at least ${required} credit${required === 1 ? "" : "s"} but have ${balance}.`,
    )
    this.name = "InsufficientCreditsError"
    this.balance = balance
    this.required = required
  }
}
