import { generateTextWithGroqFallback } from "@/lib/agents/groq-model"
import { getAgentConfig } from "@/lib/agents/registry"
import {
  computeRunway,
  listFinanceAccounts,
  listFinanceTransactions,
} from "@/lib/agents/services/finance"
import {
  executeChatTaskRun,
} from "@/lib/agents/chat-task"
import { writeAuditLog } from "@/lib/agents/services/audit"

export type RunTaskType = "cfo_weekly_digest" | "custom" | "chat_task"

export async function executeAgentRun(input: {
  ownerId: string
  agentId: string
  taskType: RunTaskType
  prompt?: string
  correlationId?: string
  runId?: string
}): Promise<{ summary: string; data?: Record<string, unknown> }> {
  const config = getAgentConfig(input.agentId)

  if (input.taskType === "cfo_weekly_digest" && input.agentId === "ai-cfo") {
    const accounts = await listFinanceAccounts(input.ownerId)
    const transactions = await listFinanceTransactions(input.ownerId, undefined, {
      limit: 50,
    })
    const runway = await computeRunway(input.ownerId)

    const data = {
      accounts,
      recentTransactionCount: transactions.length,
      runway,
    }

    const result = await generateTextWithGroqFallback({
      preferredModel: config.model,
      system: config.systemPrompt,
      prompt: `Generate a concise weekly CFO briefing for the founder based on this live finance data:
${JSON.stringify(data, null, 2)}

Include: cash position, burn/runway, top spending themes, and 3 recommended actions for this week.
Use plain text only.`,
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
    })

    await writeAuditLog({
      ownerId: input.ownerId,
      agentId: input.agentId,
      action: "run.complete",
      correlationId: input.correlationId,
      model: result.modelId,
      policyDecision: "allowed",
      metadata: {
        taskType: input.taskType,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      },
    })

    return { summary: result.text.trim(), data }
  }

  if (input.taskType === "chat_task") {
    if (!input.runId) throw new Error("runId is required for chat_task")
    await executeChatTaskRun(input.runId, input.ownerId)
    const { getAgentRun } = await import("@/lib/agents/services/runs")
    const run = await getAgentRun(input.runId, input.ownerId)
    const summary =
      typeof run?.output?.summary === "string" ? run.output.summary : "Task completed"
    return { summary, data: run?.output }
  }

  if (input.taskType === "custom" && input.prompt?.trim()) {
    const result = await generateTextWithGroqFallback({
      preferredModel: config.model,
      system: config.systemPrompt,
      prompt: input.prompt.trim(),
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
    })

    await writeAuditLog({
      ownerId: input.ownerId,
      agentId: input.agentId,
      action: "run.complete",
      correlationId: input.correlationId,
      model: result.modelId,
      policyDecision: "allowed",
      metadata: { taskType: input.taskType },
    })

    return { summary: result.text.trim() }
  }

  throw new Error(`Unsupported run task: ${input.taskType} for agent ${input.agentId}`)
}
