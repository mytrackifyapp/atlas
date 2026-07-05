import { AI_AGENTS_CATALOG, resolveAgentId, type AgentCategory } from "@/lib/ai-agents-catalog"

const CATEGORY_KEYWORDS: Record<AgentCategory, RegExp> = {
  Legal: /\b(contract|legal|compliance|nda|policy|terms|lawyer|vera)\b/i,
  Finance: /\b(cash|runway|burn|finance|fundraising|investor|budget|cfo|revenue)\b/i,
  Sales: /\b(sales|outreach|pipeline|deal|partnership|prospect|crm)\b/i,
  Marketing: /\b(marketing|campaign|copy|social|gtm|launch|brand|content)\b/i,
  Operations: /\b(sop|procurement|ops|vendor|planning|workflow|process)\b/i,
  HR: /\b(hiring|hr|interview|onboarding|performance|team|recruit)\b/i,
}

export function suggestAgentForTask(task: string, preferredInstalled?: Set<string>): string {
  const trimmed = task.trim()
  if (!trimmed) return "ai-ops-manager"

  for (const agent of AI_AGENTS_CATALOG) {
    if (CATEGORY_KEYWORDS[agent.category].test(trimmed)) {
      if (!preferredInstalled || preferredInstalled.has(agent.id)) {
        return agent.id
      }
    }
  }

  for (const agent of AI_AGENTS_CATALOG) {
    if (CATEGORY_KEYWORDS[agent.category].test(trimmed)) {
      return agent.id
    }
  }

  const installed = AI_AGENTS_CATALOG.find((a) => preferredInstalled?.has(a.id))
  if (installed) return installed.id

  return "ai-ops-manager"
}

export function getAgentChatHref(
  agentBaseHref: string,
  agentId: string,
  prompt?: string,
): string {
  const resolved = resolveAgentId(agentId)
  const base = `${agentBaseHref}/${resolved}/chat`
  if (!prompt?.trim()) return base
  return `${base}?prompt=${encodeURIComponent(prompt.trim())}`
}
