import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getSocialPost } from "@/lib/social/posts-service"
import { publishPostToLinkedIn } from "@/lib/social/publish-linkedin"

export const dynamic = "force-dynamic"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const post = await getSocialPost(id, session.user.id)
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (post.platform !== "linkedin") {
      return NextResponse.json(
        { error: "Only LinkedIn posts can be published via this action" },
        { status: 400 }
      )
    }

    if (!post.assetUrl) {
      return NextResponse.json({ error: "Render the graphic first" }, { status: 400 })
    }

    const result = await publishPostToLinkedIn({
      ownerId: session.user.id,
      postId: id,
      agentId: "user",
    })

    const updated = await getSocialPost(id, session.user.id)
    return NextResponse.json({
      success: true,
      externalId: result.externalId,
      post: updated
        ? {
            ...updated,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          }
        : null,
    })
  } catch (error) {
    console.error("Publish social post error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish failed" },
      { status: 500 }
    )
  }
}
