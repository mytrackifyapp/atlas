import { createCorrelationId } from "@/lib/agents/correlation"
import { executeAgentRun, type RunTaskType } from "@/lib/agents/runner"
import {
  createAgentRun,
  findOwnerIdsWithAgentInstalled,
  updateAgentRun,
} from "@/lib/agents/services/runs"
import { inngest } from "@/inngest/client"

export const agentRunRequested = inngest.createFunction(
  {
    id: "agent-run-requested",
    retries: 2,
    triggers: [{ event: "agent/run.requested" }],
  },
  async ({ event, step }) => {
    const { runId, ownerId, agentId, taskType, prompt, correlationId } =
      event.data as {
        runId: string
        ownerId: string
        agentId: string
        taskType: RunTaskType
        prompt?: string
        correlationId?: string
      }

    await step.run("mark-running", async () => {
      await updateAgentRun(runId, {
        status: "running",
        startedAt: new Date(),
      })
    })

    try {
      const result = await step.run("execute-agent-run", async () => {
        return executeAgentRun({
          ownerId,
          agentId,
          taskType,
          prompt,
          correlationId,
          runId,
        })
      })

      await step.run("mark-completed", async () => {
        await updateAgentRun(runId, {
          status: "completed",
          output: {
            summary: result.summary,
            data: result.data,
          },
          completedAt: new Date(),
        })
      })

      return { runId, status: "completed" }
    } catch (error) {
      await step.run("mark-failed", async () => {
        await updateAgentRun(runId, {
          status: "failed",
          error: error instanceof Error ? error.message : "Run failed",
          completedAt: new Date(),
        })
      })
      throw error
    }
  }
)

export const cfoWeeklyDigestCron = inngest.createFunction(
  {
    id: "cfo-weekly-digest-cron",
    triggers: [{ cron: "0 9 * * 1" }],
  },
  async ({ step }) => {
    const ownerIds = await step.run("find-cfo-users", () =>
      findOwnerIdsWithAgentInstalled("ai-cfo")
    )

    for (const ownerId of ownerIds) {
      await step.run(`schedule-digest-${ownerId}`, async () => {
        const correlationId = createCorrelationId()
        const run = await createAgentRun({
          ownerId,
          agentId: "ai-cfo",
          taskType: "cfo_weekly_digest",
          correlationId,
          scheduledAt: new Date(),
        })

        await inngest.send({
          name: "agent/run.requested",
          data: {
            runId: run.id,
            ownerId,
            agentId: "ai-cfo",
            taskType: "cfo_weekly_digest",
            correlationId,
          },
        })
      })
    }

    return { scheduled: ownerIds.length }
  }
)
