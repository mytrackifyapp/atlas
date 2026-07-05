import { updateOutreachStatus } from "@/lib/sales/outreach-service"
import { updateSocialPost } from "@/lib/social/posts-service"

export async function onApprovalRequested(
  toolId: string,
  ownerId: string,
  approvalId: string,
  input: Record<string, unknown>
): Promise<void> {
  if (toolId === "send_outreach_email") {
    const outreachId = input.outreachId
    if (typeof outreachId === "string") {
      await updateOutreachStatus(outreachId, ownerId, {
        status: "pending_approval",
        approvalId,
      })
    }
  }

  if (toolId === "publish_social_post") {
    const postId = input.postId
    if (typeof postId === "string") {
      await updateSocialPost(postId, ownerId, {
        status: "pending_approval",
        approvalId,
      })
    }
  }
}
