import { AI_AGENTS_CATALOG, resolveAgentId, type AiAgent } from "@/lib/ai-agents-catalog"

export type AgentIconName =
  | "bar-chart"
  | "calendar"
  | "eye"
  | "file-search"
  | "lightbulb"
  | "message-square"
  | "search"
  | "sparkles"
  | "target"
  | "users"
  | "wrench"

export type AgentFeature = {
  title: string
  description: string
  icon: AgentIconName
}

export type AgentStep = {
  title: string
  description: string
}

export type AgentChatMessage = {
  role: "user" | "agent"
  text: string
}

export type AgentMarketingContent = {
  displayName: string
  roleTitle: string
  accent: string
  heroHeadline: string
  heroSubheadline: string
  pitchHeadline: string
  pitchBody: string
  pitchTagline: string
  stepsTitle: string
  stepsSubtitle: string
  steps: AgentStep[]
  features: AgentFeature[]
  chatDemo: AgentChatMessage[]
  capabilityIcons: AgentIconName[]
}

export type SerializableAgent = {
  id: string
  name: string
  category: AiAgent["category"]
  description: string
  imageSrc?: string
  tags: string[]
}

const DEFAULT_FEATURES: AgentFeature[] = [
  {
    title: "Understand your context",
    description: "Connect goals, documents, and priorities so the agent knows your business.",
    icon: "eye",
  },
  {
    title: "Surface smart recommendations",
    description: "Get structured suggestions tailored to your stage and workflow.",
    icon: "sparkles",
  },
  {
    title: "Plan and prioritize",
    description: "Turn messy inputs into clear next steps with deadlines and owners.",
    icon: "calendar",
  },
  {
    title: "Draft and refine",
    description: "Generate first drafts you can review, edit, and approve before sharing.",
    icon: "file-search",
  },
  {
    title: "Track outcomes",
    description: "Measure what worked and improve templates over time.",
    icon: "bar-chart",
  },
  {
    title: "Stay consistent",
    description: "Apply the same quality bar across every task the agent handles.",
    icon: "target",
  },
]

const CATEGORY_DEFAULTS: Record<
  AiAgent["category"],
  Pick<AgentMarketingContent, "accent" | "stepsTitle" | "stepsSubtitle" | "steps">
