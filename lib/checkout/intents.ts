import { randomUUID } from "crypto"

import type { BillingInterval } from "@/lib/pricing-plans"
import { getCreditPack, type CreditPackId } from "@/lib/ai-credits/packs"
import {
  getCheckoutAmountUsd,
  getCreditPackAmountUsd,
  type CheckoutPlanId,
} from "@/lib/checkout/catalog"
import {
  atomicToDisplay,
  getChainConfig,
  usdToAtomic,
  type ChainConfig,
} from "@/lib/checkout/chains"
import type {
  CheckoutChainId,
  CheckoutIntent,
  CheckoutIntentStatus,
  CheckoutStablecoin,
} from "@/lib/checkout/types"
import { getDatabase } from "@/lib/db"

const INTENT_TTL_MS = 30 * 60 * 1000

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await db.collection("checkout_intents").createIndex({ id: 1 }, { unique: true })
  await db.collection("checkout_intents").createIndex({ ownerId: 1, createdAt: -1 })
  await db.collection("checkout_intents").createIndex({ txHash: 1 }, { sparse: true })
  await db.collection("checkout_intents").createIndex({ status: 1, expiresAt: 1 })
  await db.collection("checkout_payments").createIndex({ txHash: 1 }, { unique: true })
  indexesEnsured = true
}

function toIntent(doc: Record<string, unknown>): CheckoutIntent {
  return {
    id: String(doc.id),
    ownerId: String(doc.ownerId),
    kind: (doc.kind as CheckoutIntent["kind"]) ?? "subscription",
    planId: doc.planId as CheckoutIntent["planId"],
    billingInterval: doc.billingInterval as BillingInterval | undefined,
    creditPackId: doc.creditPackId as CreditPackId | undefined,
    creditsAmount:
      typeof doc.creditsAmount === "number" ? doc.creditsAmount : undefined,
    stablecoin: doc.stablecoin as CheckoutStablecoin,
    chainId: doc.chainId as CheckoutChainId,
    amountUsd: Number(doc.amountUsd),
    amountAtomic: String(doc.amountAtomic),
    treasuryAddress: String(doc.treasuryAddress),
    tokenAddress: String(doc.tokenAddress),
    payerAddress: doc.payerAddress ? String(doc.payerAddress) : undefined,
    txHash: doc.txHash ? String(doc.txHash) : undefined,
    status: doc.status as CheckoutIntentStatus,
    expiresAt: new Date(doc.expiresAt as Date).toISOString(),
    confirmedAt: doc.confirmedAt
      ? new Date(doc.confirmedAt as Date).toISOString()
      : undefined,
    failureReason: doc.failureReason ? String(doc.failureReason) : undefined,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  }
}

export async function createCheckoutIntent(input: {
  ownerId: string
  planId: CheckoutPlanId
  billingInterval: BillingInterval
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
  payerAddress?: string
}): Promise<CheckoutIntent & { amountDisplay: string; chain: ChainConfig }> {
  await ensureIndexes()
  const chain = getChainConfig(input.chainId)
  const token = chain.tokens[input.stablecoin]
  const amountUsd = getCheckoutAmountUsd(input.planId, input.billingInterval)
  const amountAtomic = usdToAtomic(amountUsd, token.decimals)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + INTENT_TTL_MS)

  const intent: CheckoutIntent = {
    id: randomUUID(),
    ownerId: input.ownerId,
    kind: "subscription",
    planId: input.planId,
    billingInterval: input.billingInterval,
    stablecoin: input.stablecoin,
    chainId: input.chainId,
    amountUsd,
    amountAtomic: amountAtomic.toString(),
    treasuryAddress: chain.treasuryAddress,
    tokenAddress: token.address,
    payerAddress: input.payerAddress?.toLowerCase(),
    status: "pending",
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  const db = await getDatabase()
  await db.collection("checkout_intents").insertOne({
    ...intent,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  })

  return {
    ...intent,
    amountDisplay: atomicToDisplay(amountAtomic, token.decimals),
    chain,
  }
}

export async function createCreditPackIntent(input: {
  ownerId: string
  creditPackId: CreditPackId
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
  payerAddress?: string
}): Promise<CheckoutIntent & { amountDisplay: string; chain: ChainConfig }> {
  await ensureIndexes()
  const chain = getChainConfig(input.chainId)
  const token = chain.tokens[input.stablecoin]
  const pack = getCreditPack(input.creditPackId)
  const amountUsd = getCreditPackAmountUsd(input.creditPackId)
  const amountAtomic = usdToAtomic(amountUsd, token.decimals)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + INTENT_TTL_MS)

  const intent: CheckoutIntent = {
    id: randomUUID(),
    ownerId: input.ownerId,
    kind: "credits",
    creditPackId: input.creditPackId,
    creditsAmount: pack.credits,
    stablecoin: input.stablecoin,
    chainId: input.chainId,
    amountUsd,
    amountAtomic: amountAtomic.toString(),
    treasuryAddress: chain.treasuryAddress,
    tokenAddress: token.address,
    payerAddress: input.payerAddress?.toLowerCase(),
    status: "pending",
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  const db = await getDatabase()
  await db.collection("checkout_intents").insertOne({
    ...intent,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  })

  return {
    ...intent,
    amountDisplay: atomicToDisplay(amountAtomic, token.decimals),
    chain,
  }
}

export async function getCheckoutIntent(
  intentId: string,
  ownerId?: string,
): Promise<CheckoutIntent | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const query: Record<string, unknown> = { id: intentId }
  if (ownerId) query.ownerId = ownerId
  const doc = await db.collection("checkout_intents").findOne(query)
  if (!doc) return null
  return toIntent(doc as Record<string, unknown>)
}

export async function markIntentSubmitted(
  intentId: string,
  ownerId: string,
  input: { txHash: string; payerAddress?: string },
): Promise<CheckoutIntent | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection("checkout_intents").findOneAndUpdate(
    { id: intentId, ownerId, status: { $in: ["pending", "submitted"] } },
    {
      $set: {
        txHash: input.txHash,
        payerAddress: input.payerAddress?.toLowerCase(),
        status: "submitted",
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  )
  if (!result) return null
  return toIntent(result as Record<string, unknown>)
}

export async function finalizeCheckoutIntent(
  intentId: string,
  ownerId: string,
  input: { status: "confirmed" | "failed"; failureReason?: string },
): Promise<CheckoutIntent | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection("checkout_intents").findOneAndUpdate(
    { id: intentId, ownerId },
    {
      $set: {
        status: input.status,
        failureReason: input.failureReason,
        confirmedAt: input.status === "confirmed" ? now : undefined,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  )
  if (!result) return null
  return toIntent(result as Record<string, unknown>)
}

export async function expireStaleIntents(): Promise<void> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  await db.collection("checkout_intents").updateMany(
    { status: "pending", expiresAt: { $lt: now } },
    { $set: { status: "expired", updatedAt: now } },
  )
}

export async function findIntentByTxHash(txHash: string): Promise<CheckoutIntent | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const doc = await db.collection("checkout_intents").findOne({
    txHash: txHash.toLowerCase(),
    status: "confirmed",
  })
  if (!doc) return null
  return toIntent(doc as Record<string, unknown>)
}
