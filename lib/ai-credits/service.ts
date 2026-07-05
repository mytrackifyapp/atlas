import { getDatabase } from "@/lib/db"
import { AI_CREDIT_PLANS, getMonthlyCreditsForPlan } from "@/lib/ai-credits/plans"
import { creditsForFeature } from "@/lib/ai-credits/pricing"
import type {
  AiCreditBalance,
  AiCreditFeature,
  AiCreditPlanId,
  AiCreditSnapshot,
  AiSubscription,
  AiSubscriptionStatus,
} from "@/lib/ai-credits/types"
import { InsufficientCreditsError } from "@/lib/ai-credits/types"

let indexesEnsured = false

function currentBillingPeriod() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  await db.collection("ai_subscriptions").createIndex({ ownerId: 1 }, { unique: true })
  await db.collection("ai_credit_balances").createIndex({ ownerId: 1 }, { unique: true })
  await db.collection("ai_usage_ledger").createIndex({ ownerId: 1, createdAt: -1 })
  await db.collection("ai_usage_ledger").createIndex({ correlationId: 1 })
  indexesEnsured = true
}

export async function getAiSubscription(ownerId: string): Promise<AiSubscription> {
  await ensureIndexes()
  const db = await getDatabase()
  const doc = await db.collection("ai_subscriptions").findOne({ ownerId })
  if (!doc) {
    const now = new Date()
    const subscription: AiSubscription = {
      ownerId,
      planId: "free",
      status: "active",
      updatedAt: now.toISOString(),
    }
    await db.collection("ai_subscriptions").insertOne(subscription)
    return subscription
  }

  return {
    ownerId,
    planId: (doc.planId as AiCreditPlanId) ?? "free",
    status: (doc.status as AiSubscriptionStatus) ?? "active",
    updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  }
}

export async function setAiSubscriptionPlan(
  ownerId: string,
  planId: AiCreditPlanId,
  status: AiSubscriptionStatus = "active",
): Promise<AiSubscription> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const monthlyAllowance = getMonthlyCreditsForPlan(planId)

  await db.collection("ai_subscriptions").updateOne(
    { ownerId },
    { $set: { ownerId, planId, status, updatedAt: now } },
    { upsert: true },
  )

  const { start, end } = currentBillingPeriod()
  await db.collection("ai_credit_balances").updateOne(
    { ownerId },
    {
      $set: {
        ownerId,
        planId,
        monthlyAllowance,
        balance: monthlyAllowance,
        periodStart: start,
        periodEnd: end,
        updatedAt: now,
      },
    },
    { upsert: true },
  )

  return {
    ownerId,
    planId,
    status,
    updatedAt: now.toISOString(),
  }
}

async function rolloverBalanceIfNeeded(
  ownerId: string,
  planId: AiCreditPlanId,
): Promise<AiCreditBalance> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const { start, end } = currentBillingPeriod()
  const monthlyAllowance = getMonthlyCreditsForPlan(planId)

  const existing = await db.collection("ai_credit_balances").findOne({ ownerId })
  if (!existing) {
    const balance: AiCreditBalance = {
      ownerId,
      planId,
      balance: monthlyAllowance,
      monthlyAllowance,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      updatedAt: now.toISOString(),
    }
    await db.collection("ai_credit_balances").insertOne({
      ...balance,
      periodStart: start,
      periodEnd: end,
      updatedAt: now,
    })
    return balance
  }

  const periodEnd = existing.periodEnd ? new Date(existing.periodEnd) : new Date(0)
  const needsRollover = periodEnd.getTime() < now.getTime()
  const storedPlan = (existing.planId as AiCreditPlanId) ?? planId
  const allowance =
    storedPlan === planId ? (existing.monthlyAllowance as number) : monthlyAllowance

  if (needsRollover || storedPlan !== planId) {
    const next: AiCreditBalance = {
      ownerId,
      planId,
      balance: monthlyAllowance,
      monthlyAllowance,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      updatedAt: now.toISOString(),
    }
    await db.collection("ai_credit_balances").updateOne(
      { ownerId },
      {
        $set: {
          planId,
          balance: monthlyAllowance,
          monthlyAllowance,
          periodStart: start,
          periodEnd: end,
          updatedAt: now,
        },
      },
    )
    return next
  }

  return {
    ownerId,
    planId: storedPlan,
    balance: typeof existing.balance === "number" ? existing.balance : monthlyAllowance,
    monthlyAllowance: allowance,
    periodStart: new Date(existing.periodStart).toISOString(),
    periodEnd: periodEnd.toISOString(),
    updatedAt: existing.updatedAt?.toISOString?.() ?? now.toISOString(),
  }
}

export async function getAiCreditBalance(ownerId: string): Promise<AiCreditBalance> {
  const subscription = await getAiSubscription(ownerId)
  return rolloverBalanceIfNeeded(ownerId, subscription.planId)
}

