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

function PillTab({
  tab,
  active,
  onMenuOpen,
}: {
  tab: MobileTab
  active: boolean
  onMenuOpen: () => void
}) {
  const Icon = tab.icon

  const inner = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          active && "bg-white/12",
        )}
      >
        <Icon
          className={cn("h-[18px] w-[18px]", active ? "text-white" : "text-white/55")}
          strokeWidth={active ? 2 : 1.75}
        />
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[10px] font-medium leading-none",
          active ? "text-white" : "text-white/50",
        )}
      >
        {tab.name}
      </span>
    </>
  )

  const className =
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-0.5 transition-opacity active:opacity-70"

  if (tab.kind === "menu") {
    return (
      <button type="button" onClick={onMenuOpen} className={className} aria-label={tab.name}>
        {inner}
      </button>
    )
  }

  return (
    <Link href={tab.href} className={className} aria-current={active ? "page" : undefined}>
      {inner}
    </Link>
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
  const pillTabs = [...left, ...right].filter((tab) => tab.kind !== "menu")
  const action = center.kind === "menu" ? center : right.find((tab) => tab.kind === "menu") ?? center
  const ActionIcon = action.icon
  const actionActive = action.kind === "menu" && isMenuOpen

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-4 lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-md items-end gap-2.5">
        <div className="flex h-[4.25rem] min-w-0 flex-1 items-stretch rounded-full border border-white/10 bg-[#0a0a0a]/78 px-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          {pillTabs.map((tab) => (
            <PillTab
              key={tab.name}
              tab={tab}
              active={tab.kind === "menu" ? isMenuOpen : isMobileTabActive(pathname, tab)}
              onMenuOpen={onMenuOpen}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onMenuOpen}
          aria-label={action.name}
          aria-expanded={actionActive}
          className="flex shrink-0 flex-col items-center gap-1"
        >
          <span
            className={cn(
              "flex h-[3.35rem] w-[3.35rem] items-center justify-center rounded-full border shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-colors",
              actionActive
                ? "border-[#c1ff72]/45 bg-[#0a0a0a]/90 text-[#c1ff72]"
                : "border-white/10 bg-[#0a0a0a]/78 text-white",
            )}
          >
            <ActionIcon className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <span
            className={cn(
              "text-[10px] font-medium leading-none",
              actionActive ? "text-[#c1ff72]" : "text-white/55",
            )}
          >
            {action.name}
          </span>
        </button>
      </div>
    </nav>
  )
}
