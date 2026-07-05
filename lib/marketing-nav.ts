import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  DatabaseZap,
  Lightbulb,
  NewspaperIcon,
  Rocket,
  ScrollText,
  Users,
} from "lucide-react"

export type MarketingMenuLink = {
  label: string
  href: string
  icon: LucideIcon
}

export const MARKETING_NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Companies", href: "/companies" },
  { label: "AI Agents", href: "/ai-agents" },
  { label: "Pricing", href: "/pricing" },
] as const

export const MARKETING_SOLUTIONS_LINKS: MarketingMenuLink[] = [
  { label: "For Investors", href: "/solutions/investors", icon: Briefcase },
  { label: "For Founders", href: "/solutions/founders", icon: Lightbulb },
  { label: "For Startups", href: "/solutions/startups", icon: Users },
  { label: "Accelerators", href: "/solutions/accelerators", icon: Rocket },
]

export const MARKETING_RESOURCES_LINKS: MarketingMenuLink[] = [
  { label: "Blog", href: "/blog", icon: NewspaperIcon },
  { label: "White Paper", href: "/whitepaper", icon: ScrollText },
  { label: "Developer API", href: "/developer", icon: DatabaseZap },
]
