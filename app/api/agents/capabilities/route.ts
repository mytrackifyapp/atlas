import { NextRequest, NextResponse } from "next/server"

import { getFinnaToolset } from "@/lib/agents/skills"
import {
  ALL_CATALOG_AGENT_IDS,
  listAgentCapabilities,
} from "@/lib/agents/tool-map"
import { agentHasTools } from "@/lib/agents/tools/registry"
import { isKnownAgentId } from "@/lib/agents/registry"
import { getSessionWithRole } from "@/lib/auth-helpers"

function finnaCapabilities(role?: string | null) {
  const finna = getFinnaToolset(role)
  return {
    agentId: "finna",
    financeTools: finna.financeTools,
    domainTools: finna.domainTools,
    salesTools: finna.salesTools,
    socialTools: [] as string[],
    knowledge: finna.knowledge,
    orchestration: true,
    hasTools: true,
  }
}

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
    if (agentId === "finna") {
      return NextResponse.json(finnaCapabilities(session.user.role))
    }
    return NextResponse.json({
      ...listAgentCapabilities(agentId),
      hasTools: agentHasTools(agentId),
    })
  }

  const agents = [
    finnaCapabilities(session.user.role),
    ...ALL_CATALOG_AGENT_IDS.map((id) => ({
      ...listAgentCapabilities(id),
      hasTools: agentHasTools(id),
    })),
  ]

  return NextResponse.json({ agents })
}
