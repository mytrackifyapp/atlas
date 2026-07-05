import { getDatabase } from "@/lib/db"

export type FundraiseSummary = {
  id: string
  roundType: string
  targetAmount: number
  committedAmount: number
  percentage: number
  status: string
  targetCloseDate: string | null
  daysRemaining: number | null
  preMoneyValuation: number | null
}

export type InvestorPipelineEntry = {
  id: string
  name: string
  firm: string | null
  status: string
  amount: number
  stage: string | null
  lastContact: string | null
}

export async function getActiveFundraiseSummary(
  userId: string
): Promise<FundraiseSummary | null> {
  const db = await getDatabase()
  const fundraise = await db.collection("fundraises").findOne({
    userId,
    status: "active",
  })

  if (!fundraise) return null

  const targetAmount = Number(fundraise.targetAmount) || 0
  const committedAmount = Number(fundraise.committedAmount) || 0
  const percentage =
    targetAmount > 0 ? Math.round((committedAmount / targetAmount) * 100) : 0

  const targetCloseDate = fundraise.targetCloseDate
    ? new Date(fundraise.targetCloseDate)
    : null
  const daysRemaining = targetCloseDate
    ? Math.max(
        0,
        Math.ceil((targetCloseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null

  return {
    id: fundraise._id.toString(),
    roundType: fundraise.roundType ?? "Round",
    targetAmount,
    committedAmount,
    percentage,
    status: fundraise.status ?? "active",
    targetCloseDate: targetCloseDate?.toISOString() ?? null,
    daysRemaining,
    preMoneyValuation: fundraise.preMoneyValuation
      ? Number(fundraise.preMoneyValuation)
      : null,
  }
}

export async function getInvestorPipeline(
  userId: string,
  limit = 25
): Promise<{ fundraise: FundraiseSummary | null; investors: InvestorPipelineEntry[] }> {
  const fundraise = await getActiveFundraiseSummary(userId)
  if (!fundraise) {
    return { fundraise: null, investors: [] }
  }

  const db = await getDatabase()
  const rows = await db
    .collection("investor_interests")
    .find({ fundraiseId: fundraise.id })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray()

  return {
    fundraise,
    investors: rows.map((row) => ({
      id: row._id.toString(),
      name: row.name ?? "Unknown",
      firm: row.firm ?? null,
      status: row.status ?? "Interested",
      amount: Number(row.amount) || 0,
      stage: row.stage ?? null,
      lastContact: row.lastContact
        ? new Date(row.lastContact).toISOString()
        : null,
    })),
  }
}
