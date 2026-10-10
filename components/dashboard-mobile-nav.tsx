"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Briefcase,
  Building2,
  FileText,
  Home,
  ImagePlay,
  LayoutPanelTop,
  LogOut,
  MessagesCircle,
  Rocket,
  Settings,
  Shield,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react"

import { CircularNavDome, CircularNavOverlay, type CircularNavItem, type CircularNavMoreItem } from "@/components/circular-nav"
import { getSettingsHref, type UserRole } from "@/lib/role-config"

function founderItems(): CircularNavItem[] {
  return [
    { label: "Home", href: "/founder", icon: Home },
    { label: "Finance", href: "/founder/finance", icon: Wallet },
    { label: "Finna", href: "/finna", icon: Sparkles },
    { label: "Sales", href: "/founder/sales", icon: Target },
    { label: "Raise", href: "/founder/fundraising", icon: Rocket },
    { label: "Lounge", href: "/founder/updates", icon: MessagesCircle },
  ]
}

function investorItems(): CircularNavItem[] {
  return [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Portfolio", href: "/portfolio", icon: Briefcase },
    { label: "Finna", href: "/finna", icon: Sparkles },
    { label: "Deals", href: "/deal-flow", icon: Target },
    { label: "Finance", href: "/dashboard/finance", icon: Wallet },
    { label: "Lounge", href: "/dashboard/updates", icon: MessagesCircle },
  ]
}

export function DashboardMobileNav({
  userRole,
  isAdmin,
  onSignOut,
}: {
  userRole: UserRole
  isAdmin?: boolean
  onSignOut: () => void
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const items = useMemo(
    () => (userRole === "founder" ? founderItems() : investorItems()),
    [userRole],
  )

  const moreItems = useMemo<CircularNavMoreItem[]>(() => {
    const links: CircularNavMoreItem[] =
      userRole === "founder"
        ? [
            { label: "Workspace", href: "/founder/workspace", icon: LayoutPanelTop },
            { label: "Social", href: "/founder/social", icon: ImagePlay },
            { label: "Documents", href: "/founder/documents", icon: FileText },
            { label: "Analytics", href: "/founder/analytics", icon: BarChart3 },
            { label: "U.S. company", href: "/founder/incorporate", icon: Building2 },
            { label: "Accelerator", href: "/accelerator", icon: Users },
          ]
        : [
            { label: "Reports", href: "/reports", icon: BarChart3 },
            { label: "Workspace", href: "/workspace", icon: LayoutPanelTop },
            { label: "Accelerator", href: "/accelerator", icon: Users },
          ]
    if (isAdmin) links.push({ label: "Admin", href: "/admin", icon: Shield })
    links.push({ label: "Settings", href: getSettingsHref(userRole), icon: Settings })
    links.push({ label: "Sign out", icon: LogOut, onClick: onSignOut })
    return links
  }, [userRole, isAdmin, onSignOut])

  return (
    <div className="lg:hidden">
      <CircularNavDome onClick={() => setOpen(true)} />
      <CircularNavOverlay open={open} onClose={() => setOpen(false)} items={items} moreItems={moreItems} />
    </div>
  )
}
