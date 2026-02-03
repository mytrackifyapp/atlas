import type { LucideIcon } from "lucide-react"
import { BarChart3, Briefcase, Home, Lightbulb, MessageSquare, Rocket, Users, Shield, LayoutPanelTop } from "lucide-react"

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
        name: "Fundraising",
        href: "/founder/fundraising",
        icon: Rocket,
        description: "Manage your raise",
      },
      {
        name: "Workspace",
        href: "/workspace",
        icon: LayoutPanelTop,
        description: "Collaborative docs, memos & data room",
      },
      {
        name: "Investor Updates",
        href: "/founder/updates",
        icon: MessageSquare,
        description: "Send updates to investors",
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

export function getRoleFromPath(pathname: string): UserRole {
  return pathname?.startsWith("/founder") ? "founder" : "investor"
}
