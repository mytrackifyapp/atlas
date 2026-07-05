import { NextRequest, NextResponse } from "next/server"

import {
  ALL_CATALOG_AGENT_IDS,
  listAgentCapabilities,
} from "@/lib/agents/tool-map"
import { agentHasTools } from "@/lib/agents/tools/registry"
import { isKnownAgentId } from "@/lib/agents/registry"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agentId = request.nextUrl.searchParams.get("agentId")
  if (agentId) {
    if (!isKnownAgentId(agentId)) {
      return NextResponse.json({ error: "Unknown agent" }, { status: 400 })
    }
    return NextResponse.json({
      ...listAgentCapabilities(agentId),
      hasTools: agentHasTools(agentId),
    })
  }

  const agents = ["finna", ...ALL_CATALOG_AGENT_IDS].map((id) => ({
    ...listAgentCapabilities(id),
    hasTools: agentHasTools(id),
  }))

  return NextResponse.json({ agents })
}
