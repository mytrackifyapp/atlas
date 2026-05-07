import type { LucideIcon } from "lucide-react"
import {
  BadgeDollarSign,
  Briefcase,
  FileText,
  Gavel,
  Globe,
  Handshake,
  HeartPulse,
  Landmark,
  Megaphone,
  MessageSquareText,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
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
  | "Strategy"
  | "Security"

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

export const AI_AGENTS_CATALOG: AiAgent[] = [
  {
    id: "ai-lawyer",
    name: "AI Lawyer",
    category: "Legal",
    description: "Review contracts, flag risky clauses, and draft standard terms.",
    icon: Gavel,
    imageSrc: "/lawyer2.png",
    tags: ["contracts", "terms", "risk", "drafting"],
    comingSoon: true,
  },
  {
    id: "ai-cfo",
    name: "CFO",
    category: "Finance",
    description: "Cashflow insights, burn/runway, and budget recommendations.",
    icon: BadgeDollarSign,
    imageSrc: "/cfo.png",
    tags: ["runway", "burn", "cashflow", "budget"],
    comingSoon: true,
    useLiveAvatar: true,
    useSynthesia: true,
  },
  {
    id: "ai-sales-rep",
    name: "Sales Rep",
    category: "Sales",
    description: "Generate outreach, objections handling, and follow-up sequences.",
    icon: Target,
    imageSrc: "/sales.png",
    tags: ["outreach", "objections", "pipeline", "closing"],
    comingSoon: true,
  },
  {
    id: "ai-marketer",
    name: "Marketer",
    category: "Marketing",
    description: "Campaign ideas, ad angles, landing page copy, and content plans.",
    icon: Megaphone,
    imageSrc: "/ops.png",
    tags: ["campaigns", "copy", "content", "ads"],
    comingSoon: true,
  },
  {
    id: "ai-ops-manager",
    name: "Ops Manager",
    category: "Operations",
    description: "SOP drafts, process checklists, and weekly ops planning.",
    icon: WandSparkles,
    imageSrc: "/marketer.png",
    tags: ["sops", "process", "checklists", "planning"],
    comingSoon: true,
  },
  {
    id: "ai-hr",
    name: "HR Partner",
    category: "HR",
    description: "Job descriptions, interview questions, and performance templates.",
    icon: Users,
    tags: ["hiring", "interviews", "performance", "templates"],
    imageSrc: "/lawyer.png",
    comingSoon: true,
  },
  {
    id: "ai-strategy",
    name: "Strategy Analyst",
    category: "Strategy",
    description: "Market research outlines, positioning, and competitive analysis.",
    icon: Globe,
    tags: ["positioning", "research", "competition"],
    comingSoon: true,
  },
  {
    id: "ai-security",
    name: "Security Advisor",
    category: "Security",
    description: "Security checklist, policy drafts, and best-practice guidance.",
    icon: ShieldCheck,
    tags: ["policies", "checklist", "best-practices"],
    comingSoon: true,
  },
  {
    id: "ai-partnerships",
    name: "Partnerships",
    category: "Sales",
    description: "Partner outreach and win-win deal structures.",
    icon: Handshake,
    tags: ["partners", "outreach", "deals"],
    comingSoon: true,
  },
  {
    id: "ai-procurement",
    name: "Procurement",
    category: "Operations",
    description: "Vendor comparisons and negotiation prep.",
    icon: ShoppingCart,
    tags: ["vendors", "negotiation", "ops"],
    comingSoon: true,
  },
  {
    id: "ai-investor-updates",
    name: "Investor Updates",
    category: "Strategy",
    description: "Draft investor updates from highlights, metrics, and asks.",
    icon: MessageSquareText,
    tags: ["updates", "story", "metrics"],
    comingSoon: true,
  },
  {
    id: "ai-fundraising",
    name: "Fundraising",
    category: "Finance",
    description: "Data room checklist, narrative, and round planning.",
    icon: Landmark,
    tags: ["deck", "data-room", "round"],
    comingSoon: true,
  },
  {
    id: "ai-exec-assistant",
    name: "Executive Assistant",
    category: "Operations",
    description: "Summaries, action items, and weekly priorities.",
    icon: Sparkles,
    tags: ["priorities", "summaries", "actions"],
    comingSoon: true,
  },
  {
    id: "ai-gc-lite",
    name: "General Counsel Lite",
    category: "Legal",
    description: "Issue-spotting and policy drafts for common startup scenarios.",
    icon: FileText,
    tags: ["policies", "compliance", "startups"],
    comingSoon: true,
  },
  {
    id: "ai-gtm",
    name: "GTM Planner",
    category: "Marketing",
    description: "Create GTM plans with channels, messaging, and experiments.",
    icon: Briefcase,
    tags: ["gtm", "experiments", "messaging"],
    comingSoon: true,
  },
  {
    id: "ai-wellness",
    name: "Wellness Coach",
    category: "HR",
    description: "Light guidance for routines, burnout prevention, and team wellness.",
    icon: HeartPulse,
    tags: ["wellness", "burnout", "habits"],
    comingSoon: true,
  },
]

export const AGENT_CATEGORIES: AgentCategory[] = [
  "Legal",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
  "HR",
  "Strategy",
  "Security",
]

