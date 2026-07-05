import { tool } from "ai"
import { z } from "zod"

import { getCompanyStructure } from "@/lib/agents/services/company"
import { listDealFlow } from "@/lib/agents/services/deals"
import {
  getActiveFundraiseSummary,
  getInvestorPipeline,
} from "@/lib/agents/services/fundraising"
import { getFounderMetricsSummary } from "@/lib/agents/services/metrics"
import { listInvestorUpdates } from "@/lib/agents/services/updates"
import { writeAuditLog } from "@/lib/agents/services/audit"
import { wrapToolWithPolicy } from "@/lib/agents/tools/wrap"
import type { ToolContext, ToolPolicy } from "@/lib/agents/tools/types"

export type DomainToolName =
  | "get_fundraise_summary"
  | "get_investor_pipeline"
  | "get_deal_flow"
  | "get_company_structure"
  | "get_investor_updates"
  | "get_founder_metrics"

const DOMAIN_TOOL_DESCRIPTIONS: Record<DomainToolName, string> = {
  get_fundraise_summary:
    "Active fundraising round: target, committed, close date, and progress.",
  get_investor_pipeline:
    "Investor pipeline for the active round: names, status, amounts, and stages.",
  get_deal_flow:
    "Investor deal flow pipeline (companies/deals under review). Investor workspaces only.",
  get_company_structure:
    "Team members, stakeholders, roles, and reported equity from company structure.",
  get_investor_updates:
    "Past investor updates sent by the founder (titles, previews, recipients).",
  get_founder_metrics:
    "Founder KPIs: revenue, expenses, cash, runway, and recent monthly metrics.",
}

const DOMAIN_POLICIES: Record<DomainToolName, ToolPolicy> = {
  get_fundraise_summary: {
    id: "get_fundraise_summary",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  get_investor_pipeline: {
    id: "get_investor_pipeline",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  get_deal_flow: {
    id: "get_deal_flow",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  get_company_structure: {
    id: "get_company_structure",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  get_investor_updates: {
    id: "get_investor_updates",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  get_founder_metrics: {
    id: "get_founder_metrics",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
}

function parseOptionalLimit(value: string | number | undefined, fallback: number) {
  if (value === undefined || value === null || value === "") return fallback
  const n = typeof value === "number" ? value : parseInt(String(value), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(50, Math.max(1, Math.trunc(n)))
}

async function auditDomainTool(
  ctx: ToolContext,
  toolId: DomainToolName,
  correlationId: string | undefined,
  extra?: Record<string, unknown>
) {
  await writeAuditLog({
    ownerId: ctx.userId,
    agentId: ctx.agentId,
    action: "tool.execute",
    correlationId,
    policyDecision: "allowed",
    resource: { type: "tool", id: toolId },
    metadata: { toolId, ...extra },
  })
}

export function getDomainToolPolicy(
  toolId: DomainToolName,
  allowedAgents: string[]
): ToolPolicy {
  return { ...DOMAIN_POLICIES[toolId], allowedAgents }
}

export function createDomainTools(ctx: ToolContext, correlationId?: string) {
  const emptySchema = z.object({})

  const tools = {
    get_fundraise_summary: tool({
      description: DOMAIN_TOOL_DESCRIPTIONS.get_fundraise_summary,
      inputSchema: emptySchema,
      execute: async () => {
        const fundraise = await getActiveFundraiseSummary(ctx.userId)
        await auditDomainTool(ctx, "get_fundraise_summary", correlationId, {
          hasFundraise: Boolean(fundraise),
        })
        return { fundraise }
      },
    }),

    get_investor_pipeline: tool({
      description: DOMAIN_TOOL_DESCRIPTIONS.get_investor_pipeline,
      inputSchema: z.object({
        limit: z.union([z.string(), z.number()]).optional(),
      }),
      execute: async ({ limit }) => {
        const result = await getInvestorPipeline(
          ctx.userId,
          parseOptionalLimit(limit, 25)
        )
        await auditDomainTool(ctx, "get_investor_pipeline", correlationId, {
          investorCount: result.investors.length,
        })
        return result
      },
    }),

    get_deal_flow: tool({
      description: DOMAIN_TOOL_DESCRIPTIONS.get_deal_flow,
      inputSchema: z.object({
        limit: z.union([z.string(), z.number()]).optional(),
      }),
      execute: async ({ limit }) => {
        if (ctx.userRole === "founder") {
          return {
            deals: [],
            note: "Deal flow is an investor workspace feature. Founder users should use get_investor_pipeline instead.",
          }
        }
        const deals = await listDealFlow(
          ctx.userId,
          parseOptionalLimit(limit, 20)
        )
        await auditDomainTool(ctx, "get_deal_flow", correlationId, {
          dealCount: deals.length,
        })
        return { deals }
      },
    }),

    get_company_structure: tool({
      description: DOMAIN_TOOL_DESCRIPTIONS.get_company_structure,
      inputSchema: emptySchema,
      execute: async () => {
        const structure = await getCompanyStructure(ctx.userId)
        await auditDomainTool(ctx, "get_company_structure", correlationId, {
          teamCount: structure.teamCount,
        })
        return structure
      },
    }),

    get_investor_updates: tool({
      description: DOMAIN_TOOL_DESCRIPTIONS.get_investor_updates,
      inputSchema: z.object({
        limit: z.union([z.string(), z.number()]).optional(),
      }),
      execute: async ({ limit }) => {
        const updates = await listInvestorUpdates(
          ctx.userId,
          parseOptionalLimit(limit, 10)
        )
        await auditDomainTool(ctx, "get_investor_updates", correlationId, {
          updateCount: updates.length,
        })
        return { updates }
      },
    }),

    get_founder_metrics: tool({
      description: DOMAIN_TOOL_DESCRIPTIONS.get_founder_metrics,
      inputSchema: emptySchema,
      execute: async () => {
        const metrics = await getFounderMetricsSummary(ctx.userId)
        await auditDomainTool(ctx, "get_founder_metrics", correlationId)
        return metrics
      },
    }),
  }

  return tools
}

export function wrapDomainToolsForAgent(
  ctx: ToolContext,
  toolIds: DomainToolName[],
  correlationId?: string
) {
  const all = createDomainTools(ctx, correlationId)
  const wrapped: Partial<ReturnType<typeof createDomainTools>> = {}

  for (const id of toolIds) {
    const policy = getDomainToolPolicy(id, [ctx.agentId])
    if (!policy.allowedAgents.includes(ctx.agentId)) continue
    wrapped[id] = wrapToolWithPolicy(all[id], policy, ctx, correlationId)
  }

  return wrapped
}
