import { stepCountIs, type ToolSet } from "ai"

import { getAgentConfig } from "@/lib/agents/registry"
import {
  generateTextWithGroqFallback,
  streamTextWithGroqFallback,
} from "@/lib/agents/groq-model"
import {
  buildOperatingContextPack,
  formatContextPackForPrompt,
} from "@/lib/agents/context-pack"
import { formatPlatformContextForAudience } from "@/lib/agents/prompts/shared"
import { FINNA_SUPERVISOR_ADDENDUM, FINNA_SYSTEM_PROMPT } from "@/lib/agents/prompts/finna"
import { writeAuditLog } from "@/lib/agents/services/audit"
import { getToolsForAgent } from "@/lib/agents/tools/registry"
import { AI_CREDIT_COSTS } from "@/lib/ai-credits/plans"
import { recordAiUsage } from "@/lib/ai-credits/service"
import type { AgentChatMessage } from "@/lib/agents/types"
import { formatFinnaIdentityPrompt, type FinnaAudienceRole } from "@/lib/finna-role"

export type FinnaChatOptions = {
  agentId?: string
  messages: AgentChatMessage[]
  ownerId?: string
  userRole?: string | null
  userName?: string | null
  audienceRole?: FinnaAudienceRole | null
  persistAudit?: boolean
  correlationId?: string
  workspaceId?: string
  conversationId?: string
}

async function buildSystemPrompt(options: FinnaChatOptions): Promise<string> {
  const agentId = options.agentId ?? "finna"
  const supervisorMode = agentId === "finna" && Boolean(options.ownerId)
  const identity = formatFinnaIdentityPrompt({
    name: options.userName,
    audienceRole: options.audienceRole ?? null,
  })
  const workspace = formatPlatformContextForAudience(options.audienceRole ?? null)

  if (agentId !== "finna") {
    return getAgentConfig(agentId).systemPrompt
  }

  if (!supervisorMode) {
    return `${FINNA_SYSTEM_PROMPT}\n${workspace}\n${identity}`
  }

  const config = getAgentConfig("finna", { userRole: options.userRole })
  let prompt = `${config.systemPrompt}\n${workspace}\n${identity}\n${FINNA_SUPERVISOR_ADDENDUM}`

  try {
    const pack = await buildOperatingContextPack({
      ownerId: options.ownerId!,
      userRole: options.userRole,
      workspaceId: options.workspaceId,
    })
    prompt += formatContextPackForPrompt(pack)
  } catch (error) {
    console.error("Finna context pack failed:", error)
  }

  return prompt
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

  return Object.keys(tools).length > 0 ? (tools as ToolSet) : undefined
}

export async function generateFinnaReply({
  agentId = "finna",
  messages,
  ownerId,
  userRole,
  userName,
  audienceRole,
  persistAudit = false,
  correlationId,
  workspaceId,
  conversationId,
}: FinnaChatOptions) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY")
  }

  const chatOptions: FinnaChatOptions = {
    agentId,
    messages,
    ownerId,
    userRole,
    userName,
    audienceRole,
    persistAudit,
    correlationId,
    workspaceId,
    conversationId,
  }
  const config = getAgentConfig(agentId, { userRole })
  const supervisorMode = agentId === "finna" && Boolean(ownerId)
  const [system, tools] = await Promise.all([
    buildSystemPrompt(chatOptions),
    Promise.resolve(buildSupervisorTools(chatOptions)),
  ])

  const result = await generateTextWithGroqFallback({
    preferredModel: config.model,
    system,
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
  userName,
  audienceRole,
  persistAudit = false,
  correlationId,
  workspaceId,
  conversationId,
}: FinnaChatOptions) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY")
  }

  const chatOptions: FinnaChatOptions = {
    agentId,
    messages,
    ownerId,
    userRole,
    userName,
    audienceRole,
    persistAudit,
    correlationId,
    workspaceId,
    conversationId,
  }
  const config = getAgentConfig(agentId, { userRole })
  const supervisorMode = agentId === "finna" && Boolean(ownerId)
  const [system, tools] = await Promise.all([
    buildSystemPrompt(chatOptions),
    Promise.resolve(buildSupervisorTools(chatOptions)),
  ])

  const { result, modelId } = await streamTextWithGroqFallback({
    preferredModel: config.model,
    system,
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
