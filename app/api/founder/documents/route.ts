import { NextResponse } from "next/server"

import { listDocuments } from "@/lib/documents/service"
import { DOCUMENT_CATEGORIES } from "@/lib/documents/types"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documents = await listDocuments(session.user.id)
    const categoryCounts = Object.fromEntries(
      DOCUMENT_CATEGORIES.map((category) => [
        category,
        documents.filter((doc) => doc.category === category).length,
      ])
    )

    return NextResponse.json({
      success: true,
      documents: documents.map(serializeDocument),
      categoryCounts,
    })
  } catch (error) {
    console.error("Error listing documents:", error)
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 })
  }
}

function serializeDocument(doc: Awaited<ReturnType<typeof listDocuments>>[number]) {
  return {
    ...doc,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}
