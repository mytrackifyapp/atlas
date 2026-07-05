import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import { getFounderPublicProfile } from "@/lib/founder/profile"
import { recordPlatformFee } from "@/lib/fundraising/platform-fees"
import { getUserWallet } from "@/lib/wallets/service"
import type { ActiveFundraise } from "@/lib/fundraising/types"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await db.collection("fundraise_payments").createIndex({ txHash: 1 }, { unique: true })
  await db.collection("fundraise_payments").createIndex({ fundraiseId: 1, createdAt: -1 })
  indexesEnsured = true
}

function toActiveFundraise(doc: Record<string, unknown>): ActiveFundraise {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    roundType: String(doc.roundType),
    targetAmount: Number(doc.targetAmount),
    committedAmount: Number(doc.committedAmount ?? 0),
    minInvestment: doc.minInvestment != null ? Number(doc.minInvestment) : null,
    maxInvestment: doc.maxInvestment != null ? Number(doc.maxInvestment) : null,
    receivingWalletAddress: doc.receivingWalletAddress
      ? String(doc.receivingWalletAddress)
      : null,
    receivingChainId:
      doc.receivingChainId != null ? Number(doc.receivingChainId) : null,
    receivingChainLabel: doc.receivingChainLabel
      ? String(doc.receivingChainLabel)
      : null,
    status: String(doc.status),
  }
}

export async function getActiveFundraiseForFounder(
  userId: string,
): Promise<ActiveFundraise | null> {
  const db = await getDatabase()
  const doc = await db.collection("fundraises").findOne({ userId, status: "active" })
  if (!doc) return null
  return toActiveFundraise(doc as Record<string, unknown>)
}

export async function getFundraiseById(fundraiseId: string): Promise<ActiveFundraise | null> {
  const db = await getDatabase()
  if (!ObjectId.isValid(fundraiseId)) return null
  const doc = await db.collection("fundraises").findOne({ _id: new ObjectId(fundraiseId) })
  if (!doc || doc.status !== "active") return null
  return toActiveFundraise(doc as Record<string, unknown>)
}

export type PublicFundraiseProfile = {
  id: string
  companyName: string
  tagline: string
  website: string
  headquarters: string
  teamSize: string
  executiveSummary: string
  founderName: string
  founderTitle: string
  founderBio: string
  founderPhoto: string | null
  founderVerified: boolean
  founderKyc: {
    fullName: string
    location: string
    phoneNumber: string
    socialLinks: Array<{ platform: string; username: string }>
  } | null
  companyDescription: string
  traction: string
  marketOpportunity: string
  competitiveAdvantage: string
  pitchDeck: string | null
  financialModel: string | null
  demoVideoUrl: string
  dataRoomUrl: string
  companyLogo: string | null
  coverImage: string | null
  roundType: string
  targetAmount: number
  committedAmount: number
  percentage: number
  preMoneyValuation: number | null
  minInvestment: number | null
  maxInvestment: number | null
  daysRemaining: number
  useOfFunds: string[]
  useOfFundsBreakdown: string
  canInvest: boolean
}