> = {
  Legal: {
    accent: "#2dd4bf",
    stepsTitle: "Jumpstart in a few clicks",
    stepsSubtitle: "Start with Trackify AI and your legal agent in minutes — no complex setup.",
    steps: [
      {
        title: "Set the foundation",
        description:
          "Define contracts, policies, and risk tolerance so the agent understands what 'good' looks like for your startup.",
      },
      {
        title: "Add legal context",
        description: "Upload agreements, term sheets, and jurisdiction details for smarter reviews.",
      },
      {
        title: "Define review priorities",
        description: "Flag liability, IP, indemnity, and termination clauses that matter most to you.",
      },
      {
        title: "You decide, the agent executes",
        description: "Review drafts and recommendations — nothing is sent without your approval.",
      },
      {
        title: "Learn and refine",
        description: "Improve templates and playbooks as your legal needs evolve.",
      },
    ],
  },
  Finance: {
    accent: "#34d399",
    stepsTitle: "Jumpstart in a few clicks",
    stepsSubtitle: "Start with Trackify AI and your finance agent in minutes — no spreadsheets required.",
    steps: [
      {
        title: "Set the foundation",
        description: "Connect runway goals, burn targets, and reporting cadence.",
      },
      {
        title: "Add financial context",
        description: "Share revenue, expenses, and cash position for accurate insights.",
      },
      {
        title: "Define decision priorities",
        description: "Highlight metrics that matter for board updates and fundraising.",
      },
      {
        title: "You decide, the agent executes",
        description: "Approve budgets, forecasts, and recommendations before they go out.",
      },
      {
        title: "Learn and refine",
        description: "Tune models and alerts as your business scales.",
      },
    ],
  },
  Sales: {
    accent: "#60a5fa",
    stepsTitle: "Jumpstart in a few clicks",
    stepsSubtitle: "Start with Trackify AI and your sales agent in minutes — no CRM overhaul needed.",
    steps: [
      {
        title: "Set the foundation",
        description: "Define ICP, offer, and pipeline stages so outreach stays on-message.",
      },
      {
        title: "Add sales context",
        description: "Share product details, objections, and win/loss notes.",
      },
      {
        title: "Define outreach priorities",
        description: "Choose channels, tone, and follow-up cadence for your team.",
      },
      {
        title: "You decide, the agent executes",
        description: "Review sequences and replies before they reach prospects.",
      },
      {
        title: "Learn and refine",
        description: "Double down on messaging that converts.",
      },
    ],
  },
  Marketing: {
    accent: "#a78bfa",
    stepsTitle: "Jumpstart in a few clicks",
    stepsSubtitle: "Start with Trackify AI and your marketing agent in minutes — no agency retainer.",
    steps: [
      {
        title: "Set the foundation",
        description: "Define audience, positioning, and campaign goals.",
      },
      {
        title: "Add brand context",
        description: "Share voice guidelines, past campaigns, and channel performance.",
      },
      {
        title: "Define creative priorities",
        description: "Pick formats, angles, and CTAs that match your funnel.",
      },
      {
        title: "You decide, the agent executes",
        description: "Approve copy and plans before anything goes live.",
      },
      {
        title: "Learn and refine",
        description: "Iterate on what drives clicks, leads, and signups.",
      },
    ],
  },
  Operations: {
    accent: "#22d3ee",
    stepsTitle: "Jumpstart in a few clicks",
    stepsSubtitle: "Start with Trackify AI and your ops agent in minutes — no process consultants.",
    steps: [
      {
        title: "Set the foundation",
        description: "Map teams, workflows, and weekly rhythms.",
      },
      {
        title: "Add operational context",
        description: "Share SOPs, tools, and bottlenecks holding the team back.",
      },
      {
        title: "Define execution priorities",
        description: "Choose what to automate, standardize, or delegate first.",
      },
      {
        title: "You decide, the agent executes",
        description: "Approve checklists and plans before rolling them out.",
      },
      {
        title: "Learn and refine",
        description: "Improve processes as the team grows.",
      },
    ],
  },
  HR: {
    accent: "#fb7185",
    stepsTitle: "Jumpstart in a few clicks",
    stepsSubtitle: "Start with Trackify AI and your HR agent in minutes — no HRIS migration.",
    steps: [
      {
        title: "Set the foundation",
        description: "Define roles, culture, and hiring goals.",
      },
      {
        title: "Add people context",
        description: "Share org structure, comp bands, and interview rubrics.",
      },
      {
        title: "Define hiring priorities",
        description: "Clarify must-have skills and success criteria per role.",
      },
      {
        title: "You decide, the agent executes",
        description: "Review JDs, interview kits, and comms before sending.",
      },
      {
        title: "Learn and refine",
        description: "Improve hiring quality with every cycle.",
      },
    ],
  },
}

