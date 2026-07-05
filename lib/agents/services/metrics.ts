import { getDatabase } from "@/lib/db"
import { getActiveFundraiseSummary } from "@/lib/agents/services/fundraising"

export type FounderMetricsSummary = {
  monthlyRevenue: number
  monthlyExpenses: number
  cashOnHand: number
  runwayMonths: number | null
  revenueGrowthPercent: number | null
  activeInvestorCount: number
  recentMonths: Array<{ month: string; revenue: number; expenses: number; cash: number }>
  currentFundraise: Awaited<ReturnType<typeof getActiveFundraiseSummary>>
}

export async function getFounderMetricsSummary(
  userId: string
): Promise<FounderMetricsSummary> {
  const db = await getDatabase()

  const [metrics, activeInvestorCount, currentFundraise] = await Promise.all([
    db.collection("company_metrics").find({ userId }).sort({ month: -1 }).limit(6).toArray(),
    db.collection("investor_interests").countDocuments({
      userId,
      status: { $in: ["Interested", "In Discussion", "Committed", "interested", "reviewing"] },
    }),
    getActiveFundraiseSummary(userId),
  ])

  const latest = metrics[0]
  const previous = metrics[1]

  const monthlyRevenue = Number(latest?.revenue) || 0
  const monthlyExpenses = Number(latest?.expenses) || 0
  const cashOnHand = Number(latest?.cash) || 0
  const runwayMonths =
    monthlyExpenses > 0 ? Math.floor(cashOnHand / monthlyExpenses) : null

  const revenueGrowthPercent =
    previous && Number(previous.revenue) > 0
      ? Math.round(
          ((monthlyRevenue - Number(previous.revenue)) / Number(previous.revenue)) * 100
        )
      : null

  const recentMonths = metrics
    .slice()
    .reverse()
    .map((row) => ({
      month: String(row.month ?? "Unknown"),
      revenue: Number(row.revenue) || 0,
      expenses: Number(row.expenses) || 0,
      cash: Number(row.cash) || 0,
    }))

  return {
    monthlyRevenue,
    monthlyExpenses,
    cashOnHand,
    runwayMonths,
    revenueGrowthPercent,
    activeInvestorCount,
    recentMonths,
    currentFundraise,
  }
}
