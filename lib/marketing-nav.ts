import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  Building2,
  DatabaseZap,
  Globe,
  Info,
  Landmark,
  Lightbulb,
  NewspaperIcon,
  Rocket,
  ScrollText,
} from "lucide-react"

export type MarketingMenuLink = {
  label: string
  href: string
  icon: LucideIcon
}

export const MARKETING_NAV_LINKS = [
  { label: "Capital", href: "/capital" },
  { label: "Finna AI", href: "/ai-agents" },
  { label: "Pricing", href: "/pricing" },
] as const

export const MARKETING_SOLUTIONS_LINKS: MarketingMenuLink[] = [
  { label: "Trackify Capital", href: "/capital", icon: Landmark },
  { label: "For Investors", href: "/solutions/investors", icon: Briefcase },
  { label: "For Founders", href: "/solutions/founders", icon: Lightbulb },
  { label: "Accelerators", href: "/solutions/accelerators", icon: Rocket },
  { label: "U.S. company", href: "/incorporate", icon: Globe },
]

export const MARKETING_RESOURCES_LINKS: MarketingMenuLink[] = [
  { label: "About", href: "/about", icon: Info },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Blog", href: "/blog", icon: NewspaperIcon },
  { label: "White Paper", href: "/whitepaper", icon: ScrollText },
  { label: "Developer API", href: "/developer", icon: DatabaseZap },
]
