import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { createLoungeReply, resolveLoungeAuthor } from "@/lib/lounge/service"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = (await request.json()) as { body?: string }
    const text = body.body?.trim() ?? ""
    if (text.length < 1) {
      return NextResponse.json({ error: "Reply cannot be empty." }, { status: 400 })
    }
    if (text.length > 1000) {
      return NextResponse.json({ error: "Replies can be up to 1,000 characters." }, { status: 400 })
    }

    const author = await resolveLoungeAuthor({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    })

    const reply = await createLoungeReply({ postId: id, author, body: text })

    return NextResponse.json(
      {
        success: true,
        reply: {
          ...reply,
          createdAt: reply.createdAt.toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating lounge reply:", error)
    const message = error instanceof Error ? error.message : "Failed to reply"
    const status = message === "Post not found" ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
