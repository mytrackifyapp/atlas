import type { Tool } from "ai"

import { createApprovalRequest } from "@/lib/agents/services/approvals"
import { writeAuditLog } from "@/lib/agents/services/audit"
import { evaluateToolPolicy } from "@/lib/agents/policies/engine"
import { onApprovalRequested } from "@/lib/agents/tools/approval-hooks"
import type { ToolContext, ToolPolicy } from "@/lib/agents/tools/types"

export function wrapToolWithPolicy<INPUT, OUTPUT>(
  baseTool: Tool<INPUT, OUTPUT>,
  policy: ToolPolicy,
  ctx: ToolContext,
  correlationId?: string
): Tool<INPUT, OUTPUT> {
  const originalExecute = baseTool.execute
  if (!originalExecute) return baseTool

  return {
    ...baseTool,
    execute: async (input, options) => {
      const policyResult = evaluateToolPolicy(policy, ctx)

      await writeAuditLog({
        ownerId: ctx.userId,
        agentId: ctx.agentId,
        action: "tool.policy_check",
        correlationId,
        policyDecision: policyResult.decision,
        metadata: {
          toolId: policy.id,
          reason: policyResult.reason,
          autonomyTier: policyResult.autonomyTier,
          input: input as Record<string, unknown>,
        },
      })

      if (policyResult.decision === "denied") {
        throw new Error(policyResult.reason ?? "Tool access denied")
      }

      if (policyResult.decision === "approval_required") {
        const approval = await createApprovalRequest({
          ownerId: ctx.userId,
          agentId: ctx.agentId,
          toolId: policy.id,
          correlationId,
          input: input as Record<string, unknown>,
          reason: policyResult.reason,
        })

        await writeAuditLog({
          ownerId: ctx.userId,
          agentId: ctx.agentId,
          action: "approval.requested",
          correlationId,
          policyDecision: "approval_required",
          resource: { type: "tool", id: policy.id },
          metadata: { toolId: policy.id, approvalId: approval.id, input },
        })

        await onApprovalRequested(
          policy.id,
          ctx.userId,
          approval.id,
          input as Record<string, unknown>
        )

        throw new Error(
          `This action requires your approval. Open Approvals in AI Agents to review (request ${approval.id.slice(-6)}).`
        )
      }

      try {
        const output = await originalExecute(input, options)
        return output
      } catch (error) {
        await writeAuditLog({
          ownerId: ctx.userId,
          agentId: ctx.agentId,
          action: "tool.error",
          correlationId,
          policyDecision: "allowed",
          metadata: {
            toolId: policy.id,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        })
        throw error
      }
    },
  }
}