export function toCreditSnapshot(balance: AiCreditBalance): AiCreditSnapshot {
  const plan = AI_CREDIT_PLANS[balance.planId] ?? AI_CREDIT_PLANS.free
  const used = Math.max(0, balance.monthlyAllowance - balance.balance)
  const percentUsed =
    balance.monthlyAllowance > 0
      ? Math.min(100, Math.round((used / balance.monthlyAllowance) * 100))
      : 0

  return {
    planId: balance.planId,
    planLabel: plan.label,
    balance: balance.balance,
    monthlyAllowance: balance.monthlyAllowance,
    periodStart: balance.periodStart,
    periodEnd: balance.periodEnd,
    percentUsed,
  }
}

export async function getAiCreditSnapshot(ownerId: string): Promise<AiCreditSnapshot> {
  const balance = await getAiCreditBalance(ownerId)
  return toCreditSnapshot(balance)
}

export type CreditCheckResult = {
  success: boolean
  balance: number
  limit: number
  required: number
  planId: AiCreditPlanId
  reset: number
}

export async function checkAiCredits(
  ownerId: string,
  required = 1,
): Promise<CreditCheckResult> {
  const balance = await getAiCreditBalance(ownerId)
  return {
    success: balance.balance >= required,
    balance: balance.balance,
    limit: balance.monthlyAllowance,
    required,
    planId: balance.planId,
    reset: new Date(balance.periodEnd).getTime(),
  }
}

export function creditHeaders(check: CreditCheckResult): Record<string, string> {
  return {
    "X-Credits-Remaining": String(check.balance),
    "X-Credits-Limit": String(check.limit),
    "X-Credits-Reset": String(check.reset),
    "X-Credits-Plan": check.planId,
  }
}

export type RecordAiUsageInput = {
  ownerId: string
  feature: AiCreditFeature
  inputTokens?: number
  outputTokens?: number
  delegationCount?: number
  charCount?: number
  model?: string
  agentId?: string
  correlationId?: string
  description?: string
}

export async function recordAiUsage(input: RecordAiUsageInput): Promise<{
  creditsDebited: number
  balance: number
}> {
  await ensureIndexes()
  const credits = creditsForFeature(input.feature, {
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    delegationCount: input.delegationCount,
    charCount: input.charCount,
  })

  const db = await getDatabase()
  const now = new Date()

  const updated = await db.collection("ai_credit_balances").findOneAndUpdate(
    { ownerId: input.ownerId, balance: { $gte: credits } },
    { $inc: { balance: -credits }, $set: { updatedAt: now } },
    { returnDocument: "after" },
  )

  if (!updated) {
    const snapshot = await getAiCreditBalance(input.ownerId)
    throw new InsufficientCreditsError(snapshot.balance, credits)
  }

  await db.collection("ai_usage_ledger").insertOne({
    ownerId: input.ownerId,
    feature: input.feature,
    credits,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    model: input.model,
    agentId: input.agentId,
    correlationId: input.correlationId,
    description: input.description,
    createdAt: now,
  })

  return {
    creditsDebited: credits,
    balance: typeof updated.balance === "number" ? updated.balance : 0,
  }
}

export async function addPurchasedCredits(
  ownerId: string,
  credits: number,
): Promise<AiCreditBalance> {
  await ensureIndexes()
  const subscription = await getAiSubscription(ownerId)
  const balance = await rolloverBalanceIfNeeded(ownerId, subscription.planId)
  const db = await getDatabase()
  const now = new Date()

  const updated = await db.collection("ai_credit_balances").findOneAndUpdate(
    { ownerId },
    { $inc: { balance: credits }, $set: { updatedAt: now } },
    { returnDocument: "after" },
  )

  const nextBalance =
    typeof updated?.balance === "number" ? updated.balance : balance.balance + credits

  return {
    ...balance,
    balance: nextBalance,
    updatedAt: now.toISOString(),
  }
}

export async function listRecentAiUsage(
  ownerId: string,
  limit = 20,
): Promise<
  Array<{
    id: string
    feature: AiCreditFeature
    credits: number
    agentId?: string
    description?: string
    createdAt: string
  }>
> {
  await ensureIndexes()
  const db = await getDatabase()
  const rows = await db
    .collection("ai_usage_ledger")
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => ({
    id: row._id.toString(),
    feature: row.feature as AiCreditFeature,
    credits: row.credits as number,
    agentId: row.agentId as string | undefined,
    description: row.description as string | undefined,
    createdAt: (row.createdAt as Date).toISOString(),
  }))
}

export function insufficientCreditsMessage(check: CreditCheckResult): string {
  return `You've used your AI credits for this month (${check.balance} remaining of ${check.limit}). Upgrade your plan or wait until your credits reset.`
}
