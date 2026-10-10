import type { LucideIcon } from "lucide-react"
import { BarChart3, Briefcase, BuildingComplex, Home, ImagePlay, Lightbulb, MessagesCircle, Rocket, Users, Shield, LayoutPanelTop, UserRoundGroup, Wallet, Sparkles, Brain, Target } from "lucide-react"

export type UserRole = "investor" | "founder"

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface RoleConfig {
  role: UserRole
  displayName: string
  emoji: string
  navigation: NavItem[]
  defaultRoute: string
  primaryColor: string
  accentColor: string
}

export const roleConfigs: Record<UserRole, RoleConfig> = {
  investor: {
    role: "investor",
    displayName: "Investor View",
    emoji: "🎯",
    defaultRoute: "/dashboard",
    primaryColor: "oklch(0.92 0.19 128)", // new lime green #c1ff72
    accentColor: "oklch(0.6 0.15 220)", // blue
    navigation: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        description: "Portfolio overview and metrics",
      },
      {
        name: "Finance",
        href: "/dashboard/finance",
        icon: Wallet,
        description: "Transactions, budgets & accounts per workspace",
      },
      {
        name: "Portfolio",
        href: "/portfolio",
        icon: Briefcase,
        description: "View all investments",
      },
      {
        name: "Deal Flow",
        href: "/deal-flow",
        icon: Lightbulb,
        description: "Review new opportunities",
      },
      {
        name: "Workspace",
        href: "/workspace",
        icon: LayoutPanelTop,
        description: "Collaborative docs, memos & data room",
      },
      {
        name: "Lounge",
        href: "/dashboard/updates",
        icon: MessagesCircle,
        description: "Community for founders and investors",
      },
      {
        name: "Reports",
        href: "/reports",
        icon: BarChart3,
        description: "Analytics and insights",
      },
    ],
  },
  founder: {
    role: "founder",
    displayName: "Founder View",
    emoji: "🚀",
    defaultRoute: "/founder",
    primaryColor: "oklch(0.92 0.19 128)", // new lime green #c1ff72
    accentColor: "oklch(0.6 0.15 220)", // blue
    navigation: [
      {
        name: "Dashboard",
        href: "/founder",
        icon: Home,
        description: "Company overview",
      },
      {
        name: "Finance",
        href: "/founder/finance",
        icon: Wallet,
        description: "Transactions, budgets & accounts per workspace",
      },
      {
        name: "Fundraising",
        href: "/founder/fundraising",
        icon: Rocket,
        description: "Manage your raise",
      },
      {
        name: "Sales",
        href: "/founder/sales",
        icon: Target,
        description: "B2B leads & outbound pipeline",
      },
      {
        name: "Social",
        href: "/founder/social",
        icon: ImagePlay,
        description: "AI-generated branded social posts",
      },
      {
        name: "Workspace",
        href: "/founder/workspace",
        icon: LayoutPanelTop,
        description: "Collaborative docs, memos & data room",
      },
      {
        name: "Lounge",
        href: "/founder/updates",
        icon: MessagesCircle,
        description: "Community for founders and investors",
      },
      {
        name: "Company Structure",
        href: "/founder/structure",
        icon: UserRoundGroup,
        description: "Team, equity, stakeholders & co-founders",
      },
      {
        name: "Analytics",
        href: "/founder/analytics",
        icon: BarChart3,
        description: "Track company metrics",
      },
    ],
  },
}

export const sharedNavigation: NavItem[] = [
  {
    name: "Accelerator",
    href: "/accelerator",
    icon: Users,
    description: "Join the startup accelerator",
  },
  {
    name: "Finna",
    href: "/finna",
    icon: Brain,
    description: "Your AI operating partner",
  },
]

export const adminNavigation: NavItem[] = [
  {
    name: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    description: "User management and analytics",
  },
]

export function getRoleConfig(role: UserRole): RoleConfig {
  return roleConfigs[role]
}

export function getSettingsHref(role: UserRole): string {
  return role === "founder" ? "/founder/settings" : "/dashboard/settings"
}

export function getRoleFromPath(pathname: string): UserRole {
  return pathname?.startsWith("/founder") ? "founder" : "investor"
}