const OVERRIDES: Partial<Record<string, Partial<AgentMarketingContent>>> = {
  "ai-lawyer": {
    displayName: "Vera",
    roleTitle: "Legal Counsel",
    pitchHeadline: "Most startup legal work doesn't fail — it gets deprioritized.",
    pitchBody:
      "Contracts pile up. Terms stall. Risk gets spotted too late. Vera brings structure to legal and security ops so teams move fast with clarity, not guesswork.",
    pitchTagline: "One AI legal agent — no extra headcount required.",
    heroHeadline: "Meet Vera — your leading AI legal agent",
    heroSubheadline:
      "From contract review to security policies — Vera helps you stay protected. Built to flag risk early, draft startup-friendly terms, and keep deals moving without legal drag.",
    features: [
      { title: "Review contracts intelligently", description: "Evaluate agreements against your risk priorities and standard terms.", icon: "search" },
      { title: "Flag risky clauses", description: "Surface liability, IP, and termination issues before you sign.", icon: "eye" },
      { title: "Draft standard terms", description: "Generate NDAs, MSAs, and amendments tailored to your stage.", icon: "file-search" },
      { title: "Define legal requirements", description: "Clarify jurisdiction, indemnity, and compliance expectations.", icon: "target" },
      { title: "Support policy creation", description: "Draft privacy, security, and employment policies for startups.", icon: "wrench" },
      { title: "Run security checklists", description: "Practical access, data-handling, and incident-response guidance.", icon: "lightbulb" },
    ],
    chatDemo: [
      { role: "user", text: "Can you review this vendor contract?" },
      {
        role: "agent",
        text: "Absolutely. Before I dive in — what's the deal size, and are there any clauses you always push back on? I'll flag liability caps, auto-renewal, and IP assignment first.",
      },
    ],
    capabilityIcons: ["eye", "sparkles", "calendar", "search"],
  },
  "ai-cfo": {
    displayName: "Finley",
    roleTitle: "Chief Financial Officer",
    pitchHeadline: "Most finance teams don't fail — they get buried in spreadsheets.",
    pitchBody:
      "Burn rates shift. Runway gets fuzzy. Investor updates stall. Finley brings structure to finance and strategy so you operate with clarity, not chaos.",
    pitchTagline: "One AI finance agent — no extra layers required.",
    heroHeadline: "Meet Finley — your leading AI finance agent",
    heroSubheadline:
      "From cashflow to investor updates — Finley handles finance, fundraising, and strategic narrative. Built for runway insights, data room prep, positioning research, and board-ready comms.",
    features: [
      { title: "Track burn and runway", description: "Monitor cash position and months remaining at current spend.", icon: "bar-chart" },
      { title: "Forecast cashflow", description: "Model scenarios based on revenue, expenses, and hiring plans.", icon: "calendar" },
      { title: "Plan fundraising rounds", description: "Data room checklists, milestones, and round timelines.", icon: "target" },
      { title: "Draft investor updates", description: "Monthly narratives from highlights, metrics, and asks.", icon: "message-square" },
      { title: "Sharpen positioning", description: "Competitive landscapes, segments, and strategic trade-offs.", icon: "search" },
      { title: "Support data room prep", description: "Organize what investors need before diligence starts.", icon: "lightbulb" },
    ],
    chatDemo: [
      { role: "user", text: "What's our runway looking like?" },
      {
        role: "agent",
        text: "Based on current burn and cash on hand, you're at ~14 months. Want me to model a hiring freeze vs. two eng hires? I can also prep a board-ready summary.",
      },
    ],
    capabilityIcons: ["bar-chart", "sparkles", "calendar", "target"],
  },
  "ai-sales-rep": {
    displayName: "Ace",
    roleTitle: "Sales Representative",
    pitchHeadline: "Most sales teams don't fail — they lose momentum.",
    pitchBody:
      "Leads go cold. Follow-ups slip. Objections repeat. Ace brings structure to outbound so teams close with consistency, not chaos.",
    pitchTagline: "One AI sales agent — no extra SDRs required.",
    heroHeadline: "Meet Ace — your leading AI sales agent",
    heroSubheadline:
      "From outreach to follow-ups — Ace helps you fill pipeline. Built to craft sequences, handle objections, and keep deals moving without manual drag.",
    features: [
      { title: "Craft outreach sequences", description: "Generate multi-touch campaigns tailored to your ICP.", icon: "message-square" },
      { title: "Handle objections", description: "Prepare responses for pricing, timing, and competitor concerns.", icon: "wrench" },
      { title: "Personalize at scale", description: "Adapt messaging per segment without losing your voice.", icon: "users" },
      { title: "Prioritize pipeline", description: "Surface deals that need action this week.", icon: "target" },
      { title: "Draft follow-up emails", description: "Keep momentum with timely, on-brand nudges.", icon: "search" },
      { title: "Analyze win patterns", description: "Learn what messaging and channels convert best.", icon: "bar-chart" },
    ],
    chatDemo: [
      { role: "user", text: "I need a cold email for fintech founders" },
      {
        role: "agent",
        text: "Got it. What's the core outcome you deliver in one line? I'll draft a 3-email sequence with a soft CTA — want it consultative or direct?",
      },
    ],
    capabilityIcons: ["target", "sparkles", "message-square", "users"],
  },
  "ai-marketer": {
    displayName: "Maya",
    roleTitle: "Marketing Manager",
    pitchHeadline: "Most marketing teams don't fail — they spread too thin.",
    pitchBody:
      "Campaigns stall. Copy takes forever. Channels multiply. Maya brings structure to growth so teams ship with clarity, not burnout.",
    pitchTagline: "One AI marketing agent — no agency required.",
    heroHeadline: "Meet Maya — your leading AI marketing agent",
    heroSubheadline:
      "From campaigns to GTM — Maya handles growth end-to-end. Built for angles, launch plans, social content, and channel experiments without agency drag.",
    features: [
      { title: "Plan campaign angles", description: "Brainstorm hooks, offers, and channel mix for each launch.", icon: "lightbulb" },
      { title: "Build GTM plans", description: "Channels, messaging, experiments, and launch timelines.", icon: "target" },
      { title: "Write landing page copy", description: "Draft headlines, benefits, and CTAs that convert.", icon: "file-search" },
      { title: "Create social content", description: "Branded graphics and captions for LinkedIn and Instagram.", icon: "sparkles" },
      { title: "Map content calendars", description: "Posts, emails, and assets aligned to funnel stages.", icon: "calendar" },
      { title: "Iterate on performance", description: "Refine what works from engagement and conversion data.", icon: "bar-chart" },
    ],
    chatDemo: [
      { role: "user", text: "We're launching a new feature next week" },
      {
        role: "agent",
        text: "Exciting. Who's the primary audience — existing users or new signups? I'll sketch a launch plan with email, social, and a landing page outline.",
      },
    ],
    capabilityIcons: ["sparkles", "calendar", "lightbulb", "eye"],
  },
  "ai-ops-manager": {
    displayName: "Otto",
    roleTitle: "Operations Manager",
    pitchHeadline: "Most ops teams don't fail — they drown in chaos.",
    pitchBody:
      "Processes break. SOPs go stale. Priorities shift daily. Otto brings structure to operations so teams run with clarity, not firefighting.",
    pitchTagline: "One AI ops agent — no consultants required.",
    heroHeadline: "Meet Otto — your leading AI operations agent",
    heroSubheadline:
      "From SOPs to weekly planning — Otto keeps your team aligned. Built to draft processes, checklists, and ops rhythms without operational drag.",
    features: [
      { title: "Draft SOPs and playbooks", description: "Document repeatable workflows your team can follow.", icon: "file-search" },
      { title: "Build process checklists", description: "Standardize launches, onboarding, and handoffs.", icon: "calendar" },
      { title: "Plan weekly ops", description: "Turn goals into priorities, owners, and deadlines.", icon: "target" },
      { title: "Spot bottlenecks", description: "Identify where work stalls across teams and tools.", icon: "eye" },
      { title: "Support tool rollouts", description: "Create adoption plans when you add new systems.", icon: "wrench" },
      { title: "Improve over time", description: "Refine processes based on what actually gets done.", icon: "bar-chart" },
    ],
    chatDemo: [
      { role: "user", text: "Our onboarding is messy" },
      {
        role: "agent",
        text: "Let's fix that. How many roles do you hire per quarter, and which tools are involved on day one? I'll draft a 30-60-90 checklist with owners.",
      },
    ],
    capabilityIcons: ["calendar", "target", "wrench", "sparkles"],
  },
  "ai-hr": {
    displayName: "Harper",
    roleTitle: "HR Partner",
    pitchHeadline: "Most hiring teams don't fail — they get overwhelmed.",
    pitchBody:
      "Roles pile up. JDs stall. Interviews queue. Decisions drag. Harper brings structure to hiring so teams build with clarity, not urgency.",
    pitchTagline: "One AI HR agent — no extra recruiters required.",
    heroHeadline: "Meet Harper — your leading AI HR agent",
    heroSubheadline:
      "From job descriptions to interview kits — Harper helps you hire smarter. Built to clarify roles, standardize evaluation, and keep hiring moving.",
    features: [
      { title: "Write job descriptions", description: "Clarify scope, seniority, and success criteria per role.", icon: "file-search" },
      { title: "Create interview scorecards", description: "Standardize evaluation across every interviewer.", icon: "target" },
      { title: "Prepare interview questions", description: "Generate structured, role-specific question sets.", icon: "message-square" },
      { title: "Support candidate comms", description: "Draft follow-ups, rejections, and offer letters.", icon: "users" },
      { title: "Define hiring requirements", description: "Align must-haves with team needs and culture.", icon: "eye" },
      { title: "Improve hiring outcomes", description: "Review what worked and refine each cycle.", icon: "bar-chart" },
    ],
    chatDemo: [
      { role: "user", text: "I wanna hire a product designer" },
      {
        role: "agent",
        text: "Great. Is this senior or mid-level, and what's the first project they'll own? I'll draft a JD and a scorecard with portfolio review criteria.",
      },
    ],
    capabilityIcons: ["users", "calendar", "target", "sparkles"],
  },
}

