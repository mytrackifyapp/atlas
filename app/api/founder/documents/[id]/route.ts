import { NextRequest, NextResponse } from "next/server"

import { deleteDocument, getDocument } from "@/lib/documents/service"
import { indexDocumentForAgents } from "@/lib/documents/index-for-agents"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const deleted = await deleteDocument(id, session.user.id)

    if (!deleted) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as { action?: string }
    if (body.action !== "reindex") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
    }

    const { id } = await params
    const document = await getDocument(id, session.user.id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const updated = await indexDocumentForAgents(document)

    return NextResponse.json({
      success: true,
      document: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error reindexing document:", error)
    return NextResponse.json({ error: "Failed to reindex document" }, { status: 500 })
  }
}
