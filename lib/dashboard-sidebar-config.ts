import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Brain,
  Briefcase,
  BuildingComplex,
  Home,
  ImagePlay,
  Landmark,
  LayoutPanelTop,
  Lightbulb,
  Menu,
  MessagesCircle,
  Rocket,
  Shield,
  Sparkles,
  Target,
  UserRoundGroup,
  Users,
  Wallet,
} from "lucide-react"

import type { UserRole } from "@/lib/role-config"

export type SidebarAction = {
  name: string
  href: string
  icon: LucideIcon
  children?: SidebarAction[]
}

export type SidebarConfig = {
  home: SidebarAction
  featured: SidebarAction
  quickActions: SidebarAction[]
  manage: SidebarAction[]
  resources: SidebarAction[]
  agentsHubHref: string
  finnaHref: string
}

const FOUNDER_HOME = "/founder"
const INVESTOR_HOME = "/dashboard"
const FINNA_HREF = "/finna"

export function getSidebarConfig(role: UserRole): SidebarConfig {
  if (role === "founder") {
    return {
      home: { name: "Home", href: FOUNDER_HOME, icon: Home },
      featured: {
        name: "Finance",
        href: "/founder/finance",
        icon: Wallet,
        children: [
          { name: "US bank account", href: "/founder/finance/us-account", icon: Landmark },
        ],
      },
      quickActions: [
        { name: "Fundraising", href: "/founder/fundraising", icon: Rocket },
        { name: "Sales", href: "/founder/sales", icon: Target },
        { name: "Social", href: "/founder/social", icon: ImagePlay },
        { name: "Lounge", href: "/founder/updates", icon: MessagesCircle },
      ],
      manage: [
        { name: "Workspace", href: "/founder/workspace", icon: LayoutPanelTop },
        { name: "Company Structure", href: "/founder/structure", icon: UserRoundGroup },
        { name: "U.S. company", href: "/founder/incorporate", icon: BuildingComplex },
        { name: "Analytics", href: "/founder/analytics", icon: BarChart3 },
        { name: "Documents", href: "/founder/documents", icon: Briefcase },
      ],
      resources: [{ name: "Accelerator", href: "/accelerator", icon: Users }],
      agentsHubHref: "/founder/ai",
      finnaHref: FINNA_HREF,
    }
  }

  return {
    home: { name: "Home", href: INVESTOR_HOME, icon: Home },
    featured: { name: "Portfolio", href: "/portfolio", icon: Briefcase },
    quickActions: [
      { name: "Deal Flow", href: "/deal-flow", icon: Lightbulb },
      {
        name: "Finance",
        href: "/dashboard/finance",
        icon: Wallet,
        children: [
          { name: "US bank account", href: "/dashboard/finance/us-account", icon: Landmark },
        ],
      },
      { name: "Workspace", href: "/workspace", icon: LayoutPanelTop },
      { name: "Lounge", href: "/dashboard/updates", icon: MessagesCircle },
      { name: "Reports", href: "/reports", icon: BarChart3 },
    ],
    manage: [],
    resources: [{ name: "Accelerator", href: "/accelerator", icon: Users }],
    agentsHubHref: "/dashboard/ai",
    finnaHref: FINNA_HREF,
  }
}

export const adminSidebarItem: SidebarAction = {
  name: "Admin",
  href: "/admin",
  icon: Shield,
}

export const finnaSidebarAction = (href = "/finna"): SidebarAction => ({
  name: "Finna",
  href,
  icon: Sparkles,
})

export const skillsSidebarAction = (href: string): SidebarAction => ({
  name: "Skills",
  href,
  icon: Brain,
})

/** @deprecated Use finnaSidebarAction / skillsSidebarAction */
export const allAgentsAction = (href: string): SidebarAction => skillsSidebarAction(href)

export function isNavActive(pathname: string, href: string, exact = false) {
  if (exact || href === "/founder" || href === "/dashboard" || href === "/founder/finance" || href === "/dashboard/finance") {
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
      center: { kind: "menu", name: "More", icon: Menu },
      right: [
        { kind: "link", name: "AI", href: "/finna", icon: Sparkles },
        { kind: "link", name: "Sales", href: "/founder/sales", icon: Target },
      ],
    }
  }

  return {
    left: [
      { kind: "link", name: "Home", href: INVESTOR_HOME, icon: Home },
      { kind: "link", name: "Portfolio", href: "/portfolio", icon: Briefcase },
    ],
    center: { kind: "menu", name: "More", icon: Menu },
    right: [
      { kind: "link", name: "AI", href: "/finna", icon: Sparkles },
      { kind: "link", name: "Deals", href: "/deal-flow", icon: Lightbulb },
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
