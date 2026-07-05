import { NextRequest, NextResponse } from "next/server"

import { requireAgentAccess } from "@/lib/agents/auth"
import { createCorrelationId } from "@/lib/agents/correlation"
import {
  executeChatTaskRun,
  isLikelyLongRunningTask,
  type ChatTaskInput,
  type SalesLeadContextInput,
} from "@/lib/agents/chat-task"
import {
  getConversation,
  saveMessage,
} from "@/lib/agents/services/conversations"
import { createAgentRun } from "@/lib/agents/services/runs"
import { sendInngestEventOrRunLocally } from "@/lib/inngest/dispatch"
import { AI_CREDIT_COSTS } from "@/lib/ai-credits/plans"
import {
  checkAiCredits,
  creditHeaders,
  insufficientCreditsMessage,
} from "@/lib/ai-credits/service"

export const dynamic = "force-dynamic"

async function dispatchChatTask(input: {
  runId: string
  ownerId: string
  agentId: string
  correlationId: string
}) {
  await sendInngestEventOrRunLocally(
    {
      name: "agent/run.requested",
      data: {
        runId: input.runId,
        ownerId: input.ownerId,
        agentId: input.agentId,
        taskType: "chat_task",
        correlationId: input.correlationId,
      },
    },
    () => executeChatTaskRun(input.runId, input.ownerId)
  )
}

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 503 })
  }

  const body = (await request.json()) as {
    agentId?: string
    conversationId?: string
    message?: string
    workspaceId?: string
    salesLeadContext?: SalesLeadContextInput
  }

  const { agentId, conversationId, message, workspaceId, salesLeadContext } = body

  if (!agentId || !conversationId || !message?.trim()) {
    return NextResponse.json(
      { error: "agentId, conversationId, and message are required" },
      { status: 400 }
    )
  }

  const access = await requireAgentAccess(agentId)
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const creditCheck = await checkAiCredits(access.ctx.userId, AI_CREDIT_COSTS.backgroundChatMin)
  if (!creditCheck.success) {
    return NextResponse.json(
      { error: insufficientCreditsMessage(creditCheck) },
      { status: 402, headers: creditHeaders(creditCheck) },
    )
  }

  const conversation = await getConversation(conversationId, access.ctx.userId)
  if (!conversation || conversation.agentId !== agentId) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  const correlationId = createCorrelationId()
  const taskInput: ChatTaskInput = {
    conversationId,
    message: message.trim(),
    userRole: access.ctx.role,
    workspaceId,
    salesLeadContext,
  }

  await saveMessage({
    conversationId,
    ownerId: access.ctx.userId,
    agentId,
    role: "user",
    content: message.trim(),
  })

  const run = await createAgentRun({
    ownerId: access.ctx.userId,
    agentId,
    taskType: "chat_task",
    status: "planned",
    correlationId,
    input: taskInput,
  })

  await dispatchChatTask({
    runId: run.id,
    ownerId: access.ctx.userId,
    agentId,
    correlationId,
  })

  return NextResponse.json({
    run: {
      id: run.id,
      agentId: run.agentId,
      taskType: run.taskType,
      status: run.status,
      conversationId,
      createdAt: run.createdAt.toISOString(),
    },
    queued: true,
    suggestBackground: isLikelyLongRunningTask(message),
  })
}
