import { AI_AGENTS_CATALOG, resolveAgentId } from "@/lib/ai-agents-catalog"
import { isKnownAgentId } from "@/lib/agents/registry"

/** Specialists Finna may delegate to when installed for the user. */
export const DELEGATABLE_AGENT_IDS = AI_AGENTS_CATALOG.map((a) => a.id)

export function isDelegatableAgent(agentId: string): boolean {
  return isKnownAgentId(agentId) && agentId !== "finna" && DELEGATABLE_AGENT_IDS.includes(agentId)
}

export function getAgentDisplayName(agentId: string): string {
  const resolved = resolveAgentId(agentId)
  const catalog = AI_AGENTS_CATALOG.find((a) => a.id === resolved)
  if (catalog) return catalog.name
  return agentId.replace(/^ai-/, "").replace(/-/g, " ")
}

export function getAgentChatPath(agentId: string, role?: string | null): string {
  const base = role === "investor" ? "/dashboard/ai" : "/founder/ai"
  return `${base}/${agentId}/chat`
}

export function getAgentDetailPath(agentId: string, role?: string | null): string {
  const base = role === "investor" ? "/dashboard/ai" : "/founder/ai"
  return `${base}/${agentId}`
}
