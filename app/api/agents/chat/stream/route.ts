import { stepCountIs } from "ai"
import { NextRequest } from "next/server"

import { requireAgentAccess } from "@/lib/agents/auth"
import { createCorrelationId } from "@/lib/agents/correlation"
import {
  isVagueSocialDesignRequest,
  socialDesignClarificationPrompt,
} from "@/lib/social/marketer-chat-intent"
import {
  groqRateLimitResponse,
  isGroqRateLimitError,
  streamTextWithGroqFallback,
} from "@/lib/agents/groq-model"
import { formatFoundationForPrompt } from "@/lib/agents/foundation-prompt"
import { getAgentConfig } from "@/lib/agents/registry"
import { getAgentFoundation } from "@/lib/agents/services/foundation"
import {
  checkAuthenticatedAgentRateLimit,
  rateLimitHeaders,
} from "@/lib/agents/rate-limit"
import {
  checkAiCredits,
  creditHeaders,
  insufficientCreditsMessage,
  recordAiUsage,
} from "@/lib/ai-credits/service"
import { AI_CREDIT_COSTS } from "@/lib/ai-credits/plans"
import { writeAuditLog } from "@/lib/agents/services/audit"
import {
  getConversation,
  getConversationMessages,
  saveMessage,
} from "@/lib/agents/services/conversations"
import { agentHasTools, getToolsForAgent } from "@/lib/agents/tools/registry"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return new Response("Missing GROQ_API_KEY", { status: 503 })
  }

  const body = (await request.json()) as {
    agentId?: string
    conversationId?: string
    message?: string
    workspaceId?: string
    salesLeadContext?: {
      id: string
      name: string
      company: string
      email?: string
      stage: string
    }
  }

  const { agentId, conversationId, message, workspaceId, salesLeadContext } = body

  if (!agentId || !conversationId || !message?.trim()) {
    return new Response("agentId, conversationId, and message are required", {
      status: 400,
    })
  }

  const access = await requireAgentAccess(agentId)
  if (!access.ok) {
    return new Response(access.error, { status: access.status })
  }

  const rateLimit = await checkAuthenticatedAgentRateLimit(access.ctx.userId)
  if (!rateLimit.success) {
    await writeAuditLog({
      ownerId: access.ctx.userId,
      agentId,
      action: "rate_limit.exceeded",
      actorType: "user",
      actorId: access.ctx.userId,
      policyDecision: "denied",
    })
    return new Response("Rate limit exceeded. Please try again later.", {
      status: 429,
      headers: rateLimitHeaders(rateLimit),
    })
  }

  let creditCheck = await checkAiCredits(access.ctx.userId, AI_CREDIT_COSTS.agentChatMin)
  if (!creditCheck.success) {
    await writeAuditLog({
      ownerId: access.ctx.userId,
      agentId,
      action: "credits.insufficient",
      actorType: "user",
      actorId: access.ctx.userId,
      policyDecision: "denied",
      metadata: { balance: creditCheck.balance, required: creditCheck.required },
    })
    return new Response(insufficientCreditsMessage(creditCheck), {
      status: 402,
      headers: { ...rateLimitHeaders(rateLimit), ...creditHeaders(creditCheck) },
    })
  }

  const conversation = await getConversation(conversationId, access.ctx.userId)
  if (!conversation || conversation.agentId !== agentId) {
    return new Response("Conversation not found", { status: 404 })
  }

  const correlationId = createCorrelationId()
  const config = getAgentConfig(agentId)
  const history = await getConversationMessages(conversationId, access.ctx.userId)

  await saveMessage({
    conversationId,
    ownerId: access.ctx.userId,
    agentId,
    role: "user",
    content: message.trim(),
  })

  await writeAuditLog({
    ownerId: access.ctx.userId,
    agentId,
    action: "chat.start",
    actorType: "user",
    actorId: access.ctx.userId,
    conversationId,
    correlationId,
    model: config.model,
    policyDecision: "allowed",
  })

  const toolCtx = {
    userId: access.ctx.userId,
    agentId,
    workspaceId,
    userRole: access.ctx.role,
  }
  const tools = getToolsForAgent(toolCtx, correlationId, {
    conversationId,
    userRole: access.ctx.role,
  })
  const hasTools = agentHasTools(agentId) && Object.keys(tools).length > 0

  let systemPrompt = config.systemPrompt

  const foundation = await getAgentFoundation(access.ctx.userId, agentId)
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

  if (agentId === "ai-marketer" && isVagueSocialDesignRequest(message.trim())) {
    systemPrompt += socialDesignClarificationPrompt(message.trim())
  }

  try {
    const { result, modelId } = await streamTextWithGroqFallback({
      preferredModel: config.model,
      system: systemPrompt,
      messages: [...history, { role: "user", content: message.trim() }],
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
      tools: hasTools ? tools : undefined,
      stopWhen: hasTools ? stepCountIs(8) : undefined,
      onFinish: async ({ text, usage, steps }) => {
        const content = text.trim()
        if (!content) return

        const toolCalls = steps?.flatMap((step) =>
          (step.toolCalls ?? []).map((call) => ({
            toolName: call.toolName,
            toolCallId: call.toolCallId,
          }))
        )

        await saveMessage({
          conversationId,
          ownerId: access.ctx.userId,
          agentId,
          role: "assistant",
          content,
          metadata: {
            model: modelId,
            tokenUsage: {
              input: usage.inputTokens,
              output: usage.outputTokens,
            },
          },
        })

        await writeAuditLog({
          ownerId: access.ctx.userId,
          agentId,
          action: "chat.complete",
          conversationId,
          correlationId,
          model: modelId,
          policyDecision: "allowed",
          metadata: {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            toolCallCount: toolCalls?.length ?? 0,
            toolCalls,
            workspaceId: workspaceId ?? null,
          },
        })

        try {
          const delegationCount =
            toolCalls?.filter((call) => call.toolName === "delegate_to_agent").length ?? 0
          const usageResult = await recordAiUsage({
            ownerId: access.ctx.userId,
            feature: delegationCount > 0 ? "agent_delegation" : "agent_chat",
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            delegationCount,
            model: modelId,
            agentId,
            correlationId,
          })
          creditCheck.balance = usageResult.balance
        } catch (creditError) {
          console.error("Credit debit failed after chat.complete:", creditError)
        }
      },
    })
    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        "X-Groq-Model": modelId,
        ...rateLimitHeaders(rateLimit),
        ...creditHeaders(creditCheck),
      },
    })
  } catch (error) {
    if (isGroqRateLimitError(error)) {
      return groqRateLimitResponse(error, rateLimitHeaders(rateLimit))
    }
    throw error
  }
}
