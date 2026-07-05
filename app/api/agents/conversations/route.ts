import { NextRequest, NextResponse } from "next/server"

import { requireAgentAccess } from "@/lib/agents/auth"
import {
  createConversation,
  getOrCreateConversation,
  listConversations,
  listStoredMessages,
} from "@/lib/agents/services/conversations"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId")
  const latest = request.nextUrl.searchParams.get("latest") === "true"

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 })
  }

  const access = await requireAgentAccess(agentId)
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  if (latest) {
    const conversation = await getOrCreateConversation(access.ctx.userId, agentId)
    const messages = await listStoredMessages(conversation.id, access.ctx.userId)
    return NextResponse.json({ conversation, messages })
  }

  const conversations = await listConversations(access.ctx.userId, agentId)
  return NextResponse.json({ conversations })
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { agentId?: string }
  const agentId = body.agentId

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 })
  }

  const access = await requireAgentAccess(agentId)
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const conversation = await createConversation(access.ctx.userId, agentId)
  return NextResponse.json({ conversation })
}
