import type { LucideIcon } from "lucide-react"
import {
  BadgeDollarSign,
  Gavel,
  Megaphone,
  Target,
  Users,
  WandSparkles,
} from "lucide-react"

export type AgentCategory =
  | "Legal"
  | "Finance"
  | "Sales"
  | "Marketing"
  | "Operations"
  | "HR"

export type AiAgent = {
  id: string
  name: string
  category: AgentCategory
  description: string
  icon: LucideIcon
  imageSrc?: string
  tags: string[]
  href?: string
  comingSoon?: boolean
  /** HeyGen LiveAvatar: show embed tab (requires `LIVEAVATAR_*` env or per-agent IDs). */
  useLiveAvatar?: boolean
  /** Optional UUIDs from [LiveAvatar](https://app.liveavatar.com); falls back to env vars. */
  liveAvatar?: {
    avatarId?: string
    contextId?: string
  }
  /** [Synthesia](https://www.synthesia.io/) published video embed tab (`NEXT_PUBLIC_SYNTHESIA_VIDEO_ID` or `synthesiaVideoId`). */
  useSynthesia?: boolean
  /** Synthesia share video id or embed URL path segment; overrides env when set. */
  synthesiaVideoId?: string
}

/**
 * Legacy agent IDs merged into main specialists (old URLs still resolve).
 */
export const AGENT_ID_ALIASES: Record<string, string> = {
  "ai-fundraising": "ai-cfo",
  "ai-gtm": "ai-marketer",
  "ai-gc-lite": "ai-lawyer",
  "ai-partnerships": "ai-sales-rep",
  "ai-procurement": "ai-ops-manager",
  "ai-investor-updates": "ai-cfo",
  "ai-strategy": "ai-cfo",
  "ai-security": "ai-lawyer",
  "ai-exec-assistant": "ai-ops-manager",
  "ai-wellness": "ai-hr",
}

export function resolveAgentId(agentId: string): string {
  return AGENT_ID_ALIASES[agentId] ?? agentId
}

export function isCatalogAgentId(agentId: string): boolean {
  const resolved = resolveAgentId(agentId)
  return AI_AGENTS_CATALOG.some((agent) => agent.id === resolved)
}

/** Six core AI employees — each covers a full function area. */
export const AI_AGENTS_CATALOG: AiAgent[] = [
  {
    id: "ai-lawyer",
    name: "Vera",
    category: "Legal",
    description:
      "Contracts, compliance, security policies, checklists, and startup legal issue-spotting — in one legal agent.",
    icon: Gavel,
    imageSrc: "/lawyer2.png",
    tags: ["contracts", "policies", "compliance", "security"],
  },
  {
    id: "ai-cfo",
    name: "Finley",
    category: "Finance",
    description:
      "Cashflow, runway, fundraising prep, investor updates, positioning research, and data room planning.",
    icon: BadgeDollarSign,
    imageSrc: "/cfo.png",
    tags: ["runway", "burn", "fundraising", "investor-updates"],
    useLiveAvatar: true,
    useSynthesia: true,
  },
  {
    id: "ai-sales-rep",
    name: "Ace",
    category: "Sales",
    description:
      "B2B outreach, pipeline management, objection handling, and partnership deal structures.",
    icon: Target,
    imageSrc: "/sales.png",
    tags: ["outreach", "pipeline", "partnerships", "deals"],
  },
  {
    id: "ai-marketer",
    name: "Maya",
    category: "Marketing",
    description:
      "Campaigns, copy, GTM plans, channel experiments, social content, and launch strategy.",
    icon: Megaphone,
    imageSrc: "/ops.png",
    tags: ["campaigns", "gtm", "copy", "social"],
  },
  {
    id: "ai-ops-manager",
    name: "Otto",
    category: "Operations",
    description:
      "SOPs, vendor procurement, weekly planning, priorities, and cross-team execution.",
    icon: WandSparkles,
    imageSrc: "/marketer.png",
    tags: ["sops", "procurement", "planning", "priorities"],
  },
  {
    id: "ai-hr",
    name: "Harper",
    category: "HR",
    description:
      "Hiring, interview kits, performance templates, onboarding, and team wellness support.",
    icon: Users,
    tags: ["hiring", "interviews", "performance", "wellness"],
    imageSrc: "/lawyer.png",
  },
]

export const AGENT_CATEGORIES: AgentCategory[] = [
  "Legal",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
  "HR",
]
