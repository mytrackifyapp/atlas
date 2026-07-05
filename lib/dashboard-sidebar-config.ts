import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Brain,
  Briefcase,
  Building2,
  Home,
  LayoutPanelTop,
  Lightbulb,
  Megaphone,
  Menu,
  MessageSquare,
  Rocket,
  Shield,
  Target,
  Users,
  Wallet,
} from "lucide-react"

import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"
import type { UserRole } from "@/lib/role-config"

export type SidebarAction = {
  name: string
  href: string
  icon: LucideIcon
}

export type SidebarPinnedAgent = {
  id: string
  name: string
  href: string
  imageSrc?: string
}

export type SidebarConfig = {
  home: SidebarAction
  featured: SidebarAction
  quickActions: SidebarAction[]
  manage: SidebarAction[]
  resources: SidebarAction[]
  pinnedAgents: SidebarPinnedAgent[]
  agentsHubHref: string
}

const FOUNDER_HOME = "/founder"
const INVESTOR_HOME = "/dashboard"

function pinnedAgents(base: string): SidebarPinnedAgent[] {
  return AI_AGENTS_CATALOG.filter((a) => a.imageSrc)
    .slice(0, 4)
    .map((a) => ({
      id: a.id,
      name: a.name,
      href: `${base}/ai/${a.id}`,
      imageSrc: a.imageSrc,
    }))
}

export function getSidebarConfig(role: UserRole): SidebarConfig {
  if (role === "founder") {
    return {
      home: { name: "Home", href: FOUNDER_HOME, icon: Home },
      featured: { name: "Finance", href: "/founder/finance", icon: Wallet },
      quickActions: [
        { name: "Fundraising", href: "/founder/fundraising", icon: Rocket },
        { name: "Sales", href: "/founder/sales", icon: Target },
        { name: "Social", href: "/founder/social", icon: Megaphone },
        { name: "Updates", href: "/founder/updates", icon: MessageSquare },
      ],
      manage: [
        { name: "Workspace", href: "/founder/workspace", icon: LayoutPanelTop },
        { name: "Company Structure", href: "/founder/structure", icon: Building2 },
        { name: "Analytics", href: "/founder/analytics", icon: BarChart3 },
        { name: "Documents", href: "/founder/documents", icon: Briefcase },
      ],
      resources: [{ name: "Accelerator", href: "/accelerator", icon: Users }],
      agentsHubHref: "/founder/ai",
      pinnedAgents: pinnedAgents("/founder"),
    }
  }

  return {
    home: { name: "Home", href: INVESTOR_HOME, icon: Home },
    featured: { name: "Portfolio", href: "/portfolio", icon: Briefcase },
    quickActions: [
      { name: "Deal Flow", href: "/deal-flow", icon: Lightbulb },
      { name: "Finance", href: "/dashboard/finance", icon: Wallet },
      { name: "Workspace", href: "/workspace", icon: LayoutPanelTop },
      { name: "Reports", href: "/reports", icon: BarChart3 },
    ],
    manage: [],
    resources: [{ name: "Accelerator", href: "/accelerator", icon: Users }],
    agentsHubHref: "/dashboard/ai",
    pinnedAgents: pinnedAgents("/dashboard"),
  }
}

export const adminSidebarItem: SidebarAction = {
  name: "Admin",
  href: "/admin",
  icon: Shield,
}

export const allAgentsAction = (href: string): SidebarAction => ({
  name: "All Agents",
  href,
  icon: Brain,
})

export function isNavActive(pathname: string, href: string) {
  if (href === "/founder" || href === "/dashboard") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export type MobileTab =
  | { kind: "link"; name: string; href: string; icon: LucideIcon }
  | { kind: "menu"; name: string; icon: LucideIcon }

export type MobileNavLayout = {
  left: MobileTab[]
  center: MobileTab
  right: MobileTab[]
}

export function getMobileNavLayout(role: UserRole): MobileNavLayout {
  if (role === "founder") {
    return {
      left: [
        { kind: "link", name: "Home", href: FOUNDER_HOME, icon: Home },
        { kind: "link", name: "Finance", href: "/founder/finance", icon: Wallet },
      ],
      center: { kind: "link", name: "AI", href: "/founder/ai", icon: Brain },
      right: [
        { kind: "link", name: "Sales", href: "/founder/sales", icon: Target },
        { kind: "menu", name: "More", icon: Menu },
      ],
    }
  }

  return {
    left: [
      { kind: "link", name: "Home", href: INVESTOR_HOME, icon: Home },
      { kind: "link", name: "Portfolio", href: "/portfolio", icon: Briefcase },
    ],
    center: { kind: "link", name: "AI", href: "/dashboard/ai", icon: Brain },
    right: [
      { kind: "link", name: "Deals", href: "/deal-flow", icon: Lightbulb },
      { kind: "menu", name: "More", icon: Menu },
    ],
  }
}

/** @deprecated Use getMobileNavLayout */
export function getMobileTabs(role: UserRole): MobileTab[] {
  const layout = getMobileNavLayout(role)
  return [...layout.left, layout.center, ...layout.right]
}

/** Nav items shown in the mobile drawer (excludes bottom-tab destinations). */
export function getMobileDrawerItems(role: UserRole): {
  quickActions: SidebarAction[]
  manage: SidebarAction[]
  resources: SidebarAction[]
} {
  const config = getSidebarConfig(role)

  if (role === "founder") {
    return {
      quickActions: config.quickActions.filter(
        (item) => !["/founder/sales"].includes(item.href),
      ),
      manage: config.manage,
      resources: config.resources,
    }
  }

  return {
    quickActions: config.quickActions.filter(
      (item) => !["/deal-flow", "/portfolio"].includes(item.href),
    ),
    manage: config.manage,
    resources: config.resources,
  }
}

export function isMobileTabActive(pathname: string, tab: MobileTab): boolean {
  if (tab.kind === "menu") return false
  return isNavActive(pathname, tab.href)
}
