import { writeAuditLog } from "@/lib/agents/services/audit"
import { getSocialConnection, upsertSocialConnection } from "@/lib/social/connections-service"
import { refreshLinkedInToken } from "@/lib/social/linkedin/oauth"
import { getSocialPost, updateSocialPost } from "@/lib/social/posts-service"
import type { SocialConnection } from "@/lib/social/types"

async function getValidLinkedInConnection(ownerId: string): Promise<SocialConnection> {
  const connection = await getSocialConnection(ownerId, "linkedin")
  if (!connection) {
    throw new Error("LinkedIn is not connected. Connect at /founder/social first.")
  }

  const refreshed = await refreshLinkedInToken(connection)
  if (refreshed.accessToken !== connection.accessToken) {
    await upsertSocialConnection(ownerId, {
      platform: "linkedin",
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: refreshed.expiresAt,
      profileId: refreshed.profileId,
      profileUrn: refreshed.profileUrn,
      displayName: refreshed.displayName,
    })
  }

  return refreshed
}

async function downloadAsset(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) {
    throw new Error("Failed to download post image")
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function publishPostToLinkedIn(input: {
  ownerId: string
  postId: string
  agentId?: string
  correlationId?: string
}): Promise<{ externalId: string; externalUrl?: string }> {
  const post = await getSocialPost(input.postId, input.ownerId)
  if (!post) {
    throw new Error("Social post not found")
  }

  if (post.platform !== "linkedin") {
    throw new Error("Only LinkedIn posts can be published with LinkedIn integration")
  }

  if (!post.assetUrl) {
    throw new Error("Render the graphic before publishing")
  }

  if (post.status === "published") {
    return {
      externalId: post.externalId ?? "already-published",
      externalUrl: post.externalUrl,
    }
  }

  const connection = await getValidLinkedInConnection(input.ownerId)
  const imageBuffer = await downloadAsset(post.assetUrl)

  const registerRes = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: connection.profileUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    }
  )

  if (!registerRes.ok) {
    const text = await registerRes.text()
    throw new Error(`LinkedIn upload registration failed: ${text}`)
  }

  const registerData = (await registerRes.json()) as {
    value: {
      uploadMechanism: {
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": {
          uploadUrl: string
        }
      }
      asset: string
    }
  }

  const uploadUrl =
    registerData.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl
  const assetUrn = registerData.value.asset

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${connection.accessToken}`,
      "Content-Type": "image/png",
    },
    body: new Uint8Array(imageBuffer),
  })

  if (!uploadRes.ok) {
    throw new Error("LinkedIn image upload failed")
  }

  const ugcRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: connection.profileUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: post.caption },
          shareMediaCategory: "IMAGE",
          media: [
            {
              status: "READY",
              media: assetUrn,
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  })

  if (!ugcRes.ok) {
    const text = await ugcRes.text()
    throw new Error(`LinkedIn publish failed: ${text}`)
  }

  const ugcData = (await ugcRes.json()) as { id: string }
  const externalId = ugcData.id

  await updateSocialPost(input.postId, input.ownerId, {
    status: "published",
    externalId,
    externalUrl: undefined,
    publishedAt: new Date().toISOString(),
    publishError: null,
    approvalId: null,
  })

  await writeAuditLog({
    ownerId: input.ownerId,
    agentId: input.agentId ?? "system",
    action: "social.published",
    correlationId: input.correlationId,
    policyDecision: "allowed",
    resource: { type: "social_post", id: input.postId },
    metadata: {
      platform: "linkedin",
      externalId,
    },
  })

  return { externalId }
}
