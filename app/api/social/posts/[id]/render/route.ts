import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getSocialPost } from "@/lib/social/posts-service"
import { renderSocialPostAsset } from "@/lib/social/render"

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
    const existing = await getSocialPost(id, session.user.id)
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const result = await renderSocialPostAsset({
      ownerId: session.user.id,
      postId: id,
    })

    const post = await getSocialPost(id, session.user.id)

    return NextResponse.json({
      success: true,
      assetUrl: result.assetUrl,
      width: result.width,
      height: result.height,
      post: post
        ? {
            ...post,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
          }
        : null,
    })
  } catch (error) {
    console.error("Error rendering social post:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Render failed" },
      { status: 500 }
    )
  }
}
