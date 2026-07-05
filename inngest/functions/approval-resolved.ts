import { processApprovalResolved } from "@/lib/agents/services/approval-actions"
import { inngest } from "@/inngest/client"

export const approvalResolved = inngest.createFunction(
  {
    id: "approval-resolved",
    retries: 1,
    triggers: [{ event: "agent/approval.resolved" }],
  },
  async ({ event, step }) => {
    const { ownerId, agentId, approvalId, status, toolId, correlationId } =
      event.data as {
        ownerId: string
        agentId: string
        approvalId: string
        status: "approved" | "rejected"
        toolId: string
        correlationId?: string
      }

    const execution = await step.run("process-approval", async () => {
      return processApprovalResolved({
        ownerId,
        agentId,
        approvalId,
        toolId,
        status,
        correlationId,
      })
    })

    return { approvalId, status, execution }
  }
)
