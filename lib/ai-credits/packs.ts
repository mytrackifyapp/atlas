export type CreditPackId = "pack_250" | "pack_500" | "pack_1000"

export type CreditPack = {
  id: CreditPackId
  label: string
  credits: number
  priceUsd: number
  description: string
}

export const AI_CREDIT_PACKS: Record<CreditPackId, CreditPack> = {
  pack_250: {
    id: "pack_250",
    label: "250 credits",
    credits: 250,
    priceUsd: 8,
    description: "Quick top-up for a busy week",
  },
  pack_500: {
    id: "pack_500",
    label: "500 credits",
    credits: 500,
    priceUsd: 15,
    description: "Best value for regular AI usage",
  },
  pack_1000: {
    id: "pack_1000",
    label: "1,000 credits",
    credits: 1000,
    priceUsd: 28,
    description: "Power users and heavy agent workflows",
  },
}

export const CREDIT_PACK_IDS = Object.keys(AI_CREDIT_PACKS) as CreditPackId[]

export function isCreditPackId(id: string): id is CreditPackId {
  return id in AI_CREDIT_PACKS
}

export function getCreditPack(id: CreditPackId): CreditPack {
  return AI_CREDIT_PACKS[id]
}
