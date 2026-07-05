import { delegateToAgent } from "@/lib/agents/orchestration/delegation"
import { inngest } from "@/inngest/client"

export const agentDelegationRequested = inngest.createFunction(
  {
    id: "agent-delegation-requested",
    retries: 2,
    triggers: [{ event: "agent/delegation.requested" }],
  },
  async ({ event, step }) => {
    const { ownerId, fromAgentId, targetAgentId, task, workspaceId, correlationId, conversationId } =
      event.data as {
        ownerId: string
        fromAgentId: string
        targetAgentId: string
        task: string
        workspaceId?: string
        correlationId?: string
        conversationId?: string
      }

    const result = await step.run("delegate-to-specialist", async () => {
      return delegateToAgent({
        ownerId,
        fromAgentId,
        targetAgentId,
        task,
        workspaceId,
        correlationId,
        conversationId,
      })
    })

    return {
      agentId: result.agentId,
      toolCallCount: result.toolCallCount,
      responsePreview: result.response.slice(0, 300),
    }
  }
)
