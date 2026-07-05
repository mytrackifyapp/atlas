"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  getMobileNavLayout,
  isMobileTabActive,
  type MobileTab,
} from "@/lib/dashboard-sidebar-config"
import type { UserRole } from "@/lib/role-config"
import { cn } from "@/lib/utils"

const BAR_BG = "#0a0a0a"
const ACTIVE = "#c1ff72"
const INACTIVE = "#8a8a8a"

function SideTab({
  tab,
  active,
  onMenuOpen,
}: {
  tab: MobileTab
  active: boolean
  onMenuOpen: () => void
}) {
  const Icon = tab.icon
  const color = active ? ACTIVE : INACTIVE

  const inner = (
    <>
      <Icon className="h-[21px] w-[21px] shrink-0" strokeWidth={1.75} style={{ color }} />
      <span className="truncate text-[10px] font-medium leading-none" style={{ color }}>
        {tab.name}
      </span>
    </>
  )

  const className =
    "flex h-full flex-col items-center justify-end gap-[6px] pb-1.5 transition-opacity active:opacity-70"

  if (tab.kind === "menu") {
    return (
      <button type="button" onClick={onMenuOpen} className={className} aria-label="Open menu">
        {inner}
      </button>
    )
  }

  return (
    <Link href={tab.href} className={className}>
      {inner}
    </Link>
  )
}

function CenterTab({ tab, active }: { tab: MobileTab; active: boolean }) {
  if (tab.kind !== "link") return null

  const Icon = tab.icon
  const color = active ? ACTIVE : INACTIVE

  return (
    <div className="relative flex h-full flex-col items-center justify-end pb-1.5">
      <Link
        href={tab.href}
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[55%]"
        aria-label={tab.name}
      >
        <div
          className={cn(
            "flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 transition-shadow",
            active
              ? "border-[#c1ff72]/50 bg-[#111111] shadow-[0_0_16px_-3px_rgba(193,255,114,0.55)]"
              : "border-[#3a3a3a] bg-[#111111]",
          )}
        >
          <Icon className="h-[21px] w-[21px]" strokeWidth={1.75} style={{ color }} />
        </div>
      </Link>
      <span className="text-[10px] font-medium leading-none" style={{ color }}>
        {tab.name}
      </span>
    </div>
  )
}

export function DashboardMobileNav({
  userRole,
  onMenuOpen,
  isMenuOpen,
}: {
  userRole: UserRole
  onMenuOpen: () => void
  isMenuOpen: boolean
}) {
  const pathname = usePathname()
  const { left, center, right } = getMobileNavLayout(userRole)
  const tabs = [...left, center, ...right]

  const isActive = (tab: MobileTab) =>
    tab.kind === "menu" ? isMenuOpen : isMobileTabActive(pathname, tab)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary navigation"
    >
      <div
        className="relative mx-auto max-w-lg rounded-t-[20px] border-t border-[#1f1f1f] shadow-[0_-6px_28px_rgba(0,0,0,0.4)]"
        style={{ backgroundColor: BAR_BG }}
      >
        <div className="relative grid h-[56px] grid-cols-5 items-stretch px-2">
          {tabs.map((tab, index) =>
            index === 2 ? (
              <CenterTab key={tab.name} tab={tab} active={isActive(tab)} />
            ) : (
              <SideTab
                key={tab.name}
                tab={tab}
                active={isActive(tab)}
                onMenuOpen={onMenuOpen}
              />
            ),
          )}
        </div>
      </div>
    </nav>
  )
}
