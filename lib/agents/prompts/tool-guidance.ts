import {
  getDomainToolIdsForAgent,
  getFinanceToolIdsForAgent,
  getSalesToolIdsForAgent,
  getSocialToolIdsForAgent,
  agentSupportsKnowledge,
} from "@/lib/agents/tool-map"

const TOOL_HINTS: Record<string, string> = {
  get_accounts: "List finance accounts and balances.",
  get_transactions: "List recent income/expense transactions.",
  compute_runway: "Compute burn and runway from live finance data.",
  get_fundraise_summary: "Active fundraising round progress and targets.",
  get_investor_pipeline: "Investor pipeline for the current round.",
  get_deal_flow: "Investor deal flow / pipeline companies.",
  get_company_structure: "Team, stakeholders, roles, and equity.",
  get_investor_updates: "Previously sent investor updates.",
  get_founder_metrics: "Revenue, burn, cash, runway KPIs.",
  list_sales_leads: "B2B sales leads in the CRM (filter by stage/segment).",
  get_sales_lead: "Full profile for one B2B lead including research notes.",
  find_sales_lead: "Search CRM by name/email/company — call before create or outreach when user names someone.",
  get_sales_pipeline_summary: "Lead counts by stage and follow-up needed.",
  create_sales_lead: "Add a new B2B lead to the CRM (write).",
  save_lead_research: "Save research summary and mark lead as Researched (write).",
  update_lead_stage: "Move a lead to a new pipeline stage (write).",
  draft_outreach_email: "Save a personalized outreach email draft (does not send).",
  draft_follow_up_sequence: "Create a scheduled multi-step follow-up email sequence (write).",
  list_outreach_drafts: "List outreach drafts and sent emails from the CRM.",
  send_outreach_email: "Send an outreach email (requires human approval — T2).",
  log_outreach_reply: "Log a reply to outreach and update lead stage to Replied (write).",
  get_social_brand_kit: "Workspace brand kit: logo, colors, company name for social graphics.",
  update_social_brand_kit: "Update brand colors or company name (logo is uploaded in /founder/social UI).",
  get_social_connections: "Check LinkedIn connection status for publishing.",
  resolve_background_image:
    "Search Pexels with post context (headline, caption, templateId). Picks the best-matching stock photo—not just the first result. Use for editorial_photo and photo_launch backgrounds.",
  draft_social_post:
    "Create ONE social post + auto-render PNG. Pass userRequest (user's exact message). Tool REJECTS vague requests — clarify first. Always set fields.headline.",
  render_social_asset: "Re-render PNG for an existing post after edits (write).",
  list_social_drafts: "List social post drafts and rendered graphics.",
  publish_social_post: "Publish a rendered LinkedIn post (requires human approval — T2).",
  search_knowledge: "Search indexed notes, workspace memos, and memories.",
  save_memory: "Save an important fact for future sessions.",
  list_my_agents: "List installed AI Employees (Finna only).",
  delegate_to_agent: "Delegate a task to a specialist (Finna only).",
}

export function getToolGuidanceAppendix(agentId: string): string {
  const lines: string[] = []
  const finance = getFinanceToolIdsForAgent(agentId)
  const domain = getDomainToolIdsForAgent(agentId)
  const sales = getSalesToolIdsForAgent(agentId)
  const social = getSocialToolIdsForAgent(agentId)
  const knowledge = agentSupportsKnowledge(agentId)

  if (finance.length > 0) {
    lines.push("Finance tools — call before inventing numbers:")
    for (const id of finance) lines.push(`- ${id}: ${TOOL_HINTS[id]}`)
  }

  if (domain.length > 0) {
    lines.push("Platform data tools — use for live Trackify data:")
    for (const id of domain) lines.push(`- ${id}: ${TOOL_HINTS[id]}`)
  }

  if (sales.length > 0) {
    lines.push("B2B sales CRM tools:")
    for (const id of sales) lines.push(`- ${id}: ${TOOL_HINTS[id]}`)
  }

  if (social.length > 0) {
    lines.push("Social content tools:")
    for (const id of social) lines.push(`- ${id}: ${TOOL_HINTS[id]}`)
  }

  if (knowledge) {
    lines.push("Knowledge tools:")
    lines.push(`- search_knowledge: ${TOOL_HINTS.search_knowledge}`)
    if (agentId !== "finna") {
      lines.push(`- save_memory: ${TOOL_HINTS.save_memory}`)
    }
  }

  if (agentId === "finna") {
    lines.push("Orchestration (signed-in):")
    lines.push(`- list_my_agents: ${TOOL_HINTS.list_my_agents}`)
    lines.push(`- delegate_to_agent: ${TOOL_HINTS.delegate_to_agent}`)
  }

  if (lines.length === 0) return ""

  return `\n\nLive tools (read-only unless noted):
${lines.join("\n")}
- Call relevant tools before claiming you lack account data.
- Cite numbers and excerpts from tool results; do not invent balances, pipeline, or document content.`
}
