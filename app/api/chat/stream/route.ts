import { NextRequest } from "next/server"

import { streamFinnaReply } from "@/lib/agents/chat"
import {
  groqRateLimitResponse,
  isGroqRateLimitError,
} from "@/lib/agents/groq-model"
import { requireAgentAccess, getOptionalSession, isPublicFinnaAgent } from "@/lib/agents/auth"
import { createCorrelationId } from "@/lib/agents/correlation"
import {
  checkAuthenticatedAgentRateLimit,
  checkPublicFinnaRateLimit,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/agents/rate-limit"
import { AI_CREDIT_COSTS } from "@/lib/ai-credits/plans"
import {
  checkAiCredits,
  creditHeaders,
  insufficientCreditsMessage,
} from "@/lib/ai-credits/service"
import type { AgentChatMessage } from "@/lib/agents/types"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return new Response("Missing GROQ_API_KEY", { status: 503 })
  }

  const body = (await request.json()) as {
    agentId?: string
    messages?: AgentChatMessage[]
    workspaceId?: string
    conversationId?: string
  }

  const agentId = body.agentId ?? "finna"
  const messages = body.messages
  const workspaceId = body.workspaceId
  const conversationId = body.conversationId

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages is required", { status: 400 })
  }

  const session = await getOptionalSession()
  const correlationId = createCorrelationId()
  let rateLimitHeadersOut: Record<string, string> = {}
  let creditHeadersOut: Record<string, string> = {}

  if (!isPublicFinnaAgent(agentId)) {
    const access = await requireAgentAccess(agentId)
    if (!access.ok) {
      return new Response(access.error, { status: access.status })
    }

    const rateLimit = await checkAuthenticatedAgentRateLimit(access.ctx.userId)
    rateLimitHeadersOut = rateLimitHeaders(rateLimit)
    if (!rateLimit.success) {
      return new Response("Rate limit exceeded. Please try again later.", {
        status: 429,
        headers: rateLimitHeadersOut,
      })
    }

    const creditCheck = await checkAiCredits(access.ctx.userId, AI_CREDIT_COSTS.agentChatMin)
    creditHeadersOut = creditHeaders(creditCheck)
    if (!creditCheck.success) {
      return new Response(insufficientCreditsMessage(creditCheck), {
        status: 402,
        headers: { ...rateLimitHeadersOut, ...creditHeadersOut },
      })
    }
  } else if (!session) {
    const rateLimit = await checkPublicFinnaRateLimit(getClientIp(request))
    rateLimitHeadersOut = rateLimitHeaders(rateLimit)
    if (!rateLimit.success) {
      return new Response("Rate limit exceeded. Please sign in or try again later.", {
        status: 429,
        headers: rateLimitHeadersOut,
      })
    }
  } else {
    const rateLimit = await checkAuthenticatedAgentRateLimit(session.user.id)
    rateLimitHeadersOut = rateLimitHeaders(rateLimit)
    if (!rateLimit.success) {
      return new Response("Rate limit exceeded. Please try again later.", {
        status: 429,
        headers: rateLimitHeadersOut,
      })
    }

    const creditCheck = await checkAiCredits(session.user.id, AI_CREDIT_COSTS.finnaChatMin)
    creditHeadersOut = creditHeaders(creditCheck)
    if (!creditCheck.success) {
      return new Response(insufficientCreditsMessage(creditCheck), {
        status: 402,
        headers: { ...rateLimitHeadersOut, ...creditHeadersOut },
      })
    }
  }

  try {
    const result = await streamFinnaReply({
      agentId,
      messages,
      ownerId: session?.user.id,
      userRole: session?.user.role,
      persistAudit: Boolean(session),
      correlationId,
      workspaceId,
      conversationId,
    })

    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        ...rateLimitHeadersOut,
        ...creditHeadersOut,
      },
    })
  } catch (error) {
    if (isGroqRateLimitError(error)) {
      return groqRateLimitResponse(error, rateLimitHeadersOut)
    }
    throw error
  }
}
