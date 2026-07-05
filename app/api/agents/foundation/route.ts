import { NextRequest, NextResponse } from "next/server"

import { getAgentFoundationConfig } from "@/lib/agents/foundation-config"
import { getAgentFoundation, saveAgentFoundation } from "@/lib/agents/services/foundation"
import { resolveAgentId, isCatalogAgentId } from "@/lib/ai-agents-catalog"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const agentId = request.nextUrl.searchParams.get("agentId")
    if (!agentId || !isCatalogAgentId(agentId)) {
      return NextResponse.json({ error: "Valid agentId is required" }, { status: 400 })
    }

    const resolved = resolveAgentId(agentId)
    const foundation = await getAgentFoundation(session.user.id, resolved)
    const config = getAgentFoundationConfig(resolved)

    return NextResponse.json({
      agentId: resolved,
      foundation,
      config,
    })
  } catch (e) {
    console.error("Agent foundation GET error:", e)
    return NextResponse.json({ error: "Failed to load foundation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await request.json()) as {
      agentId?: string
      fields?: Record<string, string>
      connectedTools?: string[]
      attachments?: Array<{
        id?: string
        name?: string
        url?: string
        mimeType?: string
        sizeBytes?: number
        uploadedAt?: string
      }>
    }

    const agentId = body.agentId
    if (!agentId || !isCatalogAgentId(agentId)) {
      return NextResponse.json({ error: "Valid agentId is required" }, { status: 400 })
    }

    const foundation = await saveAgentFoundation(session.user.id, agentId, {
      fields: body.fields ?? {},
      connectedTools: Array.isArray(body.connectedTools) ? body.connectedTools : [],
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
    })

    return NextResponse.json({ foundation })
  } catch (e) {
    console.error("Agent foundation PUT error:", e)
    return NextResponse.json({ error: "Failed to save foundation" }, { status: 500 })
  }
}
