import { getSessionWithRole } from "@/lib/auth-helpers"
import { isKnownAgentId } from "@/lib/agents/registry"
import { ensureAgentInstalled } from "@/lib/agents/services/installed"

export type AgentAccessContext = {
  userId: string
  role: string | null
  agentId: string
}

export type AgentAccessResult =
  | { ok: true; ctx: AgentAccessContext }
  | { ok: false; status: 401 | 403 | 400; error: string }

export async function requireAgentAccess(agentId: string): Promise<AgentAccessResult> {
  if (!agentId || typeof agentId !== "string") {
    return { ok: false, status: 400, error: "agentId is required" }
  }

  if (!isKnownAgentId(agentId)) {
    return { ok: false, status: 400, error: "Unknown agent" }
  }

  const session = await getSessionWithRole()
  if (!session) {
    return { ok: false, status: 401, error: "Unauthorized" }
  }

  const provisioned = await ensureAgentInstalled(session.user.id, agentId)
  if (!provisioned) {
    return { ok: false, status: 403, error: "Agent not available" }
  }

  return {
    ok: true,
    ctx: {
      userId: session.user.id,
      role: session.user.role,
      agentId,
    },
  }
}

export async function getOptionalSession() {
  return getSessionWithRole()
}

export function isPublicFinnaAgent(agentId: string | undefined): boolean {
  return !agentId || agentId === "finna"
}
