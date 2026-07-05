import { createFinanceTools, type FinanceToolName } from "@/lib/agents/tools/finance"
import {
  wrapDomainToolsForAgent,
  type DomainToolName,
} from "@/lib/agents/tools/domain"
import {
  wrapSalesToolsForAgent,
  type SalesToolName,
} from "@/lib/agents/tools/sales"
import {
  wrapSocialToolsForAgent,
  type SocialToolName,
} from "@/lib/agents/tools/social"
import {
  agentHasLiveTools,
  agentSupportsKnowledge,
  getDomainToolIdsForAgent,
  getFinanceToolIdsForAgent,
  getSalesToolIdsForAgent,
  getSocialToolIdsForAgent,
} from "@/lib/agents/tool-map"
import {
  createKnowledgeTools,
  type KnowledgeToolName,
} from "@/lib/agents/tools/knowledge"
import { getSupervisorToolsForFinna } from "@/lib/agents/tools/orchestration"
import { wrapToolWithPolicy } from "@/lib/agents/tools/wrap"
import type { ToolContext, ToolPolicy } from "@/lib/agents/tools/types"

const FINANCE_POLICIES: Record<FinanceToolName, ToolPolicy> = {
  get_accounts: {
    id: "get_accounts",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  get_transactions: {
    id: "get_transactions",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  compute_runway: {
    id: "compute_runway",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
}

export type AgentToolName =
  | FinanceToolName
  | DomainToolName
  | SalesToolName
  | SocialToolName
  | KnowledgeToolName
  | "list_my_agents"
  | "delegate_to_agent"

export function getToolPolicy(toolId: FinanceToolName): ToolPolicy {
  return FINANCE_POLICIES[toolId]
}

export function getToolIdsForAgent(agentId: string): FinanceToolName[] {
  return getFinanceToolIdsForAgent(agentId)
}

export function getToolsForAgent(
  ctx: ToolContext,
  correlationId?: string,
  options?: { conversationId?: string; userRole?: string | null }
) {
  const toolCtx: ToolContext = {
    ...ctx,
    userRole: options?.userRole ?? ctx.userRole,
  }

  const tools: Record<string, unknown> = {}

  const financeToolIds = getFinanceToolIdsForAgent(toolCtx.agentId)
  if (financeToolIds.length > 0) {
    const financeTools = createFinanceTools(toolCtx, correlationId)
    for (const id of financeToolIds) {
      const policy = { ...FINANCE_POLICIES[id], allowedAgents: [toolCtx.agentId] }
      tools[id] = wrapToolWithPolicy(financeTools[id], policy, toolCtx, correlationId)
    }
  }

  const domainToolIds = getDomainToolIdsForAgent(toolCtx.agentId)
  if (domainToolIds.length > 0) {
    Object.assign(
      tools,
      wrapDomainToolsForAgent(toolCtx, domainToolIds, correlationId)
    )
  }

  const salesToolIds = getSalesToolIdsForAgent(toolCtx.agentId)
  if (salesToolIds.length > 0) {
    Object.assign(
      tools,
      wrapSalesToolsForAgent(toolCtx, salesToolIds, correlationId)
    )
  }

  const socialToolIds = getSocialToolIdsForAgent(toolCtx.agentId)
  if (socialToolIds.length > 0) {
    Object.assign(
      tools,
      wrapSocialToolsForAgent(toolCtx, socialToolIds, correlationId)
    )
  }

  if (agentSupportsKnowledge(toolCtx.agentId)) {
    Object.assign(
      tools,
      createKnowledgeTools(toolCtx, correlationId, options?.conversationId)
    )
  }

  if (toolCtx.agentId === "finna") {
    Object.assign(
      tools,
      getSupervisorToolsForFinna(toolCtx, {
        correlationId,
        conversationId: options?.conversationId,
        userRole: options?.userRole ?? toolCtx.userRole,
      })
    )
  }

  return tools
}

export function agentHasTools(agentId: string): boolean {
  return agentHasLiveTools(agentId)
}
