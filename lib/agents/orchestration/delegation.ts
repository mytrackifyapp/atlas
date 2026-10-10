import { stepCountIs, type ToolSet } from "ai"

import {
  buildOperatingContextPack,
  formatContextPackForPrompt,
} from "@/lib/agents/context-pack"
import { formatFoundationForPrompt } from "@/lib/agents/foundation-prompt"
import { extractGeneratedText, generateTextWithGroqFallback } from "@/lib/agents/groq-model"
import { getAgentConfig } from "@/lib/agents/registry"
import { writeAuditLog } from "@/lib/agents/services/audit"
import { publishAgentEvent } from "@/lib/agents/services/events"
import { getAgentFoundation } from "@/lib/agents/services/foundation"
import { ensureAgentInstalled } from "@/lib/agents/services/installed"
import { agentHasTools, getToolsForAgent } from "@/lib/agents/tools/registry"
import { isDelegatableAgent } from "@/lib/agents/orchestration/routing"

export type DelegationInput = {
  ownerId: string
  fromAgentId: string
  targetAgentId: string
  task: string
  workspaceId?: string
  correlationId?: string
  conversationId?: string
  userRole?: string | null
}

export type DelegationResult = {
  agentId: string
  agentName: string
  response: string
  delegated: true
  toolCallCount: number
}

export async function delegateToAgent(
  input: DelegationInput
): Promise<DelegationResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY")
  }

  const {
    ownerId,
    fromAgentId,
    targetAgentId,
    task,
    workspaceId,
    correlationId,
    conversationId,
    userRole,
  } = input

  if (!isDelegatableAgent(targetAgentId)) {
    throw new Error(`Agent "${targetAgentId}" cannot receive delegated tasks`)
  }

  const provisioned = await ensureAgentInstalled(ownerId, targetAgentId)
  if (!provisioned) {
    throw new Error(`Agent "${targetAgentId}" is not available`)
  }

  await publishAgentEvent({
    ownerId,
    type: "delegation.requested",
    fromAgentId,
    toAgentId: targetAgentId,
    correlationId,
    conversationId,
    payload: { task: task.slice(0, 500) },
  })

  await writeAuditLog({
    ownerId,
    agentId: fromAgentId,
    action: "delegation.requested",
    actorType: "agent",
    actorId: fromAgentId,
    conversationId,
    correlationId,
    policyDecision: "allowed",
    resource: { type: "agent", id: targetAgentId },
    metadata: { taskPreview: task.slice(0, 200) },
  })

  const config = getAgentConfig(targetAgentId)
  const toolCtx = {
    userId: ownerId,
    agentId: targetAgentId,
    workspaceId,
    userRole,
  }
  const tools = getToolsForAgent(toolCtx, correlationId, { userRole })
  const hasTools = agentHasTools(targetAgentId) && Object.keys(tools).length > 0

  let system = config.systemPrompt
  try {
    const [pack, foundation] = await Promise.all([
      buildOperatingContextPack({ ownerId, userRole, workspaceId }),
      getAgentFoundation(ownerId, targetAgentId),
    ])
    system += formatContextPackForPrompt(pack)
    system += formatFoundationForPrompt(targetAgentId, foundation)
  } catch (error) {
    console.error("Delegation context pack failed:", error)
  }

  try {
    const result = await generateTextWithGroqFallback({
      preferredModel: config.model,
      system,
      messages: [{ role: "user", content: task.trim() }],
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
      tools: hasTools ? (tools as ToolSet) : undefined,
      stopWhen: hasTools ? stepCountIs(5) : undefined,
    })

    const toolCallCount =
      result.steps?.flatMap((step) => step.toolCalls ?? []).length ?? 0

    await publishAgentEvent({
      ownerId,
      type: "delegation.completed",
      fromAgentId,
      toAgentId: targetAgentId,
      correlationId,
      conversationId,
      payload: {
        taskPreview: task.slice(0, 200),
        responsePreview: extractGeneratedText(result).slice(0, 300),
        toolCallCount,
      },
    })

    await writeAuditLog({
      ownerId,
      agentId: targetAgentId,
      action: "delegation.completed",
      actorType: "agent",
      actorId: fromAgentId,
      conversationId,
      correlationId,
      model: result.modelId,
      policyDecision: "allowed",
      metadata: {
        fromAgentId,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        toolCallCount,
      },
    })

    const agentName =
      targetAgentId === "ai-cfo"
        ? "CFO"
        : targetAgentId.replace(/^ai-/, "").replace(/-/g, " ")

    return {
      agentId: targetAgentId,
      agentName,
      response: extractGeneratedText(result),
      delegated: true,
      toolCallCount,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delegation failed"

    await publishAgentEvent({
      ownerId,
      type: "delegation.failed",
      fromAgentId,
      toAgentId: targetAgentId,
      correlationId,
      conversationId,
      payload: { error: message, taskPreview: task.slice(0, 200) },
    })

    await writeAuditLog({
      ownerId,
      agentId: fromAgentId,
      action: "delegation.failed",
      actorType: "agent",
      actorId: fromAgentId,
      conversationId,
      correlationId,
      policyDecision: "denied",
      metadata: { targetAgentId, error: message },
    })

    throw error
  }
}
