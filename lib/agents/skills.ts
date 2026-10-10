import type {
  DomainToolName,
  FinanceToolName,
  SalesToolName,
} from "@/lib/agents/tool-map"

/**
 * Internal capability packs. The user talks to Finna; these skills
 * decide which live tools and specialist prompts run behind the scenes.
 */
export type AgentSkillId =
  | "finance"
  | "fundraising"
  | "company"
  | "metrics"
  | "deal_flow"
  | "sales_read"
  | "knowledge"
  | "legal"
  | "marketing"
  | "ops"
  | "hr"

export type FinnaToolset = {
  skills: AgentSkillId[]
  financeTools: FinanceToolName[]
  domainTools: DomainToolName[]
  salesTools: SalesToolName[]
  knowledge: boolean
  saveMemory: boolean
  orchestration: boolean
}

const FOUNDER_SKILLS: AgentSkillId[] = [
  "finance",
  "fundraising",
  "company",
  "metrics",
  "sales_read",
  "knowledge",
  "legal",
  "marketing",
  "ops",
  "hr",
]

const INVESTOR_SKILLS: AgentSkillId[] = [
  "finance",
  "deal_flow",
  "knowledge",
  "legal",
]

export function getSkillsForRole(role?: string | null): AgentSkillId[] {
  if (role === "investor") return [...INVESTOR_SKILLS]
  return [...FOUNDER_SKILLS]
}

export function getFinnaToolset(role?: string | null): FinnaToolset {
  const skills = getSkillsForRole(role)
  const has = (id: AgentSkillId) => skills.includes(id)

  const domainTools: DomainToolName[] = []
  if (has("fundraising")) {
    domainTools.push(
      "get_fundraise_summary",
      "get_investor_pipeline",
      "get_investor_updates"
    )
  }
  if (has("company")) domainTools.push("get_company_structure")
  if (has("metrics")) domainTools.push("get_founder_metrics")
  if (has("deal_flow")) domainTools.push("get_deal_flow")

  return {
    skills,
    financeTools: has("finance")
      ? ["get_accounts", "get_transactions", "compute_runway"]
      : [],
    domainTools,
    salesTools: has("sales_read")
      ? ["list_sales_leads", "get_sales_pipeline_summary"]
      : [],
    knowledge: has("knowledge"),
    saveMemory: has("knowledge"),
    orchestration: true,
  }
}

/** Map a specialist agent to the skill it represents. */
export function skillForSpecialistAgent(agentId: string): AgentSkillId | null {
  switch (agentId) {
    case "ai-cfo":
      return "finance"
    case "ai-lawyer":
      return "legal"
    case "ai-sales-rep":
      return "sales_read"
    case "ai-marketer":
      return "marketing"
    case "ai-ops-manager":
      return "ops"
    case "ai-hr":
      return "hr"
    default:
      return null
  }
}
