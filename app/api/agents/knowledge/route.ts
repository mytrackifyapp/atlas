import { NextRequest, NextResponse } from "next/server"

import { ingestTextContent } from "@/lib/agents/memory/ingest"
import { listKnowledgeSources } from "@/lib/agents/memory/sources"
import { knowledgeStatusMessage } from "@/lib/agents/tools/knowledge"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sources = await listKnowledgeSources(session.user.id)
  return NextResponse.json({
    sources,
    status: knowledgeStatusMessage(),
  })
}

export async function POST(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as {
    title?: string
    content?: string
    category?: string
  }

  const title = body.title?.trim()
  const content = body.content?.trim()

  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 }
    )
  }

  try {
    const source = await ingestTextContent({
      ownerId: session.user.id,
      title,
      content,
      sourceType: "manual",
      category: body.category?.trim() || "note",
    })

    return NextResponse.json({ source, status: knowledgeStatusMessage() })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Indexing failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
