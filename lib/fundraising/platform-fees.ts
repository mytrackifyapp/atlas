import { randomUUID } from "crypto"

import { atomicToDisplay, getChainConfig, usdToAtomic } from "@/lib/checkout/chains"
import { verifyStablecoinTransfer } from "@/lib/checkout/verify-tx"
import type { CheckoutChainId, CheckoutStablecoin } from "@/lib/checkout/types"
import { getDatabase } from "@/lib/db"
import type { PlatformFee, PlatformFeeStatus, PlatformFeeSummary } from "@/lib/fundraising/types"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await db.collection("platform_fees").createIndex({ paymentTxHash: 1 }, { unique: true })
  await db.collection("platform_fees").createIndex({ fundraiseId: 1, status: 1, createdAt: -1 })
  await db.collection("platform_fees").createIndex({ founderUserId: 1, status: 1 })
  await db.collection("platform_fees").createIndex({ settlementTxHash: 1 }, { sparse: true, unique: true })
  indexesEnsured = true
}

export type PendingSettlementGroup = {
  chainId: CheckoutChainId
  stablecoin: CheckoutStablecoin
  tokenAddress: string
  treasuryAddress: string
  amountAtomic: string
  amountDisplay: string
  chainLabel: string
  amountUsd: number
  feeCount: number
}

export function getFundraisePlatformFeeBps(): number {
  const raw = process.env.FUNDRAISE_PLATFORM_FEE_BPS?.trim()
  const parsed = raw ? parseInt(raw, 10) : 250
  if (!Number.isFinite(parsed) || parsed < 0) return 250
  return parsed
}

export function calculatePlatformFeeUsd(grossUsd: number, feeBps = getFundraisePlatformFeeBps()): number {
  if (feeBps <= 0 || grossUsd <= 0) return 0
  return Math.round((grossUsd * feeBps) / 100) / 100
}

function toPlatformFee(doc: Record<string, unknown>): PlatformFee {
  return {
    id: String(doc.id ?? doc._id),
    fundraiseId: String(doc.fundraiseId),
    founderUserId: String(doc.founderUserId),
    paymentId: String(doc.paymentId),
    paymentTxHash: String(doc.paymentTxHash),
    grossAmountUsd: Number(doc.grossAmountUsd),
    feeBps: Number(doc.feeBps),
    feeAmountUsd: Number(doc.feeAmountUsd),
    stablecoin: doc.stablecoin as CheckoutStablecoin,
    chainId: doc.chainId as CheckoutChainId,
    treasuryAddress: String(doc.treasuryAddress),
    tokenAddress: String(doc.tokenAddress),
    status: doc.status as PlatformFeeStatus,
    settlementTxHash: doc.settlementTxHash ? String(doc.settlementTxHash) : undefined,
    paidAt: doc.paidAt ? new Date(doc.paidAt as Date).toISOString() : undefined,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
  }
}

export async function recordPlatformFee(input: {
  fundraiseId: string
  founderUserId: string
  paymentId: string
  paymentTxHash: string
  grossAmountUsd: number
  stablecoin: string
  chainId: string
}): Promise<PlatformFee | null> {
  await ensureIndexes()
  const feeBps = getFundraisePlatformFeeBps()
  const feeAmountUsd = calculatePlatformFeeUsd(input.grossAmountUsd, feeBps)
  if (feeAmountUsd <= 0) return null

  const chain = getChainConfig(input.chainId as CheckoutChainId)
  const stablecoin = input.stablecoin as CheckoutStablecoin
  const token = chain.tokens[stablecoin]
  if (!token) return null

  const db = await getDatabase()
  const paymentTxHash = input.paymentTxHash.toLowerCase()
  const existing = await db.collection("platform_fees").findOne({ paymentTxHash })
  if (existing) return toPlatformFee(existing as Record<string, unknown>)

  const now = new Date()
  const fee = {
    id: randomUUID(),
    fundraiseId: input.fundraiseId,
    founderUserId: input.founderUserId,
    paymentId: input.paymentId,
    paymentTxHash,
    grossAmountUsd: input.grossAmountUsd,
    feeBps,
    feeAmountUsd,
    stablecoin,
    chainId: input.chainId,
    treasuryAddress: chain.treasuryAddress.toLowerCase(),
    tokenAddress: token.address.toLowerCase(),
    status: "pending" as PlatformFeeStatus,
    createdAt: now,
  }

  await db.collection("platform_fees").insertOne(fee)
  return toPlatformFee(fee)
}

export async function syncMissingPlatformFeesForFundraise(
  fundraiseId: string,
  founderUserId: string,
): Promise<void> {
  await ensureIndexes()
  const db = await getDatabase()
  const payments = await db.collection("fundraise_payments").find({ fundraiseId }).toArray()

  for (const payment of payments) {
    await recordPlatformFee({
      fundraiseId,
      founderUserId,
      paymentId: String(payment._id),
      paymentTxHash: String(payment.txHash),
      grossAmountUsd: Number(payment.amountUsd),
      stablecoin: String(payment.stablecoin),
      chainId: String(payment.chainId),
    })
  }
}

