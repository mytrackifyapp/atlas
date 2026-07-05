import { tool } from "ai"
import { z } from "zod"

import { delegateToAgent } from "@/lib/agents/orchestration/delegation"
import {
  getAgentChatPath,
  getAgentDisplayName,
  isDelegatableAgent,
} from "@/lib/agents/orchestration/routing"
import { listInstalledAgentProfiles } from "@/lib/agents/services/installed"
import { wrapToolWithPolicy } from "@/lib/agents/tools/wrap"
import type { ToolContext, ToolPolicy } from "@/lib/agents/tools/types"

export type OrchestrationToolName = "list_my_agents" | "delegate_to_agent"

const ORCHESTRATION_POLICIES: Record<OrchestrationToolName, ToolPolicy> = {
  list_my_agents: {
    id: "list_my_agents",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: ["finna"],
  },
  delegate_to_agent: {
    id: "delegate_to_agent",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: ["finna"],
  },
}

export function getOrchestrationToolPolicy(
  toolId: OrchestrationToolName
): ToolPolicy {
  return ORCHESTRATION_POLICIES[toolId]
}

export function createOrchestrationTools(
  ctx: ToolContext,
  options?: {
    correlationId?: string
    conversationId?: string
    userRole?: string | null
  }
) {
  const correlationId = options?.correlationId
  const conversationId = options?.conversationId
  const userRole = options?.userRole

  const listMyAgents = tool({
    description:
      "List the user's installed AI Employees (specialist agents) available for delegation.",
    inputSchema: z.object({}),
    execute: async () => {
      const agents = await listInstalledAgentProfiles(ctx.userId)
      return {
        count: agents.length,
        agents: agents.map((agent) => ({
          ...agent,
          chatPath: getAgentChatPath(agent.id, userRole),
        })),
      }
    },
  })

  const delegateToAgentTool = tool({
    description:
      "Delegate a specific task to an installed specialist agent. Use for runway, contracts, outreach, marketing, legal, and other domain work instead of guessing.",
    inputSchema: z.object({
      agentId: z
        .string()
        .describe(
          "Target specialist agent ID, e.g. ai-cfo, ai-lawyer, ai-sales-rep, ai-marketer, ai-ops-manager"
        ),
      task: z
        .string()
        .min(1)
        .describe(
          "Clear task or question for the specialist, including relevant context from the user"
        ),
      workspaceId: z
        .string()
        .optional()
        .describe("Optional finance workspace ID for CFO/fundraising tasks"),
    }),
    execute: async ({ agentId, task, workspaceId }) => {
      if (!isDelegatableAgent(agentId)) {
        return {
          error: `Unknown or non-delegatable agent: ${agentId}`,
          suggestion: "Call list_my_agents to see installed specialists.",
        }
      }

      const result = await delegateToAgent({
        ownerId: ctx.userId,
        fromAgentId: ctx.agentId,
        targetAgentId: agentId,
        task,
        workspaceId: workspaceId ?? ctx.workspaceId,
        correlationId,
        conversationId,
      })

      return {
        agentId: result.agentId,
        agentName: getAgentDisplayName(result.agentId),
        response: result.response,
        toolCallCount: result.toolCallCount,
        chatPath: getAgentChatPath(result.agentId, userRole),
      }
    },
  })

  return {
    list_my_agents: wrapToolWithPolicy(
      listMyAgents,
      ORCHESTRATION_POLICIES.list_my_agents,
      ctx,
      correlationId
    ),
    delegate_to_agent: wrapToolWithPolicy(
      delegateToAgentTool,
      ORCHESTRATION_POLICIES.delegate_to_agent,
      ctx,
      correlationId
    ),
  }
}

export function getSupervisorToolsForFinna(
  ctx: ToolContext,
  options?: {
    correlationId?: string
    conversationId?: string
    userRole?: string | null
  }
) {
  if (ctx.agentId !== "finna") return {}
  return createOrchestrationTools(ctx, options)
}
