import { randomUUID } from "crypto"

import {
  atomicToDisplay,
  getChainConfig,
  usdToAtomic,
  type ChainConfig,
} from "@/lib/checkout/chains"
import type { CheckoutChainId, CheckoutStablecoin } from "@/lib/checkout/types"
import {
  getFundraiseById,
  validateInvestmentAmount,
} from "@/lib/fundraising/service"
import type { ActiveFundraise } from "@/lib/fundraising/types"
import type { FundraisePaymentIntent } from "@/lib/fundraising/types"
import { getDatabase } from "@/lib/db"
import { getUserWallet } from "@/lib/wallets/service"

const INTENT_TTL_MS = 30 * 60 * 1000

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await db
    .collection("fundraise_payment_intents")
    .createIndex({ id: 1 }, { unique: true })
  await db
    .collection("fundraise_payment_intents")
    .createIndex({ fundraiseId: 1, createdAt: -1 })
  await db
    .collection("fundraise_payment_intents")
    .createIndex({ txHash: 1 }, { sparse: true })
  indexesEnsured = true
}

function toIntent(doc: Record<string, unknown>): FundraisePaymentIntent {
  return {
    id: String(doc.id),
    fundraiseId: String(doc.fundraiseId),
    founderUserId: String(doc.founderUserId),
    payerUserId: String(doc.payerUserId),
    amountUsd: Number(doc.amountUsd),
    amountAtomic: String(doc.amountAtomic),
    stablecoin: doc.stablecoin as CheckoutStablecoin,
    chainId: doc.chainId as CheckoutChainId,
    treasuryAddress: String(doc.treasuryAddress),
    tokenAddress: String(doc.tokenAddress),
    payerAddress: doc.payerAddress ? String(doc.payerAddress) : undefined,
    txHash: doc.txHash ? String(doc.txHash) : undefined,
    status: doc.status as FundraisePaymentIntent["status"],
    expiresAt: new Date(doc.expiresAt as Date).toISOString(),
    confirmedAt: doc.confirmedAt
      ? new Date(doc.confirmedAt as Date).toISOString()
      : undefined,
    failureReason: doc.failureReason ? String(doc.failureReason) : undefined,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  }
}

export async function createFundraisePaymentIntent(input: {
  fundraiseId: string
  payerUserId: string
  amountUsd: number
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
}): Promise<
  FundraisePaymentIntent & { amountDisplay: string; chain: ChainConfig; fundraise: ActiveFundraise }
> {
  await ensureIndexes()

  const fundraise = await getFundraiseById(input.fundraiseId)
  if (!fundraise) {
    throw new Error("Fundraise not found or no longer active.")
  }
  if (!fundraise.receivingWalletAddress) {
    throw new Error("Founder has not connected a receiving wallet yet.")
  }

  validateInvestmentAmount(fundraise, input.amountUsd)

  const chain = getChainConfig(input.chainId)
  const token = chain.tokens[input.stablecoin]
  const amountAtomic = usdToAtomic(input.amountUsd, token.decimals)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + INTENT_TTL_MS)

  const savedWallet = input.payerUserId.startsWith("guest:")
    ? null
    : await getUserWallet(input.payerUserId)

  const intent: FundraisePaymentIntent = {
    id: randomUUID(),
    fundraiseId: input.fundraiseId,
    founderUserId: fundraise.userId,
    payerUserId: input.payerUserId,
    amountUsd: input.amountUsd,
    amountAtomic: amountAtomic.toString(),
    stablecoin: input.stablecoin,
    chainId: input.chainId,
    treasuryAddress: fundraise.receivingWalletAddress,
    tokenAddress: token.address,
    payerAddress: savedWallet?.address.toLowerCase(),
    status: "pending",
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  const db = await getDatabase()
  await db.collection("fundraise_payment_intents").insertOne({
    ...intent,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  })

  return {
    ...intent,
    amountDisplay: atomicToDisplay(amountAtomic, token.decimals),
    chain,
    fundraise,
  }
}

export async function getFundraisePaymentIntent(
  intentId: string,
  payerUserId?: string,
): Promise<FundraisePaymentIntent | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const query: Record<string, unknown> = { id: intentId }
  if (payerUserId) query.payerUserId = payerUserId
  const doc = await db.collection("fundraise_payment_intents").findOne(query)
  if (!doc) return null
  return toIntent(doc as Record<string, unknown>)
}

export async function markFundraiseIntentSubmitted(
  intentId: string,
  payerUserId: string,
  input: { txHash: string; payerAddress?: string },
): Promise<FundraisePaymentIntent | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection("fundraise_payment_intents").findOneAndUpdate(
    { id: intentId, payerUserId, status: { $in: ["pending", "submitted"] } },
    {
      $set: {
        txHash: input.txHash.toLowerCase(),
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

export async function finalizeFundraiseIntent(
  intentId: string,
  payerUserId: string,
  input: { status: "confirmed" | "failed"; failureReason?: string },
): Promise<FundraisePaymentIntent | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection("fundraise_payment_intents").findOneAndUpdate(
    { id: intentId, payerUserId },
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
