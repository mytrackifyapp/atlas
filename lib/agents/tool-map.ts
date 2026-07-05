import { AI_AGENTS_CATALOG, resolveAgentId } from "@/lib/ai-agents-catalog"

/** Client-safe tool id unions (no server/MongoDB imports). */
export type FinanceToolName =
  | "get_accounts"
  | "get_transactions"
  | "compute_runway"

export type DomainToolName =
  | "get_fundraise_summary"
  | "get_investor_pipeline"
  | "get_deal_flow"
  | "get_company_structure"
  | "get_investor_updates"
  | "get_founder_metrics"

export type SalesToolName =
  | "list_sales_leads"
  | "get_sales_lead"
  | "find_sales_lead"
  | "get_sales_pipeline_summary"
  | "create_sales_lead"
  | "save_lead_research"
  | "update_lead_stage"
  | "draft_outreach_email"
  | "draft_follow_up_sequence"
  | "list_outreach_drafts"
  | "send_outreach_email"
  | "log_outreach_reply"

export type SocialToolName =
  | "get_social_brand_kit"
  | "update_social_brand_kit"
  | "get_social_connections"
  | "resolve_background_image"
  | "draft_social_post"
  | "render_social_asset"
  | "list_social_drafts"
  | "publish_social_post"

export const ALL_CATALOG_AGENT_IDS = AI_AGENTS_CATALOG.map((a) => a.id)

/** Finance tools per agent */
export const AGENT_FINANCE_TOOLS: Record<string, FinanceToolName[]> = {
  "ai-cfo": ["get_accounts", "get_transactions", "compute_runway"],
}

/** Domain (platform data) tools per agent */
export const AGENT_DOMAIN_TOOLS: Record<string, DomainToolName[]> = {
  "ai-cfo": [
    "get_founder_metrics",
    "get_fundraise_summary",
    "get_investor_pipeline",
    "get_deal_flow",
    "get_investor_updates",
  ],
  "ai-lawyer": ["get_company_structure"],
  "ai-sales-rep": ["get_founder_metrics", "get_investor_pipeline", "get_deal_flow"],
  "ai-marketer": ["get_founder_metrics"],
  "ai-hr": ["get_company_structure"],
  "ai-ops-manager": ["get_company_structure", "get_founder_metrics", "get_investor_updates"],
}

/** B2B sales CRM tools per agent */
export const AGENT_SALES_TOOLS: Record<string, SalesToolName[]> = {
  "ai-sales-rep": [
    "list_sales_leads",
    "get_sales_lead",
    "find_sales_lead",
    "get_sales_pipeline_summary",
    "create_sales_lead",
    "save_lead_research",
    "update_lead_stage",
    "draft_outreach_email",
    "draft_follow_up_sequence",
    "list_outreach_drafts",
    "send_outreach_email",
    "log_outreach_reply",
  ],
  "ai-marketer": ["list_sales_leads", "get_sales_pipeline_summary"],
}

/** Social content tools per agent */
export const AGENT_SOCIAL_TOOLS: Record<string, SocialToolName[]> = {
  "ai-marketer": [
    "get_social_brand_kit",
    "update_social_brand_kit",
    "get_social_connections",
    "resolve_background_image",
    "draft_social_post",
    "render_social_asset",
    "list_social_drafts",
    "publish_social_post",
  ],
}

/** All agents except finna get knowledge tools when installed */
export const KNOWLEDGE_ENABLED_AGENTS = ["finna", ...ALL_CATALOG_AGENT_IDS]

function canonicalAgentId(agentId: string): string {
  return resolveAgentId(agentId)
}

export function getFinanceToolIdsForAgent(agentId: string): FinanceToolName[] {
  return AGENT_FINANCE_TOOLS[canonicalAgentId(agentId)] ?? []
}

export function getDomainToolIdsForAgent(agentId: string): DomainToolName[] {
  return AGENT_DOMAIN_TOOLS[canonicalAgentId(agentId)] ?? []
}

export function getSalesToolIdsForAgent(agentId: string): SalesToolName[] {
  return AGENT_SALES_TOOLS[canonicalAgentId(agentId)] ?? []
}

export function getSocialToolIdsForAgent(agentId: string): SocialToolName[] {
  return AGENT_SOCIAL_TOOLS[canonicalAgentId(agentId)] ?? []
}

export function agentHasDomainTools(agentId: string): boolean {
  return getDomainToolIdsForAgent(agentId).length > 0
}

export function agentSupportsKnowledge(agentId: string): boolean {
  const resolved = canonicalAgentId(agentId)
  return KNOWLEDGE_ENABLED_AGENTS.includes(resolved)
}

export function listAgentCapabilities(agentId: string) {
  const resolved = canonicalAgentId(agentId)
  return {
    agentId: resolved,
    financeTools: getFinanceToolIdsForAgent(resolved),
    domainTools: getDomainToolIdsForAgent(resolved),
    salesTools: getSalesToolIdsForAgent(resolved),
    socialTools: getSocialToolIdsForAgent(resolved),
    knowledge: agentSupportsKnowledge(resolved),
    orchestration: resolved === "finna",
  }
}

/** Safe for client components — does not import server tool registry. */
export function agentHasLiveTools(agentId: string): boolean {
  return (
    getFinanceToolIdsForAgent(agentId).length > 0 ||
    getDomainToolIdsForAgent(agentId).length > 0 ||
    getSalesToolIdsForAgent(agentId).length > 0 ||
    getSocialToolIdsForAgent(agentId).length > 0 ||
    agentSupportsKnowledge(agentId) ||
    agentId === "finna"
  )
}
