import { resolveAgentId } from "@/lib/ai-agents-catalog"

export type FoundationField = {
  key: string
  label: string
  placeholder: string
  multiline?: boolean
  section?: "business" | "email"
  inputType?: "email"
}

export type FoundationFileUpload = {
  maxFiles: number
  hint: string
}

export type AgentFoundationConfig = {
  title: string
  description: string
  fields: FoundationField[]
  toolSuggestions: string[]
  toolIcons?: Record<string, string>
  integrationsTitle?: string
  integrationsHint?: string
  allowCustomIntegrations?: boolean
  fileUpload?: FoundationFileUpload
}

const FOUNDATION_CONFIG: Record<string, AgentFoundationConfig> = {
  "ai-sales-rep": {
    title: "Tell your team about your startup",
    description:
      "Share who you are, what you sell, and who you're trying to reach so outreach sounds like you.",
    fields: [
      {
        key: "whoYouAre",
        label: "Who you are",
        placeholder: "Company name, your role, and one-line positioning…",
        multiline: true,
      },
      {
        key: "whatYouSell",
        label: "What you sell",
        placeholder: "Products, plans, pricing, and key differentiators…",
        multiline: true,
      },
      {
        key: "idealCustomer",
        label: "Ideal customer (ICP)",
        placeholder: "Industry, company size, buyer persona, and pain points…",
        multiline: true,
      },
      {
        key: "salesGoals",
        label: "Sales goals",
        placeholder: "Pipeline targets, channels, and what success looks like this quarter…",
        multiline: true,
      },
      {
        key: "workEmail",
        label: "Work email",
        placeholder: "you@company.com",
        section: "email",
        inputType: "email",
      },
    ],
    toolSuggestions: [],
    fileUpload: {
      maxFiles: 5,
      hint: "Pitch deck, one-pager, pricing sheet, or case study. PDF and text files are indexed for your agent.",
    },
  },
  "ai-marketer": {
    title: "Tell your team about your brand",
    description:
      "Share your voice, audience, and goals so campaigns and content feel on-brand from day one.",
    fields: [
      {
        key: "brandName",
        label: "Brand & voice",
        placeholder: "Brand name, tone (bold, friendly, expert), and words to avoid…",
        multiline: true,
      },
      {
        key: "whatYouSell",
        label: "What you promote",
        placeholder: "Offers, launches, and the main story you want told…",
        multiline: true,
      },
      {
        key: "targetAudience",
        label: "Target audience",
        placeholder: "Who you're trying to reach and what they care about…",
        multiline: true,
      },
      {
        key: "marketingGoals",
        label: "Marketing goals",
        placeholder: "Growth targets, channels to prioritize, and upcoming launches…",
        multiline: true,
      },
    ],
    toolSuggestions: ["Facebook", "Instagram", "TikTok"],
    toolIcons: {
      Facebook: "/icons/facebook.png",
      Instagram: "/icons/instagram.png",
      TikTok: "/icons/tik-tok.png",
    },
    integrationsTitle: "Social platforms",
    integrationsHint: "Connect the platforms you post on so your marketer can plan content in the right places.",
    allowCustomIntegrations: false,
  },
  "ai-cfo": {
    title: "Tell your team about your runway and goals",
    description:
      "Share your stage, how you make money, and what you're working toward so advice fits your real numbers.",
    fields: [
      {
        key: "companyStage",
        label: "Company stage",
        placeholder: "Pre-seed, seed, Series A — team size and geography…",
      },
      {
        key: "businessModel",
        label: "Business model",
        placeholder: "How you make money, pricing, and unit economics…",
        multiline: true,
      },
      {
        key: "financialGoals",
        label: "Financial goals",
        placeholder: "Runway targets, burn limits, and reporting cadence…",
        multiline: true,
      },
      {
        key: "fundraising",
        label: "Fundraising context",
        placeholder: "Raising now or later? Target round size, timeline, and use of funds…",
        multiline: true,
      },
    ],
    toolSuggestions: ["Trackify Finance", "QuickBooks", "Stripe", "Google Sheets"],
  },
  "ai-lawyer": {
    title: "Tell your team about your legal needs",
    description:
      "Share your company setup and what you need reviewed so contracts and policies match how you actually work.",
    fields: [
      {
        key: "companyName",
        label: "Company & jurisdiction",
        placeholder: "Legal entity, country/state of incorporation…",
      },
      {
        key: "legalPriorities",
        label: "Legal priorities",
        placeholder: "NDAs, employment, fundraising docs, IP, compliance…",
        multiline: true,
      },
      {
        key: "riskTolerance",
        label: "Risk tolerance",
        placeholder: "What you will vs. won't accept in contracts…",
        multiline: true,
      },
    ],
    toolSuggestions: ["Trackify Documents", "DocuSign", "Google Drive"],
  },
  "ai-ops-manager": {
    title: "Tell your team how your company runs",
    description:
      "Share your team structure, workflows, and bottlenecks so plans and SOPs match how you actually operate.",
    fields: [
      {
        key: "teamContext",
        label: "Team & structure",
        placeholder: "Team size, roles, and how work gets done today…",
        multiline: true,
      },
      {
        key: "operationsFocus",
        label: "Operations focus",
        placeholder: "Biggest bottlenecks, recurring workflows, and tools in use…",
        multiline: true,
      },
      {
        key: "opsGoals",
        label: "Ops goals",
        placeholder: "What you want to streamline this quarter…",
        multiline: true,
      },
    ],
    toolSuggestions: ["Trackify Workspace", "Notion", "Slack", "Asana"],
  },
  "ai-hr": {
    title: "Tell your team about your culture and hiring",
    description:
      "Share your values, open roles, and how you work so job posts and onboarding feel like your company.",
    fields: [
      {
        key: "companyCulture",
        label: "Company culture",
        placeholder: "Values, working style, and what great hires look like…",
        multiline: true,
      },
      {
        key: "hiringGoals",
        label: "Hiring goals",
        placeholder: "Roles you're filling, timeline, and must-have skills…",
        multiline: true,
      },
      {
        key: "hrPolicies",
        label: "HR policies",
        placeholder: "Remote/hybrid, benefits highlights, and compliance notes…",
        multiline: true,
      },
    ],
    toolSuggestions: ["Trackify Team", "Greenhouse", "Lever", "Google Workspace"],
  },
}

const DEFAULT_CONFIG: AgentFoundationConfig = {
  title: "Tell your team about your business",
  description: "Share a bit of context so every conversation starts with your company in mind.",
  fields: [
    {
      key: "businessContext",
      label: "Business context",
      placeholder: "What you do, who you serve, and what you're trying to achieve…",
      multiline: true,
    },
    {
      key: "priorities",
      label: "Priorities",
      placeholder: "What matters most when this agent helps you…",
      multiline: true,
    },
  ],
  toolSuggestions: ["Trackify Workspace"],
}

export function getAgentFoundationConfig(agentId: string): AgentFoundationConfig {
  return FOUNDATION_CONFIG[resolveAgentId(agentId)] ?? DEFAULT_CONFIG
}

export function emptyFoundationFields(agentId: string): Record<string, string> {
  const config = getAgentFoundationConfig(agentId)
  return Object.fromEntries(config.fields.map((field) => [field.key, ""]))
}
