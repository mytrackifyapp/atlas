import { NextRequest, NextResponse } from "next/server"

import { searchKnowledge } from "@/lib/agents/memory/search"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as { query?: string; limit?: number }
  const query = body.query?.trim()

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  const result = await searchKnowledge({
    ownerId: session.user.id,
    query,
    limit: body.limit ?? 6,
  })

  return NextResponse.json(result)
}