const TAG_FEATURE_ICONS: AgentIconName[] = [
  "search",
  "eye",
  "lightbulb",
  "target",
  "message-square",
  "wrench",
  "bar-chart",
  "users",
]

function buildFeatures(agent: AiAgent): AgentFeature[] {
  return agent.tags.slice(0, 6).map((tag, i) => ({
    title: tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, " "),
    description: `Expert support for ${tag} — tailored to your ${agent.category.toLowerCase()} workflow.`,
    icon: TAG_FEATURE_ICONS[i % TAG_FEATURE_ICONS.length],
  }))
}

function buildChatDemo(agent: AiAgent, displayName: string): AgentChatMessage[] {
  return [
    { role: "user", text: `I need help with ${agent.tags[0] ?? agent.category.toLowerCase()}` },
    {
      role: "agent",
      text: `Happy to help. Tell me a bit more about your goals and timeline — I'll suggest a clear plan and draft the first deliverable for your review.`,
    },
  ]
}

export function getAgentById(agentId: string): AiAgent | undefined {
  const resolved = resolveAgentId(agentId)
  return AI_AGENTS_CATALOG.find((a) => a.id === resolved)
}

export function getAgentMarketingContent(agent: AiAgent): AgentMarketingContent {
  const categoryDefaults = CATEGORY_DEFAULTS[agent.category]
  const override = OVERRIDES[agent.id] ?? {}
  const displayName = override.displayName ?? agent.name.replace(/^AI\s+/i, "")
  const roleTitle = override.roleTitle ?? `${agent.category} Specialist`

  return {
    displayName,
    roleTitle,
    accent: override.accent ?? categoryDefaults.accent,
    heroHeadline:
      override.heroHeadline ??
      `Meet ${displayName} — your leading AI ${agent.category.toLowerCase()} agent`,
    heroSubheadline:
      override.heroSubheadline ??
      `${agent.description} Built to reduce noise, improve quality, and keep ${agent.category.toLowerCase()} work moving without operational drag.`,
    pitchHeadline:
      override.pitchHeadline ??
      `Most ${agent.category.toLowerCase()} work doesn't fail — it gets deprioritized.`,
    pitchBody:
      override.pitchBody ??
      `Tasks pile up. Decisions stall. Context gets lost. ${displayName} brings structure to ${agent.category.toLowerCase()} so your team executes with clarity.`,
    pitchTagline:
      override.pitchTagline ?? `One AI ${agent.category.toLowerCase()} agent — no extra headcount required.`,
    stepsTitle: override.stepsTitle ?? categoryDefaults.stepsTitle,
    stepsSubtitle: override.stepsSubtitle ?? categoryDefaults.stepsSubtitle,
    steps: override.steps ?? categoryDefaults.steps,
    features: override.features ?? buildFeatures(agent),
    chatDemo: override.chatDemo ?? buildChatDemo(agent, displayName),
    capabilityIcons: override.capabilityIcons ?? ["eye", "sparkles", "calendar", "target"],
  }
}

export function toSerializableAgent(agent: AiAgent): SerializableAgent {
  return {
    id: agent.id,
    name: agent.name,
    category: agent.category,
    description: agent.description,
    imageSrc: agent.imageSrc,
    tags: agent.tags,
  }
}

export function getAgentPagePath(agentId: string) {
  return `/ai-agents/${agentId}`
}
