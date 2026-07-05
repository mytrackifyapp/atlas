import { generateText, stepCountIs } from "ai"

import { getAgentConfig } from "@/lib/agents/registry"
import {
  generateTextWithGroqFallback,
  streamTextWithGroqFallback,
} from "@/lib/agents/groq-model"
import { FINNA_SUPERVISOR_ADDENDUM } from "@/lib/agents/prompts/finna"
import { writeAuditLog } from "@/lib/agents/services/audit"
import { getToolsForAgent } from "@/lib/agents/tools/registry"
import { AI_CREDIT_COSTS } from "@/lib/ai-credits/plans"
import { recordAiUsage } from "@/lib/ai-credits/service"
import type { AgentChatMessage } from "@/lib/agents/types"

export type FinnaChatOptions = {
  agentId?: string
  messages: AgentChatMessage[]
  ownerId?: string
  userRole?: string | null
  persistAudit?: boolean
  correlationId?: string
  workspaceId?: string
  conversationId?: string
}

function buildSystemPrompt(agentId: string, supervisorMode: boolean): string {
  const config = getAgentConfig(agentId)
  if (!supervisorMode) return config.systemPrompt
  return `${config.systemPrompt}\n${FINNA_SUPERVISOR_ADDENDUM}`
}

function buildSupervisorTools(options: FinnaChatOptions) {
  if (!options.ownerId || options.agentId !== "finna") return undefined

  const tools = getToolsForAgent(
    {
      userId: options.ownerId,
      agentId: "finna",
      workspaceId: options.workspaceId,
    },
    options.correlationId,
    {
      conversationId: options.conversationId,
      userRole: options.userRole,
    }
  )

  return Object.keys(tools).length > 0 ? tools : undefined
}

export async function generateFinnaReply({
  agentId = "finna",
  messages,
  ownerId,
  userRole,
  persistAudit = false,
  correlationId,
  workspaceId,
  conversationId,
}: FinnaChatOptions) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY")
  }

  const config = getAgentConfig(agentId)
  const supervisorMode = agentId === "finna" && Boolean(ownerId)
  const tools = buildSupervisorTools({
    agentId,
    messages,
    ownerId,
    userRole,
    correlationId,
    workspaceId,
    conversationId,
  })

  const result = await generateTextWithGroqFallback({
    preferredModel: config.model,
    system: buildSystemPrompt(agentId, supervisorMode),
    messages,
    maxOutputTokens: config.maxTokens,
    temperature: config.temperature,
    tools,
    stopWhen: tools ? stepCountIs(10) : undefined,
  })

  if (persistAudit && ownerId) {
    const delegations =
      result.steps?.flatMap((step) =>
        (step.toolCalls ?? [])
          .filter((call) => call.toolName === "delegate_to_agent")
          .map((call) => call.toolCallId)
      ) ?? []

    await writeAuditLog({
      ownerId,
      agentId,
      action: "chat.complete",
      correlationId,
      model: result.modelId,
      policyDecision: "allowed",
      metadata: {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        supervisorMode,
        delegationCount: delegations.length,
      },
    })

    try {
      await recordAiUsage({
        ownerId,
        feature: delegations.length > 0 ? "agent_delegation" : "finna_chat",
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        delegationCount: delegations.length,
        model: result.modelId,
        agentId,
        correlationId,
      })
    } catch (creditError) {
      console.error("Credit debit failed after Finna generate:", creditError)
    }
  }

  return result
}

export async function streamFinnaReply({
  agentId = "finna",
  messages,
  ownerId,
  userRole,
  persistAudit = false,
  correlationId,
  workspaceId,
  conversationId,
}: FinnaChatOptions) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY")
  }

  const config = getAgentConfig(agentId)
  const supervisorMode = agentId === "finna" && Boolean(ownerId)
  const tools = buildSupervisorTools({
    agentId,
    messages,
    ownerId,
    userRole,
    correlationId,
    workspaceId,
    conversationId,
  })

  const { result, modelId } = await streamTextWithGroqFallback({
    preferredModel: config.model,
    system: buildSystemPrompt(agentId, supervisorMode),
    messages,
    maxOutputTokens: config.maxTokens,
    temperature: config.temperature,
    tools,
    stopWhen: tools ? stepCountIs(10) : undefined,
    onFinish: async ({ usage, steps }) => {
      if (!persistAudit || !ownerId) return

      const delegationCount =
        steps?.flatMap((step) =>
          (step.toolCalls ?? []).filter((call) => call.toolName === "delegate_to_agent")
        ).length ?? 0

      await writeAuditLog({
        ownerId,
        agentId,
        action: "chat.complete",
        correlationId,
        model: modelId,
        policyDecision: "allowed",
        metadata: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          supervisorMode,
          delegationCount,
        },
      })

      try {
        await recordAiUsage({
          ownerId,
          feature: delegationCount > 0 ? "agent_delegation" : "finna_chat",
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          delegationCount,
          model: modelId,
          agentId,
          correlationId,
        })
      } catch (creditError) {
        console.error("Credit debit failed after Finna stream:", creditError)
      }
    },
  })

  return result
}