export async function listPlatformFees(fundraiseId: string, limit = 50): Promise<PlatformFee[]> {
  await ensureIndexes()
  const db = await getDatabase()
  const docs = await db
    .collection("platform_fees")
    .find({ fundraiseId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return docs.map((doc) => toPlatformFee(doc as Record<string, unknown>))
}

export async function getPlatformFeeSummary(fundraiseId: string): Promise<PlatformFeeSummary> {
  const fees = await listPlatformFees(fundraiseId, 500)
  const feeBps = getFundraisePlatformFeeBps()

  let grossReceivedUsd = 0
  let feesOwedUsd = 0
  let feesPaidUsd = 0
  let pendingCount = 0

  for (const fee of fees) {
    grossReceivedUsd += fee.grossAmountUsd
    if (fee.status === "paid") {
      feesPaidUsd += fee.feeAmountUsd
    } else {
      feesOwedUsd += fee.feeAmountUsd
      pendingCount += 1
    }
  }

  return {
    feeBps,
    grossReceivedUsd,
    feesOwedUsd,
    feesPaidUsd,
    pendingCount,
    totalFeeCount: fees.length,
  }
}

export async function listPendingSettlementGroups(fundraiseId: string): Promise<PendingSettlementGroup[]> {
  const fees = (await listPlatformFees(fundraiseId, 500)).filter((fee) => fee.status === "pending")
  const grouped = new Map<string, { totalUsd: number; fees: PlatformFee[] }>()

  for (const fee of fees) {
    const key = `${fee.chainId}:${fee.stablecoin}`
    const entry = grouped.get(key) ?? { totalUsd: 0, fees: [] }
    entry.totalUsd += fee.feeAmountUsd
    entry.fees.push(fee)
    grouped.set(key, entry)
  }

  return [...grouped.entries()]
    .map(([, group]) => {
      const sample = group.fees[0]
      const chain = getChainConfig(sample.chainId)
      const token = chain.tokens[sample.stablecoin]
      const amountAtomic = usdToAtomic(group.totalUsd, token.decimals)

      return {
        chainId: sample.chainId,
        stablecoin: sample.stablecoin,
        tokenAddress: token.address,
        treasuryAddress: chain.treasuryAddress,
        amountAtomic: amountAtomic.toString(),
        amountDisplay: atomicToDisplay(amountAtomic, token.decimals),
        chainLabel: chain.label,
        amountUsd: group.totalUsd,
        feeCount: group.fees.length,
      }
    })
    .sort((a, b) => b.amountUsd - a.amountUsd)
}

async function assertSettlementTxAvailable(txHash: string) {
  const db = await getDatabase()
  const existing = await db.collection("platform_fees").findOne({ settlementTxHash: txHash })
  if (existing) {
    throw new Error("This settlement transaction has already been used.")
  }
}

function assertAllowedPayer(fromAddress: string, allowedPayerAddresses: string[] | undefined) {
  if (!allowedPayerAddresses?.length) return
  const normalized = fromAddress.toLowerCase()
  const allowed = allowedPayerAddresses.map((address) => address.toLowerCase())
  if (!allowed.includes(normalized)) {
    throw new Error("Settlement must be sent from your connected or receiving wallet.")
  }
}

export async function settlePlatformFees(input: {
  founderUserId: string
  fundraiseId: string
  txHash: string
  chainId: CheckoutChainId
  stablecoin: CheckoutStablecoin
  allowedPayerAddresses?: string[]
}): Promise<{ settledCount: number; settledUsd: number; txHash: string }> {
  await ensureIndexes()
  const db = await getDatabase()
  const pending = await db
    .collection("platform_fees")
    .find({
      fundraiseId: input.fundraiseId,
      founderUserId: input.founderUserId,
      status: "pending",
      chainId: input.chainId,
      stablecoin: input.stablecoin,
    })
    .sort({ createdAt: 1 })
    .toArray()

  if (pending.length === 0) {
    throw new Error("No pending platform fees on this network.")
  }

  const txHash = input.txHash.trim().toLowerCase()
  if (!/^0x[a-f0-9]{64}$/.test(txHash)) {
    throw new Error("Invalid transaction hash.")
  }

  await assertSettlementTxAvailable(txHash)

  const totalUsd = pending.reduce((sum, fee) => sum + Number(fee.feeAmountUsd ?? 0), 0)
  const chain = getChainConfig(input.chainId)
  const token = chain.tokens[input.stablecoin]
  const expectedAtomic = usdToAtomic(totalUsd, token.decimals)

  const transfer = await verifyStablecoinTransfer({
    chainId: input.chainId,
    stablecoin: input.stablecoin,
    txHash,
    expectedTreasury: chain.treasuryAddress,
    expectedAmountAtomic: expectedAtomic,
    expectedTokenAddress: token.address,
  })

  assertAllowedPayer(transfer.from, input.allowedPayerAddresses)

  const now = new Date()
  const ids = pending.map((fee) => fee.id)
  await db.collection("platform_fees").updateMany(
    { id: { $in: ids }, status: "pending" },
    {
      $set: {
        status: "paid",
        settlementTxHash: txHash,
        paidAt: now,
      },
    },
  )

  return { settledCount: pending.length, settledUsd: totalUsd, txHash }
}
