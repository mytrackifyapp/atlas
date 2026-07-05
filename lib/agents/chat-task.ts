import "server-only"

import { generateText, stepCountIs, type ToolSet } from "ai"

import { generateTextWithGroqFallback } from "@/lib/agents/groq-model"
import { formatFoundationForPrompt } from "@/lib/agents/foundation-prompt"
import { getAgentConfig } from "@/lib/agents/registry"
import { getAgentFoundation } from "@/lib/agents/services/foundation"
import { writeAuditLog } from "@/lib/agents/services/audit"
import { recordAiUsage } from "@/lib/ai-credits/service"
import {
  getConversation,
  getConversationMessages,
  saveMessage,
} from "@/lib/agents/services/conversations"
import { getAgentRun, updateAgentRun } from "@/lib/agents/services/runs"
import { agentHasTools, getToolsForAgent } from "@/lib/agents/tools/registry"
import {
  isVagueSocialDesignRequest,
  socialDesignClarificationPrompt,
} from "@/lib/social/marketer-chat-intent"

export type SalesLeadContextInput = {
  id: string
  name: string
  company: string
  email?: string
  stage: string
}

export type ChatTaskInput = {
  conversationId: string
  message: string
  userRole?: string | null
  workspaceId?: string
  salesLeadContext?: SalesLeadContextInput
}

async function buildSystemPrompt(
  agentId: string,
  userMessage: string,
  ownerId: string,
  salesLeadContext?: SalesLeadContextInput,
) {
  const config = getAgentConfig(agentId)
  let systemPrompt = config.systemPrompt

  const foundation = await getAgentFoundation(ownerId, agentId)
  systemPrompt += formatFoundationForPrompt(agentId, foundation)

  if (salesLeadContext && agentId === "ai-sales-rep") {
    systemPrompt += `\n\nActive CRM lead (reuse this leadId — do NOT create a new lead for this person):
- leadId: ${salesLeadContext.id}
- name: ${salesLeadContext.name}
- company: ${salesLeadContext.company}
- email: ${salesLeadContext.email ?? "none"}
- stage: ${salesLeadContext.stage}
When the user asks to email or follow up with this person, use leadId ${salesLeadContext.id} directly.`
  }

  if (agentId === "ai-marketer" && isVagueSocialDesignRequest(userMessage)) {
    systemPrompt += socialDesignClarificationPrompt(userMessage)
  }

  return systemPrompt
}

export async function executeChatTask(input: {
  ownerId: string
  agentId: string
  correlationId?: string
  task: ChatTaskInput
}): Promise<{ summary: string }> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY")
  }

  const conversation = await getConversation(input.task.conversationId, input.ownerId)
  if (!conversation || conversation.agentId !== input.agentId) {
    throw new Error("Conversation not found")
  }

  const config = getAgentConfig(input.agentId)
  const history = await getConversationMessages(
    input.task.conversationId,
    input.ownerId
  )

  const toolCtx = {
    userId: input.ownerId,
    agentId: input.agentId,
    workspaceId: input.task.workspaceId,
    userRole: input.task.userRole ?? undefined,
  }

  const tools = getToolsForAgent(toolCtx, input.correlationId, {
    conversationId: input.task.conversationId,
    userRole: input.task.userRole ?? undefined,
  })
  const hasTools = agentHasTools(input.agentId) && Object.keys(tools).length > 0

  const result = await generateTextWithGroqFallback({
    preferredModel: config.model,
    system: await buildSystemPrompt(
      input.agentId,
      input.task.message.trim(),
      input.ownerId,
      input.task.salesLeadContext,
    ),
    messages: [...history, { role: "user", content: input.task.message.trim() }],
    maxOutputTokens: config.maxTokens,
    temperature: config.temperature,
    tools: hasTools ? (tools as ToolSet) : undefined,
    stopWhen: hasTools ? stepCountIs(12) : undefined,
  })

  const content = result.text.trim()
  if (!content) {
    throw new Error("Agent returned an empty response")
  }

  await saveMessage({
    conversationId: input.task.conversationId,
    ownerId: input.ownerId,
    agentId: input.agentId,
    role: "assistant",
    content,
    metadata: {
      model: result.modelId,
      tokenUsage: {
        input: result.usage.inputTokens,
        output: result.usage.outputTokens,
      },
    },
  })

  const toolCalls =
    result.steps?.flatMap((step) =>
      (step.toolCalls ?? []).map((call) => call.toolName)
    ) ?? []

  await writeAuditLog({
    ownerId: input.ownerId,
    agentId: input.agentId,
    action: "chat.complete",
    conversationId: input.task.conversationId,
    correlationId: input.correlationId,
    model: result.modelId,
    policyDecision: "allowed",
    metadata: {
      background: true,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      toolCallCount: toolCalls.length,
      toolCalls,
    },
  })

  try {
    await recordAiUsage({
      ownerId: input.ownerId,
      feature: "agent_background",
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      model: result.modelId,
      agentId: input.agentId,
      correlationId: input.correlationId,
      description: "Background chat task",
    })
  } catch (creditError) {
    console.error("Credit debit failed after background chat:", creditError)
  }

  return { summary: content }
}

export async function executeChatTaskRun(
  runId: string,
  ownerId: string
): Promise<void> {
  const run = await getAgentRun(runId, ownerId)
  if (!run || run.taskType !== "chat_task") {
    throw new Error("Chat task run not found")
  }

  const task = run.input as ChatTaskInput | undefined
  if (!task?.conversationId || !task.message?.trim()) {
    throw new Error("Invalid chat task input")
  }

  await updateAgentRun(runId, { status: "running", startedAt: new Date() })

  try {
    const result = await executeChatTask({
      ownerId,
      agentId: run.agentId,
      correlationId: run.correlationId,
      task,
    })

    await updateAgentRun(runId, {
      status: "completed",
      output: {
        summary: result.summary,
        conversationId: task.conversationId,
      },
      completedAt: new Date(),
    })
  } catch (error) {
    await updateAgentRun(runId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Chat task failed",
      completedAt: new Date(),
    })
    throw error
  }
}

export function isLikelyLongRunningTask(message: string): boolean {
  const text = message.toLowerCase()
  if (text.length > 140) return true

  const patterns = [
    /\bsequence\b/,
    /\bmultiple\b/,
    /\bbatch\b/,
    /\ball (my )?leads\b/,
    /\beach lead\b/,
    /\bevery lead\b/,
    /\bresearch .+ and (draft|write|send)\b/,
    /\bdraft .+ (emails?|sequences?)\b/,
    /\b\d+\s+(leads?|emails?|companies)\b/,
  ]

  return patterns.some((pattern) => pattern.test(text))
}
