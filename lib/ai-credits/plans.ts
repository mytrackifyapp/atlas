import type { PricingPlanId } from "@/lib/pricing-plans"

import type { AiCreditPlanId } from "@/lib/ai-credits/types"

export type AiCreditPlanConfig = {
  monthlyCredits: number
  label: string
  /** Max specialist agents installable on this plan (null = unlimited). */
  maxAgents: number | null
}

export const AI_CREDIT_PLANS: Record<AiCreditPlanId, AiCreditPlanConfig> = {
  free: {
    monthlyCredits: 50,
    label: "Free",
    maxAgents: 0,
  },
  pro: {
    monthlyCredits: 500,
    label: "Pro",
    maxAgents: 3,
  },
  team: {
    monthlyCredits: 2_500,
    label: "Team",
    maxAgents: null,
  },
  enterprise: {
    monthlyCredits: 100_000,
    label: "Enterprise",
    maxAgents: null,
  },
}

export const AI_CREDIT_COSTS = {
  /** Minimum credits charged per Finna message. */
  finnaChatMin: 1,
  /** Minimum credits charged per specialist agent message. */
  agentChatMin: 2,
  /** Extra minimum when delegation tools run. */
  delegationMin: 3,
  /** Background / queued chat task. */
  backgroundChatMin: 2,
  /** Scheduled agent run (e.g. weekly digest). */
  agentRunMin: 5,
  /** TTS — credits per 500 characters. */
  voiceTtsPer500Chars: 1,
  /** STT — flat minimum per transcription. */
  voiceSttMin: 2,
  /** Embeddings — credits per batch ingest. */
  embeddingMin: 1,
} as const

export function getMonthlyCreditsForPlan(planId: PricingPlanId): number {
  return AI_CREDIT_PLANS[planId]?.monthlyCredits ?? AI_CREDIT_PLANS.free.monthlyCredits
}

export function getMaxAgentsForPlan(planId: PricingPlanId): number | null {
  return AI_CREDIT_PLANS[planId]?.maxAgents ?? AI_CREDIT_PLANS.free.maxAgents
}
