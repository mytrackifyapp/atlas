import { NextRequest, NextResponse } from "next/server"

import { generateFinnaReply } from "@/lib/agents/chat"
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

export type ChatMessage = AgentChatMessage

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Finna AI is not configured. Add GROQ_API_KEY to your environment." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const agentId = (body.agentId as string | undefined) ?? "finna"
    const messages = body.messages as ChatMessage[] | undefined
    const workspaceId = body.workspaceId as string | undefined

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Request must include a non-empty messages array." },
        { status: 400 }
      )
    }

    const session = await getOptionalSession()
    const correlationId = createCorrelationId()
    let rateLimitHeadersOut: Record<string, string> = {}
    let creditHeadersOut: Record<string, string> = {}

    if (!isPublicFinnaAgent(agentId)) {
      const access = await requireAgentAccess(agentId)
      if (!access.ok) {
        return NextResponse.json({ error: access.error }, { status: access.status })
      }

      const rateLimit = await checkAuthenticatedAgentRateLimit(access.ctx.userId)
      rateLimitHeadersOut = rateLimitHeaders(rateLimit)
      if (!rateLimit.success) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429, headers: rateLimitHeadersOut },
        )
      }

      const creditCheck = await checkAiCredits(access.ctx.userId, AI_CREDIT_COSTS.agentChatMin)
      creditHeadersOut = creditHeaders(creditCheck)
      if (!creditCheck.success) {
        return NextResponse.json(
          { error: insufficientCreditsMessage(creditCheck) },
          { status: 402, headers: { ...rateLimitHeadersOut, ...creditHeadersOut } },
        )
      }
    } else if (!session) {
      const rateLimit = await checkPublicFinnaRateLimit(getClientIp(request))
      rateLimitHeadersOut = rateLimitHeaders(rateLimit)
      if (!rateLimit.success) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please sign in or try again later." },
          { status: 429, headers: rateLimitHeadersOut }
        )
      }
    } else {
      const rateLimit = await checkAuthenticatedAgentRateLimit(session.user.id)
      rateLimitHeadersOut = rateLimitHeaders(rateLimit)
      if (!rateLimit.success) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429, headers: rateLimitHeadersOut },
        )
      }

      const creditCheck = await checkAiCredits(session.user.id, AI_CREDIT_COSTS.finnaChatMin)
      creditHeadersOut = creditHeaders(creditCheck)
      if (!creditCheck.success) {
        return NextResponse.json(
          { error: insufficientCreditsMessage(creditCheck) },
          { status: 402, headers: { ...rateLimitHeadersOut, ...creditHeadersOut } },
        )
      }
    }

    const result = await generateFinnaReply({
      agentId,
      messages,
      ownerId: session?.user.id,
      userRole: session?.user.role,
      persistAudit: Boolean(session),
      correlationId,
      workspaceId,
    })

    const content = result.text.trim() || "I couldn't generate a response. Please try again."

    return NextResponse.json(
      { content },
      { headers: { ...rateLimitHeadersOut, ...creditHeadersOut } },
    )
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
