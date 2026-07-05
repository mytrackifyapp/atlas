import { NextRequest, NextResponse } from "next/server"

import { requireAgentAccess } from "@/lib/agents/auth"
import { createCorrelationId } from "@/lib/agents/correlation"
import type { RunTaskType } from "@/lib/agents/runner"
import { executeAgentRun } from "@/lib/agents/runner"
import { createAgentRun, listAgentRuns, updateAgentRun } from "@/lib/agents/services/runs"
import type { AgentRunStatus } from "@/lib/agents/types"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { inngest } from "@/inngest/client"

export const dynamic = "force-dynamic"

const ALLOWED_TASKS: RunTaskType[] = ["cfo_weekly_digest", "custom", "chat_task"]

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agentId = request.nextUrl.searchParams.get("agentId") ?? undefined
  const statusParam = request.nextUrl.searchParams.get("status")
  const taskType = request.nextUrl.searchParams.get("taskType") ?? undefined

  const runs = await listAgentRuns(session.user.id, {
    agentId,
    taskType,
    status: statusParam
      ? (statusParam.includes(",")
          ? (statusParam.split(",") as AgentRunStatus[])
          : (statusParam as AgentRunStatus))
      : undefined,
  })

  return NextResponse.json({
    runs: runs.map((run) => ({
      ...run,
      createdAt: run.createdAt.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
      startedAt: run.startedAt?.toISOString() ?? null,
      completedAt: run.completedAt?.toISOString() ?? null,
      scheduledAt: run.scheduledAt?.toISOString() ?? null,
      conversationId: (run.input as { conversationId?: string })?.conversationId,
      messagePreview: String((run.input as { message?: string })?.message ?? "").slice(
        0,
        120
      ),
    })),
  })
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    agentId?: string
    taskType?: RunTaskType
    prompt?: string
  }

  const agentId = body.agentId
  const taskType = body.taskType

  if (!agentId || !taskType) {
    return NextResponse.json(
      { error: "agentId and taskType are required" },
      { status: 400 }
    )
  }

  if (!ALLOWED_TASKS.includes(taskType)) {
    return NextResponse.json({ error: "Invalid taskType" }, { status: 400 })
  }

  if (taskType === "custom" && !body.prompt?.trim()) {
    return NextResponse.json(
      { error: "prompt is required for custom runs" },
      { status: 400 }
    )
  }

  const access = await requireAgentAccess(agentId)
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const correlationId = createCorrelationId()
  const run = await createAgentRun({
    ownerId: access.ctx.userId,
    agentId,
    taskType,
    correlationId,
    input: body.prompt ? { prompt: body.prompt } : undefined,
  })

  const runPayload = {
    runId: run.id,
    ownerId: access.ctx.userId,
    agentId,
    taskType,
    prompt: body.prompt,
    correlationId,
  }

  if (!process.env.INNGEST_EVENT_KEY) {
    await updateAgentRun(run.id, { status: "running", startedAt: new Date() })
    try {
      const result = await executeAgentRun({
        ownerId: access.ctx.userId,
        agentId,
        taskType,
        prompt: body.prompt,
        correlationId,
      })
      const completed = await updateAgentRun(run.id, {
        status: "completed",
        output: { summary: result.summary, data: result.data },
        completedAt: new Date(),
      })
      return NextResponse.json({ run: completed ?? run })
    } catch (error) {
      const failed = await updateAgentRun(run.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Run failed",
        completedAt: new Date(),
      })
      return NextResponse.json({ run: failed ?? run }, { status: 500 })
    }
  }

  await inngest.send({
    name: "agent/run.requested",
    data: runPayload,
  })

  return NextResponse.json({ run })
}
