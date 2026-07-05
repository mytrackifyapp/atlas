import type { Address } from "viem"

import { verifyStablecoinTransfer } from "@/lib/checkout/verify-tx"
import {
  findTreasuryPaymentOnChain,
  getUsedCheckoutTxHashes,
} from "@/lib/checkout/watch-payment"
import {
  finalizeFundraiseIntent,
  getFundraisePaymentIntent,
  markFundraiseIntentSubmitted,
} from "@/lib/fundraising/intents"
import { recordFundraisePayment } from "@/lib/fundraising/service"
import { getDatabase } from "@/lib/db"

async function assertFundraiseTxNotConsumed(txHash: string, intentId: string) {
  const db = await getDatabase()
  const payment = await db.collection("fundraise_payments").findOne({ txHash })
  if (payment) {
    throw new Error("This transaction has already been used for another investment.")
  }

  const other = await db.collection("fundraise_payment_intents").findOne({
    txHash,
    id: { $ne: intentId },
    status: { $in: ["submitted", "confirmed"] },
  })
  if (other) {
    throw new Error("This transaction has already been used for another investment.")
  }
}

export async function confirmFundraisePayment(input: {
  intentId: string
  payerUserId: string
  txHash: string
  payerAddress?: string
}) {
  const intent = await getFundraisePaymentIntent(input.intentId, input.payerUserId)
  if (!intent) throw new Error("Investment session not found")

  if (intent.status === "confirmed") {
    return { intent, alreadyConfirmed: true as const }
  }

  if (intent.status === "failed") {
    throw new Error("This investment session failed. Start a new payment.")
  }

  if (intent.status === "expired" || new Date(intent.expiresAt).getTime() < Date.now()) {
    await finalizeFundraiseIntent(intent.id, input.payerUserId, {
      status: "failed",
      failureReason: "expired",
    })
    throw new Error("This investment session has expired. Start a new payment.")
  }

  const txHash = input.txHash.trim().toLowerCase()
  if (!/^0x[a-f0-9]{64}$/.test(txHash)) {
    throw new Error("Invalid transaction hash")
  }

  await assertFundraiseTxNotConsumed(txHash, intent.id)

  const submitted = await markFundraiseIntentSubmitted(intent.id, input.payerUserId, {
    txHash,
    payerAddress: input.payerAddress,
  })
  if (!submitted) {
    const latest = await getFundraisePaymentIntent(intent.id, input.payerUserId)
    if (latest?.status === "confirmed") {
      return { intent: latest, alreadyConfirmed: true as const }
    }
    throw new Error("This investment session can no longer be confirmed.")
  }

  try {
    const transfer = await verifyStablecoinTransfer({
      chainId: intent.chainId,
      stablecoin: intent.stablecoin,
      txHash,
      expectedTreasury: intent.treasuryAddress as Address,
      expectedAmountAtomic: BigInt(intent.amountAtomic),
      expectedTokenAddress: intent.tokenAddress as Address,
      minCreatedAtSec: BigInt(Math.floor(new Date(intent.createdAt).getTime() / 1000)),
    })

    await recordFundraisePayment({
      fundraiseId: intent.fundraiseId,
      founderUserId: intent.founderUserId,
      payerUserId: intent.payerUserId,
      payerAddress: transfer.from,
      amountUsd: intent.amountUsd,
      amountAtomic: intent.amountAtomic,
      stablecoin: intent.stablecoin,
      chainId: intent.chainId,
      txHash,
      treasuryAddress: intent.treasuryAddress,
      tokenAddress: intent.tokenAddress,
      blockNumber: transfer.blockNumber.toString(),
    })

    const db = await getDatabase()
    await db.collection("fundraise_payment_intents").findOneAndUpdate(
      {
        id: intent.id,
        payerUserId: input.payerUserId,
        status: { $in: ["pending", "submitted"] },
      },
      {
        $set: {
          status: "confirmed",
          txHash,
          payerAddress: transfer.from.toLowerCase(),
          confirmedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    const confirmed = await getFundraisePaymentIntent(intent.id, input.payerUserId)
    return { intent: confirmed ?? intent, alreadyConfirmed: false as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed"
    const pendingOnChain = /not found yet|wait for confirmations|could not be found|not be processed on a block yet/i.test(
      message,
    )
    if (!pendingOnChain) {
      await finalizeFundraiseIntent(intent.id, input.payerUserId, {
        status: "failed",
        failureReason: message,
      })
    }
    throw error
  }
}

export type FundraiseAutoConfirmResult =
  | { status: "not_found" }
  | { status: "expired" }
  | { status: "pending" }
  | {
      status: "confirmed"
      intent: Awaited<ReturnType<typeof getFundraisePaymentIntent>>
      txHash: string
      alreadyConfirmed: boolean
    }

export async function autoConfirmFundraisePayment(input: {
  intentId: string
  payerUserId: string
}): Promise<FundraiseAutoConfirmResult> {
  const intent = await getFundraisePaymentIntent(input.intentId, input.payerUserId)
  if (!intent) return { status: "not_found" }

  if (intent.status === "confirmed") {
    return {
      status: "confirmed",
      intent,
      txHash: intent.txHash ?? "",
      alreadyConfirmed: true,
    }
  }

  if (intent.status === "expired" || new Date(intent.expiresAt).getTime() < Date.now()) {
    return { status: "expired" }
  }

  const usedTxHashes = await getUsedCheckoutTxHashes()
  const fundraisePayments = await getDatabase().then((db) =>
    db.collection("fundraise_payments").find({}, { projection: { txHash: 1 } }).toArray(),
  )
  for (const p of fundraisePayments) {
    if (p.txHash) usedTxHashes.add(String(p.txHash).toLowerCase())
  }

  const match = await findTreasuryPaymentOnChain(
    {
      chainId: intent.chainId,
      tokenAddress: intent.tokenAddress,
      treasuryAddress: intent.treasuryAddress,
      amountAtomic: intent.amountAtomic,
      createdAt: intent.createdAt,
      payerAddress: intent.payerAddress,
    },
    { payerAddress: intent.payerAddress, usedTxHashes },
  )

  if (!match) return { status: "pending" }

  const result = await confirmFundraisePayment({
    intentId: input.intentId,
    payerUserId: input.payerUserId,
    txHash: match.txHash,
    payerAddress: match.payerAddress,
  })

  return {
    status: "confirmed",
    intent: result.intent,
    txHash: match.txHash,
    alreadyConfirmed: result.alreadyConfirmed,
  }
}
