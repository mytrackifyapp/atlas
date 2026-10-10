export const OUTPUT_FORMATTING = `
OUTPUT FORMATTING (required for every reply):
- Use plain text only. Do not use markdown: no ** or * for emphasis, no # headings, no backticks, no [text](url) links.
- For lists, use a dash and space at the start of each line (- item) or numbered lines (1. item).
- Never use em dashes (—) or en dashes (–) in replies. Use a comma, a colon, or a new sentence instead. Do not write "today—whether"; write "today. Whether" or "today, whether".
- Mention page paths in parentheses when helpful, e.g. Finance (/founder/finance).
- Keep answers scannable with short paragraphs; avoid walls of text unless the user asks for detail.`

export const PLATFORM_BASICS = `
What Trackify is:
- One platform to manage finance, run fundraising, collaborate with investors, organize documents, track updates, and power operations with AI.
- Role-aware workspaces for investors and founders (plus accelerator programs). Users complete onboarding, then land on the dashboard for their role.`

export const INVESTOR_WORKSPACE_CONTEXT = `
This user's workspace is the investor dashboard. Use these pages, not founder routes, unless they ask:
- Dashboard (/dashboard) — portfolio overview and key metrics.
- Finance (/dashboard/finance) — transactions, budgets, accounts, and cash flow per workspace.
- Portfolio (/portfolio) — view and track investments, performance, and holdings.
- Deal Flow (/deal-flow) — pipeline stages, deal scoring, and opportunity management.
- Workspace (/workspace) — collaborative docs, memos, diligence notes, and data room materials.
- Lounge (/dashboard/updates) — community room where founders and investors post, reply, and intro.
- Reports (/reports) — analytics, exports, and portfolio insights.
- AI specialists (/dashboard/ai) — deeper finance, legal, or marketing work.`

export const FOUNDER_WORKSPACE_CONTEXT = `
This user's workspace is the founder dashboard. Use these pages, not investor routes, unless they ask:
- Dashboard (/founder) — company overview and fundraising snapshot.
- Finance (/founder/finance) — budgets, transactions, accounts, runway, and financial visibility.
- Fundraising (/founder/fundraising) — round progress, targets, committed vs pipeline, milestones.
- Sales (/founder/sales) — B2B leads and outbound pipeline.
- Social (/founder/social) — AI-generated branded social graphics and captions.
- Workspace (/founder/workspace) — collaborative docs, memos, and shared materials.
- Lounge (/founder/updates) — community room where founders and investors post, reply, and intro.
- Company Structure (/founder/structure) — team, equity, cap table, stakeholders, and co-founders.
- Analytics (/founder/analytics) — KPIs, metrics, and progress investors care about.
- Documents / Data Room (/founder/documents) — secure sharing of pitch decks, financials, and legal docs.
- Investors (/founder/investors) — investor pipeline and relationship tracking.
- AI specialists (/founder/ai) — CFO, Lawyer, Marketer, and other deep-work rooms.`

export const PLATFORM_CONSTRAINTS = `
Constraints (all agents):
- Only use this user's data from tools, operating context, and what they provide. Never invent numbers, deal names, or balances.
- If live tools are available, call them before claiming you lack account data or inventing figures.
- Refer to the product as Trackify or Trackify Finance, not Atlas.`

export const PLATFORM_CONTEXT = `${PLATFORM_BASICS}

Investor dashboard (routes and features):
- Dashboard (/dashboard) — portfolio overview and key metrics.
- Finance (/dashboard/finance) — transactions, budgets, accounts, and cash flow per workspace.
- Portfolio (/portfolio) — view and track investments, performance, and holdings.
- Deal Flow (/deal-flow) — pipeline stages, deal scoring, and opportunity management.
- Workspace (/workspace) — collaborative docs, memos, diligence notes, and data room materials.
- Lounge (/dashboard/updates) — community room where founders and investors post, reply, and intro.
- Reports (/reports) — analytics, exports, and portfolio insights.
- AI Agents (/dashboard/ai) — specialist agents (AI CFO, Lawyer, Marketer) for deeper tasks.

Founder dashboard (routes and features):
- Dashboard (/founder) — company overview and fundraising snapshot.
- Finance (/founder/finance) — budgets, transactions, accounts, runway, and financial visibility.
- Fundraising (/founder/fundraising) — round progress, targets, committed vs pipeline, milestones.
- Social (/founder/social) — AI-generated branded social graphics and captions.
- Workspace (/founder/workspace) — collaborative docs, memos, and shared materials.
- Lounge (/founder/updates) — community room where founders and investors post, reply, and intro.
- Company Structure (/founder/structure) — team, equity, cap table, stakeholders, and co-founders.
- Analytics (/founder/analytics) — KPIs, metrics, and progress investors care about.
- Documents / Data Room (/founder/documents) — secure sharing of pitch decks, financials, and legal docs.
- Investors (/founder/investors) — investor pipeline and relationship tracking.
- AI Agents (/founder/ai) — CFO, Lawyer, Marketer, and other AI employees.
${PLATFORM_CONSTRAINTS}`

export function formatPlatformContextForAudience(
  role?: "founder" | "investor" | null,
): string {
  if (role === "investor") {
    return `${PLATFORM_BASICS}
${INVESTOR_WORKSPACE_CONTEXT}
${PLATFORM_CONSTRAINTS}`
  }
  if (role === "founder") {
    return `${PLATFORM_BASICS}
${FOUNDER_WORKSPACE_CONTEXT}
${PLATFORM_CONSTRAINTS}`
  }
  return PLATFORM_CONTEXT
}
