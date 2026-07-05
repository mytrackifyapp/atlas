import { getApprovalById } from "@/lib/agents/services/approvals"
import { writeAuditLog } from "@/lib/agents/services/audit"
import {
  executeLogOutreachReply,
  executeSendOutreach,
} from "@/lib/sales/send-outreach"
import { updateOutreachStatus } from "@/lib/sales/outreach-service"
import { publishPostToLinkedIn } from "@/lib/social/publish-linkedin"
import { updateSocialPost } from "@/lib/social/posts-service"

export async function processApprovalResolved(input: {
  ownerId: string
  agentId: string
  approvalId: string
  toolId: string
  status: "approved" | "rejected"
  correlationId?: string
}): Promise<{ executed: boolean; detail?: string }> {
  await writeAuditLog({
    ownerId: input.ownerId,
    agentId: input.agentId,
    action: input.status === "approved" ? "approval.granted" : "approval.rejected",
    correlationId: input.correlationId,
    policyDecision: input.status === "approved" ? "allowed" : "denied",
    resource: { type: "tool", id: input.toolId },
    metadata: { approvalId: input.approvalId, toolId: input.toolId },
  })

  return executeApprovedToolAction(input)
}

export async function executeApprovedToolAction(input: {
  ownerId: string
  agentId: string
  approvalId: string
  toolId: string
  status: "approved" | "rejected"
  correlationId?: string
}): Promise<{ executed: boolean; detail?: string }> {
  if (input.status === "rejected") {
    if (input.toolId === "send_outreach_email") {
      const approval = await getApprovalById(input.approvalId, input.ownerId)
      const outreachId = approval?.input?.outreachId
      if (typeof outreachId === "string") {
        await updateOutreachStatus(outreachId, input.ownerId, {
          status: "draft",
        })
      }
    }

    if (input.toolId === "publish_social_post") {
      const approval = await getApprovalById(input.approvalId, input.ownerId)
      const postId = approval?.input?.postId
      if (typeof postId === "string") {
        await updateSocialPost(postId, input.ownerId, {
          status: "rendered",
          approvalId: null,
        })
      }
    }

    return { executed: false, detail: "rejected" }
  }

  if (input.toolId === "send_outreach_email") {
    const approval = await getApprovalById(input.approvalId, input.ownerId)
    const outreachId = approval?.input?.outreachId
    if (typeof outreachId !== "string") {
      throw new Error("Approval missing outreachId")
    }

    const result = await executeSendOutreach({
      ownerId: input.ownerId,
      outreachId,
      agentId: input.agentId,
      correlationId: input.correlationId,
    })

    return { executed: true, detail: result.messageId }
  }

  if (input.toolId === "publish_social_post") {
    const approval = await getApprovalById(input.approvalId, input.ownerId)
    const postId = approval?.input?.postId
    if (typeof postId !== "string") {
      throw new Error("Approval missing postId")
    }

    const result = await publishPostToLinkedIn({
      ownerId: input.ownerId,
      postId,
      agentId: input.agentId,
      correlationId: input.correlationId,
    })

    return { executed: true, detail: result.externalId }
  }

  return { executed: false }
}

export async function executeLogReplyFromApi(input: {
  ownerId: string
  outreachId: string
  notes?: string
}) {
  return executeLogOutreachReply({
    ownerId: input.ownerId,
    outreachId: input.outreachId,
    agentId: "user",
    notes: input.notes,
  })
}
