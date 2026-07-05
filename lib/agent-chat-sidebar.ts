import { resolveAgentId } from "@/lib/ai-agents-catalog"
import { listAgentCapabilities } from "@/lib/agents/tool-map"

export type AgentWorkspaceLink = {
  label: string
  href: string
  description: string
}

export type AgentToolIcon =
  | "chart"
  | "flame"
  | "file-text"
  | "folder"
  | "search"
  | "shield"
  | "scale"
  | "users"
  | "mail"
  | "messages"
  | "handshake"
  | "image"
  | "megaphone"
  | "target"
  | "sparkles"
  | "list"
  | "clipboard"
  | "calendar"
  | "git-compare"
  | "briefcase"
  | "user-plus"
  | "wand"

export type AgentChatSuggestion = {
  id: string
  label: string
  prompt: string
  description: string
  icon: AgentToolIcon
}

const WORKSPACE_LINKS: Record<string, AgentWorkspaceLink[]> = {
  "ai-cfo": [
    { label: "Finance", href: "/founder/finance", description: "Accounts, transactions, runway" },
    { label: "Fundraising", href: "/founder/fundraising", description: "Round progress & pipeline" },
    { label: "Investor updates", href: "/founder/updates", description: "Past updates & drafts" },
    { label: "Analytics", href: "/founder/analytics", description: "Growth & KPI trends" },
  ],
  "ai-lawyer": [
    { label: "Documents", href: "/founder/documents", description: "Contracts & legal files" },
    { label: "Company structure", href: "/founder/structure", description: "Stakeholders & equity" },
  ],
  "ai-sales-rep": [
    { label: "Sales CRM", href: "/founder/sales", description: "Leads, pipeline, outreach" },
    { label: "Investors", href: "/founder/investors", description: "Investor relationships" },
  ],
  "ai-marketer": [
    { label: "Social studio", href: "/founder/social", description: "Drafts, graphics, publish" },
    { label: "Analytics", href: "/founder/analytics", description: "Channel performance" },
  ],
  "ai-ops-manager": [
    { label: "Workspace", href: "/founder/workspace", description: "Goals & execution" },
    { label: "Team", href: "/founder/team", description: "People & roles" },
    { label: "Apps", href: "/founder/apps", description: "Integrations & automations" },
  ],
  "ai-hr": [
    { label: "Team", href: "/founder/team", description: "Hiring & org chart" },
    { label: "Structure", href: "/founder/structure", description: "Roles & equity" },
  ],
}

