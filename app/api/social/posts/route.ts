import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { listSocialPosts, createSocialPost } from "@/lib/social/posts-service"
import type { CreateSocialPostInput, SocialPostStatus } from "@/lib/social/types"
import { SOCIAL_PLATFORMS, SOCIAL_POST_STATUSES, SOCIAL_TEMPLATES } from "@/lib/social/types"

export const dynamic = "force-dynamic"

function serializePost(post: Awaited<ReturnType<typeof listSocialPosts>>[number]) {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const statusParam = request.nextUrl.searchParams.get("status")
    const status =
      statusParam && SOCIAL_POST_STATUSES.includes(statusParam as SocialPostStatus)
        ? (statusParam as SocialPostStatus)
        : undefined

    const posts = await listSocialPosts(session.user.id, {
      status,
      limit: request.nextUrl.searchParams.get("limit")
        ? Number(request.nextUrl.searchParams.get("limit"))
        : undefined,
    })

    return NextResponse.json({
      success: true,
      posts: posts.map(serializePost),
    })
  } catch (error) {
    console.error("Error listing social posts:", error)
    return NextResponse.json({ error: "Failed to list posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as Partial<CreateSocialPostInput>

    if (
      !body.platform ||
      !SOCIAL_PLATFORMS.includes(body.platform) ||
      !body.templateId ||
      !SOCIAL_TEMPLATES.includes(body.templateId) ||
      !body.caption?.trim()
    ) {
      return NextResponse.json(
        { error: "platform, templateId, and caption are required" },
        { status: 400 }
      )
    }

    const post = await createSocialPost(session.user.id, {
      platform: body.platform,
      templateId: body.templateId,
      caption: body.caption,
      fields: body.fields ?? {},
    })

    return NextResponse.json({ success: true, post: serializePost(post) })
  } catch (error) {
    console.error("Error creating social post:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create post" },
      { status: 500 }
    )
  }
}
