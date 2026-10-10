import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import {
  createLoungePost,
  listLoungeMembers,
  listLoungePosts,
  resolveLoungeAuthor,
} from "@/lib/lounge/service"
import { mergeLinkAttachments } from "@/lib/lounge/attachments"
import { LOUNGE_TOPICS, type LoungeTopic } from "@/lib/lounge/types"

export const dynamic = "force-dynamic"

function serializePost(post: Awaited<ReturnType<typeof listLoungePosts>>[number]) {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    replies: post.replies.map((reply) => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
    })),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const topicParam = request.nextUrl.searchParams.get("topic")
    const topic =
      topicParam && LOUNGE_TOPICS.includes(topicParam as LoungeTopic)
        ? (topicParam as LoungeTopic)
        : undefined

    const [posts, members] = await Promise.all([listLoungePosts(topic), listLoungeMembers()])

    return NextResponse.json({
      success: true,
      posts: posts.map(serializePost),
      members: members.map((member) => ({
        ...member,
        lastSeenAt: member.lastSeenAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error listing lounge posts:", error)
    return NextResponse.json({ error: "Failed to load lounge" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      body?: string
      topic?: string
      attachments?: unknown
    }
    const text = body.body?.trim() ?? ""
    const attachments = mergeLinkAttachments(text, Array.isArray(body.attachments) ? body.attachments : [])
    if (text.length < 2 && attachments.length === 0) {
      return NextResponse.json({ error: "Write something or attach a file before posting." }, { status: 400 })
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: "Posts can be up to 2,000 characters." }, { status: 400 })
    }

    const topic = LOUNGE_TOPICS.includes(body.topic as LoungeTopic)
      ? (body.topic as LoungeTopic)
      : "general"

    const author = await resolveLoungeAuthor({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    })

    const post = await createLoungePost({ author, body: text, topic, attachments })

    return NextResponse.json({ success: true, post: serializePost(post) }, { status: 201 })
  } catch (error) {
    console.error("Error creating lounge post:", error)
    return NextResponse.json({ error: "Failed to post" }, { status: 500 })
  }
}
