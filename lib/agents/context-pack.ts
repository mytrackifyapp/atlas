import { getAgentFoundationConfig } from "@/lib/agents/foundation-config"
import { listOwnerFoundations } from "@/lib/agents/services/foundation"
import { computeRunway } from "@/lib/agents/services/finance"
import { getFounderMetricsSummary } from "@/lib/agents/services/metrics"
import { getFinnaToolset, type AgentSkillId } from "@/lib/agents/skills"

const MAX_PROFILE_LINES = 10
const MAX_FIELD_CHARS = 220

export type OperatingContextPack = {
  role: string | null
  skills: AgentSkillId[]
  profileLines: string[]
  finance: {
    workspaceId: string
    currency: string
    totalCash: number
    netBurnPerMonth: number
    runwayMonths: number | null
    accountCount: number
    transactionCount: number
  } | null
  metrics: {
    monthlyRevenue: number
    monthlyExpenses: number
    cashOnHand: number
    runwayMonths: number | null
    revenueGrowthPercent: number | null
    activeInvestorCount: number
  } | null
}

function clip(value: string, max = MAX_FIELD_CHARS): string {
  const trimmed = value.trim().replace(/\s+/g, " ")
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

export async function buildOperatingContextPack(input: {
  ownerId: string
  userRole?: string | null
  workspaceId?: string
}): Promise<OperatingContextPack> {
  const role = input.userRole ?? null
  const skills = getFinnaToolset(role).skills

  const profileLines: string[] = []
  let finance: OperatingContextPack["finance"] = null
  let metrics: OperatingContextPack["metrics"] = null

  const tasks: Promise<void>[] = [
    listOwnerFoundations(input.ownerId)
      .then((foundations) => {
        const seen = new Set<string>()
        for (const foundation of foundations) {
          const config = getAgentFoundationConfig(foundation.agentId)
          for (const field of config.fields) {
            const value = foundation.fields[field.key]?.trim()
            if (!value) continue
            const key = field.label.toLowerCase()
            if (seen.has(key)) continue
            seen.add(key)
            profileLines.push(`${field.label}: ${clip(value)}`)
            if (profileLines.length >= MAX_PROFILE_LINES) return
          }
        }
      })
      .catch((error) => {
        console.error("Context pack foundations failed:", error)
      }),
    computeRunway(input.ownerId, input.workspaceId, 30)
      .then((runway) => {
        if (runway.accountCount === 0 && runway.transactionCount === 0) return
        finance = {
          workspaceId: runway.workspaceId,
          currency: runway.currency,
          totalCash: runway.totalCash,
          netBurnPerMonth: runway.netBurnPerMonth,
          runwayMonths: runway.runwayMonths,
          accountCount: runway.accountCount,
          transactionCount: runway.transactionCount,
        }
      })
      .catch((error) => {
        console.error("Context pack finance failed:", error)
      }),
  ]

  if (role !== "investor") {
    tasks.push(
      getFounderMetricsSummary(input.ownerId)
        .then((summary) => {
          const hasSignal =
            summary.monthlyRevenue > 0 ||
            summary.monthlyExpenses > 0 ||
            summary.cashOnHand > 0 ||
            summary.activeInvestorCount > 0
          if (!hasSignal) return
          metrics = {
            monthlyRevenue: summary.monthlyRevenue,
            monthlyExpenses: summary.monthlyExpenses,
            cashOnHand: summary.cashOnHand,
            runwayMonths: summary.runwayMonths,
            revenueGrowthPercent: summary.revenueGrowthPercent,
            activeInvestorCount: summary.activeInvestorCount,
          }
        })
        .catch((error) => {
          console.error("Context pack metrics failed:", error)
        })
    )
  }

  await Promise.all(tasks)

  return { role, skills, profileLines, finance, metrics }
}

export function formatContextPackForPrompt(pack: OperatingContextPack): string {
  const lines: string[] = []
  const roleLabel =
    pack.role === "investor"
      ? "investor"
      : pack.role === "founder"
        ? "founder"
        : pack.role || "operator"

  lines.push(`User role: ${roleLabel}`)
  lines.push(`Enabled skills: ${pack.skills.join(", ")}`)

  if (pack.profileLines.length > 0) {
    lines.push("Business profile (from the user's setup):")
    for (const line of pack.profileLines) {
      lines.push(`- ${line}`)
    }
  }

  if (pack.finance) {
    const cash = formatMoney(pack.finance.totalCash, pack.finance.currency)
    const burn = formatMoney(pack.finance.netBurnPerMonth, pack.finance.currency)
    const runway =
      pack.finance.runwayMonths == null
        ? "n/a (cash-flow positive or insufficient burn data)"
        : `${pack.finance.runwayMonths} months`
    lines.push("Live finance snapshot (verify with tools for detail):")
    lines.push(
      `- Cash ${cash} across ${pack.finance.accountCount} account(s); net burn ${burn}/mo; runway ${runway}; ${pack.finance.transactionCount} tx in last 30 days.`
    )
  } else {
    lines.push(
      "Live finance snapshot: no accounts or transactions found yet. Do not invent balances."
    )
  }

  if (pack.metrics) {
    lines.push("Reported company metrics:")
    lines.push(
      `- Monthly revenue ${pack.metrics.monthlyRevenue}, expenses ${pack.metrics.monthlyExpenses}, cash ${pack.metrics.cashOnHand}, runway ${pack.metrics.runwayMonths ?? "n/a"} months, revenue growth ${pack.metrics.revenueGrowthPercent ?? "n/a"}%, active investors ${pack.metrics.activeInvestorCount}.`
    )
  }

  return `

Operating context (this user only — never invent beyond this and tool results):
${lines.join("\n")}`
}