const SUGGESTIONS: Record<string, AgentChatSuggestion[]> = {
  "ai-cfo": [
    {
      id: "runway",
      icon: "chart",
      label: "Runway snapshot",
      description: "Live burn and months remaining",
      prompt: "What's our current runway based on live finance data?",
    },
    {
      id: "burn",
      icon: "flame",
      label: "Burn summary",
      description: "Summarize monthly spend trends",
      prompt: "Summarize our burn rate and biggest expenses this month.",
    },
    {
      id: "investor-update",
      icon: "file-text",
      label: "Investor update",
      description: "Draft from latest metrics",
      prompt: "Draft a monthly investor update from our latest metrics and highlights.",
    },
    {
      id: "data-room",
      icon: "folder",
      label: "Data room prep",
      description: "Series A checklist and gaps",
      prompt: "What should be in our Series A data room?",
    },
  ],
  "ai-lawyer": [
    {
      id: "nda",
      icon: "search",
      label: "Review NDA",
      description: "Flag risky clauses before signing",
      prompt: "Review key risks in a mutual NDA for a startup.",
    },
    {
      id: "employment",
      icon: "file-text",
      label: "Employment terms",
      description: "First hire offer letter basics",
      prompt: "What should we include in a first employee offer letter and agreement?",
    },
    {
      id: "security",
      icon: "shield",
      label: "Security checklist",
      description: "Seed-stage compliance baseline",
      prompt: "Give me a startup security checklist for our seed stage.",
    },
    {
      id: "compliance",
      icon: "scale",
      label: "Compliance scan",
      description: "Early-stage legal watchlist",
      prompt: "What compliance issues should an early-stage startup watch for?",
    },
  ],
  "ai-sales-rep": [
    {
      id: "pipeline",
      icon: "list",
      label: "Pipeline follow-ups",
      description: "Who needs a nudge this week",
      prompt: "Who in my pipeline needs follow-up this week?",
    },
    {
      id: "outreach",
      icon: "mail",
      label: "Cold outreach",
      description: "Draft a qualified B2B email",
      prompt: "Draft a cold outreach email for a qualified B2B lead.",
    },
    {
      id: "objections",
      icon: "messages",
      label: "Handle objections",
      description: "Respond to pricing pushback",
      prompt: "How should I respond to a prospect pushing back on price?",
    },
    {
      id: "partnership",
      icon: "handshake",
      label: "Partner outreach",
      description: "Strategic integration pitch",
      prompt: "Draft a partner outreach email for a strategic integration.",
    },
  ],
  "ai-marketer": [
    {
      id: "linkedin",
      icon: "image",
      label: "LinkedIn post",
      description: "Branded graphic and caption",
      prompt: "Create a LinkedIn branding_graphic post about our value prop.",
    },
    {
      id: "campaign",
      icon: "megaphone",
      label: "Launch campaign",
      description: "2-week multi-channel plan",
      prompt: "Outline a 2-week launch campaign across email, social, and blog.",
    },
    {
      id: "gtm",
      icon: "target",
      label: "GTM experiments",
      description: "Plan 3 channel tests",
      prompt: "Build a GTM plan for launching in Nigeria with 3 channel experiments.",
    },
    {
      id: "positioning",
      icon: "sparkles",
      label: "Sharpen positioning",
      description: "Differentiate vs competitors",
      prompt: "Help me sharpen our positioning against two main competitors.",
    },
  ],
  "ai-ops-manager": [
    {
      id: "sop",
      icon: "clipboard",
      label: "Draft SOP",
      description: "Onboarding handoff workflow",
      prompt: "Draft an SOP for our weekly customer onboarding handoff.",
    },
    {
      id: "priorities",
      icon: "list",
      label: "Weekly priorities",
      description: "Top goals from your metrics",
      prompt: "Summarize my top priorities for this week from our goals.",
    },
    {
      id: "standup",
      icon: "calendar",
      label: "Standup agenda",
      description: "Focused team sync outline",
      prompt: "Create a focused standup agenda for a 10-person team.",
    },
    {
      id: "vendor",
      icon: "git-compare",
      label: "Compare vendors",
      description: "Evaluate ops stack options",
      prompt: "Help me compare three SaaS vendors for our ops stack.",
    },
  ],
  "ai-hr": [
    {
      id: "jd",
      icon: "briefcase",
      label: "Job description",
      description: "Founding engineer role draft",
      prompt: "Write a job description for a founding engineer.",
    },
    {
      id: "interview",
      icon: "users",
      label: "Interview kit",
      description: "Behavioral question bank",
      prompt: "Give me behavioral interview questions for a head of sales.",
    },
    {
      id: "onboarding",
      icon: "user-plus",
      label: "Onboarding plan",
      description: "First-week new hire schedule",
      prompt: "Outline a first-week onboarding plan for a new hire.",
    },
    {
      id: "performance",
      icon: "wand",
      label: "Performance review",
      description: "Simple startup template",
      prompt: "Draft a simple performance review template for a startup team.",
    },
  ],
}

const TOOL_LABELS: Record<string, string> = {
  get_accounts: "Finance accounts",
  get_transactions: "Transactions",
  compute_runway: "Runway calculator",
  get_fundraise_summary: "Fundraise summary",
  get_investor_pipeline: "Investor pipeline",
  get_deal_flow: "Deal flow",
  get_company_structure: "Company structure",
  get_investor_updates: "Investor updates",
  get_founder_metrics: "Founder metrics",
  list_sales_leads: "Sales leads",
  draft_social_post: "Social drafts",
  publish_social_post: "Publish social",
  search_knowledge: "Knowledge search",
}

export function getAgentWorkspaceLinks(agentId: string): AgentWorkspaceLink[] {
  return WORKSPACE_LINKS[resolveAgentId(agentId)] ?? []
}

export function getAgentChatSuggestions(agentId: string): AgentChatSuggestion[] {
  return SUGGESTIONS[resolveAgentId(agentId)] ?? []
}

export function getAgentLiveToolLabels(agentId: string): string[] {
  const caps = listAgentCapabilities(agentId)
  const ids = [
    ...caps.financeTools,
    ...caps.domainTools,
    ...caps.salesTools,
    ...caps.socialTools,
  ]
  if (caps.knowledge) ids.push("search_knowledge")
  return [...new Set(ids)].map((id) => TOOL_LABELS[id] ?? id.replace(/_/g, " "))
}

export function getAgentAutomations(agentId: string): Array<{
  id: string
  label: string
  description: string
  disabled?: boolean
}> {
  const resolved = resolveAgentId(agentId)
  if (resolved === "ai-cfo") {
    return [
      {
        id: "cfo_weekly_digest",
        label: "Weekly finance brief",
        description: "Runway, burn, and board-ready summary",
      },
    ]
  }
  if (resolved === "ai-sales-rep") {
    return [
      {
        id: "pipeline_digest",
        label: "Pipeline digest",
        description: "Stale leads & follow-up suggestions",
        disabled: true,
      },
    ]
  }
  if (resolved === "ai-marketer") {
    return [
      {
        id: "content_calendar",
        label: "Content calendar",
        description: "Auto-plan next week's posts",
        disabled: true,
      },
    ]
  }
  return []
}
