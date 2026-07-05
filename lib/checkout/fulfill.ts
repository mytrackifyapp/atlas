import { addPurchasedCredits, setAiSubscriptionPlan } from "@/lib/ai-credits/service"
import type { CheckoutPlanId } from "@/lib/checkout/catalog"
import { getChainConfig } from "@/lib/checkout/chains"
import {
  finalizeCheckoutIntent,
  getCheckoutIntent,
  markIntentSubmitted,
} from "@/lib/checkout/intents"
import { verifyStablecoinTransfer } from "@/lib/checkout/verify-tx"
import {
  findTreasuryPaymentOnChain,
  getUsedCheckoutTxHashes,
} from "@/lib/checkout/watch-payment"
import { getDatabase } from "@/lib/db"
import type { Address } from "viem"

async function assertTxHashNotConsumed(txHash: string, intentId: string) {
  const db = await getDatabase()

  const payment = await db.collection("checkout_payments").findOne({ txHash })
  if (payment) {
    if (payment.intentId === intentId) {
      return { alreadyPaid: true as const }
    }
    throw new Error("This transaction has already been used for another payment.")
  }

  const otherIntent = await db.collection("checkout_intents").findOne({
    txHash,
    id: { $ne: intentId },
    status: { $in: ["submitted", "confirmed"] },
  })
  if (otherIntent) {
    throw new Error("This transaction has already been used for another payment.")
  }

  return { alreadyPaid: false as const }
}

export async function confirmCheckoutPayment(input: {
  intentId: string
  ownerId: string
  txHash: string
  payerAddress?: string
}) {
  const intent = await getCheckoutIntent(input.intentId, input.ownerId)
  if (!intent) {
    throw new Error("Checkout session not found")
  }

  if (intent.status === "confirmed") {
    return { intent, alreadyConfirmed: true as const }
  }

  if (intent.status === "failed") {
    throw new Error("This checkout session failed verification. Start a new payment.")
  }

  if (intent.status === "expired") {
    throw new Error("This checkout session has expired. Start a new payment.")
  }

  if (new Date(intent.expiresAt).getTime() < Date.now()) {
    await finalizeCheckoutIntent(intent.id, input.ownerId, {
      status: "failed",
      failureReason: "expired",
    })
    throw new Error("This checkout session has expired. Start a new payment.")
  }

  const txHash = input.txHash.trim().toLowerCase()
  if (!/^0x[a-f0-9]{64}$/.test(txHash)) {
    throw new Error("Invalid transaction hash")
  }

  const consumption = await assertTxHashNotConsumed(txHash, intent.id)
  if (consumption.alreadyPaid) {
    return { intent, alreadyConfirmed: true as const }
  }

  const submitted = await markIntentSubmitted(intent.id, input.ownerId, {
    txHash,
    payerAddress: input.payerAddress,
  })
  if (!submitted) {
    const latest = await getCheckoutIntent(intent.id, input.ownerId)
    if (latest?.status === "confirmed") {
      return { intent: latest, alreadyConfirmed: true as const }
    }
    throw new Error("This checkout session can no longer be confirmed.")
  }

  try {
    const chain = getChainConfig(intent.chainId)
    const token = chain.tokens[intent.stablecoin]

    if (intent.treasuryAddress.toLowerCase() !== chain.treasuryAddress.toLowerCase()) {
      throw new Error("Checkout treasury configuration changed. Start a new payment.")
    }
    if (intent.tokenAddress.toLowerCase() !== token.address.toLowerCase()) {
      throw new Error("Checkout token configuration changed. Start a new payment.")
    }

    const transfer = await verifyStablecoinTransfer({
      chainId: intent.chainId,
      stablecoin: intent.stablecoin,
      txHash,
      expectedTreasury: intent.treasuryAddress as Address,
      expectedAmountAtomic: BigInt(intent.amountAtomic),
      expectedTokenAddress: intent.tokenAddress as Address,
      minCreatedAtSec: BigInt(Math.floor(new Date(intent.createdAt).getTime() / 1000)),
    })

    const db = await getDatabase()
    const now = new Date()

    try {
      await db.collection("checkout_payments").insertOne({
        intentId: intent.id,
        ownerId: input.ownerId,
        kind: intent.kind,
        planId: intent.planId,
        billingInterval: intent.billingInterval,
        creditPackId: intent.creditPackId,
        creditsAmount: intent.creditsAmount,
        stablecoin: intent.stablecoin,
        chainId: intent.chainId,
        amountUsd: intent.amountUsd,
        amountAtomic: intent.amountAtomic,
        txHash,
        payerAddress: transfer.from,
        treasuryAddress: intent.treasuryAddress,
        tokenAddress: intent.tokenAddress,
        blockNumber: transfer.blockNumber.toString(),
        createdAt: now,
      })
    } catch (error) {
      const duplicate =
        error instanceof Error && /duplicate key|E11000/i.test(error.message)
      if (duplicate) {
        const existing = await db.collection("checkout_payments").findOne({ txHash })
        if (existing?.intentId === intent.id) {
          const confirmed = await getCheckoutIntent(intent.id, input.ownerId)
          return { intent: confirmed ?? intent, alreadyConfirmed: true as const }
        }
        throw new Error("This transaction has already been used for another payment.")
      }
      throw error
    }

    const claimed = await db.collection("checkout_intents").findOneAndUpdate(
      {
        id: intent.id,
        ownerId: input.ownerId,
        status: { $in: ["pending", "submitted"] },
      },
      {
        $set: {
          status: "confirmed",
          txHash,
          payerAddress: transfer.from.toLowerCase(),
          confirmedAt: now,
          updatedAt: now,
          failureReason: undefined,
        },
      },
      { returnDocument: "after" },
    )

    if (!claimed) {
      throw new Error("This checkout session has already been processed.")
    }

    if (intent.kind === "credits") {
      if (!intent.creditsAmount) {
        throw new Error("Invalid credit pack checkout")
      }
      await addPurchasedCredits(input.ownerId, intent.creditsAmount)
    } else {
      if (!intent.planId) {
        throw new Error("Invalid subscription checkout")
      }
      await setAiSubscriptionPlan(input.ownerId, intent.planId as CheckoutPlanId, "active")
    }

    return {
      intent: (await getCheckoutIntent(intent.id, input.ownerId)) ?? intent,
      alreadyConfirmed: false as const,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed"
    const pendingOnChain = /not found yet|wait for confirmations|could not be found|not be processed on a block yet/i.test(
      message,
    )
    if (!pendingOnChain) {
      await finalizeCheckoutIntent(intent.id, input.ownerId, {
        status: "failed",
        failureReason: message,
      })
    }
    throw error
  }
}

export type AutoConfirmResult =
  | { status: "not_found" }
  | { status: "expired" }
  | { status: "pending" }
  | {
      status: "confirmed"
      intent: Awaited<ReturnType<typeof getCheckoutIntent>>
      txHash: string
      alreadyConfirmed: boolean
    }

export async function autoConfirmCheckoutPayment(input: {
  intentId: string
  ownerId: string
}): Promise<AutoConfirmResult> {
  const intent = await getCheckoutIntent(input.intentId, input.ownerId)
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

  const result = await confirmCheckoutPayment({
    intentId: input.intentId,
    ownerId: input.ownerId,
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