export async function getPublicFundraiseProfile(
  fundraiseId: string,
): Promise<PublicFundraiseProfile | null> {
  const db = await getDatabase()
  if (!ObjectId.isValid(fundraiseId)) return null
  const doc = await db.collection("fundraises").findOne({
    _id: new ObjectId(fundraiseId),
    status: "active",
  })
  if (!doc) return null

  const targetAmount = Number(doc.targetAmount)
  const committedAmount = Number(doc.committedAmount ?? 0)
  const percentage =
    targetAmount > 0 ? Math.round((committedAmount / targetAmount) * 100) : 0

  const targetCloseDate =
    doc.targetCloseDate instanceof Date
      ? doc.targetCloseDate
      : new Date(doc.targetCloseDate as string)
  const daysRemaining = Math.max(
    0,
    Math.ceil((targetCloseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  )

  const founder = doc.userId
    ? await getFounderPublicProfile(String(doc.userId))
    : {
        founderName: "",
        founderTitle: "",
        founderBio: "",
        founderPhoto: null,
        founderVerified: false,
        founderKyc: null,
      }

  const founderName = founder.founderName || String(doc.founderName ?? "")
  const founderTitle = founder.founderTitle || String(doc.founderTitle ?? "")
  const founderBio = founder.founderBio || String(doc.founderBio ?? "")
  const founderPhoto =
    founder.founderPhoto ?? (doc.founderPhoto ? String(doc.founderPhoto) : null)
  const founderVerified = founder.founderVerified
  const founderKyc = founder.founderVerified ? founder.founderKyc : null

  return {
    id: String(doc._id),
    companyName: String(doc.companyName ?? ""),
    tagline: String(doc.tagline ?? ""),
    website: String(doc.website ?? ""),
    headquarters: String(doc.headquarters ?? ""),
    teamSize: String(doc.teamSize ?? ""),
    executiveSummary: String(doc.executiveSummary ?? ""),
    founderName,
    founderTitle,
    founderBio,
    founderPhoto,
    founderVerified,
    founderKyc,
    companyDescription: String(doc.companyDescription ?? ""),
    traction: String(doc.traction ?? ""),
    marketOpportunity: String(doc.marketOpportunity ?? ""),
    competitiveAdvantage: String(doc.competitiveAdvantage ?? ""),
    pitchDeck: doc.pitchDeck ? String(doc.pitchDeck) : null,
    financialModel: doc.financialModel ? String(doc.financialModel) : null,
    demoVideoUrl: String(doc.demoVideoUrl ?? ""),
    dataRoomUrl: String(doc.dataRoomUrl ?? ""),
    companyLogo: doc.companyLogo ? String(doc.companyLogo) : null,
    coverImage: doc.coverImage ? String(doc.coverImage) : null,
    roundType: String(doc.roundType),
    targetAmount,
    committedAmount,
    percentage,
    preMoneyValuation:
      doc.preMoneyValuation != null ? Number(doc.preMoneyValuation) : null,
    minInvestment: doc.minInvestment != null ? Number(doc.minInvestment) : null,
    maxInvestment: doc.maxInvestment != null ? Number(doc.maxInvestment) : null,
    daysRemaining,
    useOfFunds: Array.isArray(doc.useOfFunds) ? doc.useOfFunds.map(String) : [],
    useOfFundsBreakdown: String(doc.useOfFundsBreakdown ?? ""),
    canInvest: Boolean(doc.receivingWalletAddress),
  }
}

export async function bindReceivingWalletFromSettings(userId: string) {
  const wallet = await getUserWallet(userId)
  if (!wallet?.address) {
    throw new Error("Connect a wallet in Settings before receiving funds.")
  }

  const db = await getDatabase()
  const result = await db.collection("fundraises").findOneAndUpdate(
    { userId, status: "active" },
    {
      $set: {
        receivingWalletAddress: wallet.address.toLowerCase(),
        receivingChainId: wallet.chainId,
        receivingChainLabel: wallet.chainLabel,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )

  if (!result) {
    throw new Error("No active fundraise found. Start a fundraise first.")
  }

  return toActiveFundraise(result as Record<string, unknown>)
}

export function validateInvestmentAmount(
  fundraise: ActiveFundraise,
  amountUsd: number,
): void {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    throw new Error("Enter a valid investment amount.")
  }
  if (fundraise.minInvestment != null && amountUsd < fundraise.minInvestment) {
    throw new Error(`Minimum investment is $${fundraise.minInvestment.toLocaleString()}.`)
  }
  if (fundraise.maxInvestment != null && amountUsd > fundraise.maxInvestment) {
    throw new Error(`Maximum investment is $${fundraise.maxInvestment.toLocaleString()}.`)
  }
  const remaining = fundraise.targetAmount - fundraise.committedAmount
  if (remaining > 0 && amountUsd > remaining) {
    throw new Error(
      `Only $${remaining.toLocaleString()} remaining in this round.`,
    )
  }
}

export async function recordFundraisePayment(input: {
  fundraiseId: string
  founderUserId: string
  payerUserId: string
  payerAddress: string
  amountUsd: number
  amountAtomic: string
  stablecoin: string
  chainId: string
  txHash: string
  treasuryAddress: string
  tokenAddress: string
  blockNumber?: string
}) {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const txHash = input.txHash.toLowerCase()

  const existing = await db.collection("fundraise_payments").findOne({ txHash })
  if (existing) {
    if (existing.fundraiseId === input.fundraiseId) {
      await recordPlatformFee({
        fundraiseId: input.fundraiseId,
        founderUserId: input.founderUserId,
        paymentId: String(existing._id),
        paymentTxHash: txHash,
        grossAmountUsd: Number(existing.amountUsd),
        stablecoin: String(existing.stablecoin),
        chainId: String(existing.chainId),
      })
      return existing
    }
    throw new Error("This transaction has already been used for another investment.")
  }

  const payment = {
    fundraiseId: input.fundraiseId,
    founderUserId: input.founderUserId,
    payerUserId: input.payerUserId,
    payerAddress: input.payerAddress.toLowerCase(),
    amountUsd: input.amountUsd,
    amountAtomic: input.amountAtomic,
    stablecoin: input.stablecoin,
    chainId: input.chainId,
    txHash,
    treasuryAddress: input.treasuryAddress.toLowerCase(),
    tokenAddress: input.tokenAddress.toLowerCase(),
    blockNumber: input.blockNumber,
    createdAt: now,
  }

  const insertResult = await db.collection("fundraise_payments").insertOne(payment)

  await recordPlatformFee({
    fundraiseId: input.fundraiseId,
    founderUserId: input.founderUserId,
    paymentId: String(insertResult.insertedId),
    paymentTxHash: txHash,
    grossAmountUsd: input.amountUsd,
    stablecoin: input.stablecoin,
    chainId: input.chainId,
  })

  await db.collection("fundraises").updateOne(
    { _id: new ObjectId(input.fundraiseId) },
    {
      $inc: { committedAmount: input.amountUsd },
      $set: { updatedAt: now },
    },
  )

  await db.collection("investor_interests").insertOne({
    fundraiseId: input.fundraiseId,
    founderUserId: input.founderUserId,
    name: `Wallet ${input.payerAddress.slice(0, 6)}…${input.payerAddress.slice(-4)}`,
    email: "",
    amount: input.amountUsd,
    status: "Committed",
    stage: "Closed",
    source: "on_chain",
    payerAddress: input.payerAddress.toLowerCase(),
    txHash,
    stablecoin: input.stablecoin,
    chainId: input.chainId,
    createdAt: now,
    updatedAt: now,
    lastContact: now,
  })

  return payment
}

export async function listFundraisePayments(fundraiseId: string, limit = 20) {
  await ensureIndexes()
  const db = await getDatabase()
  const docs = await db
    .collection("fundraise_payments")
    .find({ fundraiseId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return docs.map((doc) => ({
    id: String(doc._id),
    fundraiseId: String(doc.fundraiseId),
    payerAddress: String(doc.payerAddress),
    amountUsd: Number(doc.amountUsd),
    stablecoin: String(doc.stablecoin),
    chainId: String(doc.chainId),
    txHash: String(doc.txHash),
    createdAt: new Date(doc.createdAt as Date).toISOString(),
  }))
}
