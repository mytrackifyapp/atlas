"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
} from "lucide-react"

import { FinnaOrb } from "@/components/finna-orb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  adminSidebarItem,
  finnaSidebarAction,
  getMobileDrawerItems,
  getSidebarConfig,
  isNavActive,
  skillsSidebarAction,
  type SidebarAction,
} from "@/lib/dashboard-sidebar-config"
import { getSettingsHref } from "@/lib/role-config"
import type { UserRole } from "@/lib/role-config"
import { cn } from "@/lib/utils"

function navLinkClass(active: boolean) {
  return cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-black text-white dark:bg-[#262626] dark:text-white"
      : "text-black/70 hover:bg-black/[0.04] hover:text-black dark:text-neutral-400 dark:hover:bg-[#1f1f1f] dark:hover:text-neutral-200",
  )
}

function SectionLabel({ children, collapsed }: { children: string; collapsed?: boolean }) {
  if (collapsed) return <div className="my-2 h-px bg-black/10 dark:bg-[#2a2a2a]" />
  return (
    <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45 dark:text-neutral-500">
      {children}
    </p>
  )
}

function NavRow({
  item,
  pathname,
  collapsed,
  variant = "default",
}: {
  item: SidebarAction
  pathname: string
  collapsed?: boolean
  variant?: "default" | "agents-hub"
}) {
  const active = isNavActive(pathname, item.href)
  const Icon = item.icon

  if (variant === "agents-hub") {
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-black text-white dark:bg-[#262626] dark:text-white"
            : "text-black/70 hover:bg-black/[0.04] hover:text-black dark:text-neutral-300 dark:hover:bg-[#1f1f1f] dark:hover:text-white",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? item.name : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed ? (
          <>
            <span className="flex-1">{item.name}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70" />
          </>
        ) : null}
      </Link>
    )
  }

  const parentActive = active || (item.children?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`)) ?? false)

  return (
    <div className="space-y-0.5">
      <Link
        href={item.href}
        className={cn(navLinkClass(parentActive), collapsed && "justify-center px-2")}
        title={collapsed ? item.name : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed ? <span>{item.name}</span> : null}
      </Link>
      {!collapsed && item.children?.length ? (
        <div className="space-y-0.5 pl-4">
          {item.children.map((child) => {
            const childActive = pathname === child.href
            const ChildIcon = child.icon
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(navLinkClass(childActive), "py-1.5 text-[13px]")}
              >
                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{child.name}</span>
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function FinnaNavRow({
  item,
  pathname,
  collapsed,
}: {
  item: SidebarAction
  pathname: string
  collapsed?: boolean
}) {
  const active = isNavActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-black text-white dark:bg-[#262626] dark:text-white"
          : "text-black/70 hover:bg-black/[0.04] hover:text-black dark:text-neutral-300 dark:hover:bg-[#1f1f1f] dark:hover:text-white",
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? item.name : undefined}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <FinnaOrb size={20} />
      </span>
      {!collapsed ? (
        <>
          <span className="flex-1">{item.name}</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70" />
        </>
      ) : null}
    </Link>
  )
}

function getDisplayName(session: {
  user?: { name?: string | null; email?: string | null }
} | null) {
  const name = session?.user?.name?.trim()
  if (name) return name
  const email = session?.user?.email?.trim()
  if (email) return email.split("@")[0] ?? email
  return "Account"
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
  }
  return name.slice(0, 1).toUpperCase() || "T"
}

function WorkspaceIdentity({
  userRole,
  onRoleChange,
  collapsed,
  session,
}: {
  userRole: UserRole
  onRoleChange: (role: UserRole) => void
  collapsed: boolean
  session: { user?: { name?: string | null; email?: string | null; image?: string | null } } | null
}) {
  const name = getDisplayName(session)
  const initials = getInitials(name)
  const roleLabel = userRole === "investor" ? "Investor" : "Founder"

  const tile = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-[#262626] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      {session?.user?.image ? (
        <Avatar className="h-8 w-8 rounded-[10px]">
          <AvatarImage src={session.user.image} alt="" />
          <AvatarFallback className="rounded-[10px] bg-transparent text-[12px] font-semibold text-neutral-800 dark:text-neutral-100">
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="text-[12px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
          {initials}
        </span>
      )}
    </span>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center text-left transition-colors",
            collapsed
              ? "h-10 w-10 justify-center rounded-xl hover:bg-black/[0.04] dark:hover:bg-[#1f1f1f]"
              : "w-full gap-2.5 rounded-xl border border-black/[0.06] bg-[#f6f6f7] px-2 py-1.5 hover:bg-[#efeff1] dark:border-white/[0.06] dark:bg-[#1c1c1c] dark:hover:bg-[#222]",
          )}
          aria-label={`${roleLabel} workspace, ${name}`}
        >
          {tile}
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
                  {roleLabel}
                </span>
                <span className="block truncate text-sm font-medium leading-tight text-neutral-900 dark:text-white">
                  {name}
                </span>
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch view</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onRoleChange("founder")}>
          <span className="flex-1">Founder</span>
          {userRole === "founder" ? <Check className="h-4 w-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRoleChange("investor")}>
          <span className="flex-1">Investor</span>
          {userRole === "investor" ? <Check className="h-4 w-4" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DashboardSidebar({
  userRole,
  onRoleChange,
  collapsed,
  onToggleCollapsed,
  isAdmin,
  theme,
  onToggleTheme,
  session,
  onSignOut,
  mobileDrawer = false,
}: {
  userRole: UserRole
  onRoleChange: (role: UserRole) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  isAdmin: boolean
  theme: "light" | "dark"
  onToggleTheme: () => void
  session: { user?: { name?: string | null; email?: string | null; image?: string | null } } | null
  onSignOut: () => void
  mobileDrawer?: boolean
}) {
  const pathname = usePathname()
  const config = getSidebarConfig(userRole)
  const drawerItems = mobileDrawer ? getMobileDrawerItems(userRole) : null
  const finna = finnaSidebarAction(config.finnaHref)
  const skills = skillsSidebarAction("/finna#skills")

  const footerBtn =
    "h-9 w-full justify-start font-medium text-black/70 hover:bg-black/[0.04] hover:text-black dark:text-neutral-400 dark:hover:bg-[#1f1f1f] dark:hover:text-neutral-200"

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex border-b border-black/10 dark:border-[#2a2a2a]",
          collapsed ? "flex-col items-center gap-2 px-2 py-3" : "items-center gap-1.5 px-3 py-3",
        )}
      >
        <div className={cn("min-w-0", !collapsed && "flex-1")}>
          <WorkspaceIdentity
            userRole={userRole}
            onRoleChange={onRoleChange}
            collapsed={collapsed}
            session={session}
          />
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden shrink-0 rounded-lg p-1.5 text-black/50 transition-colors hover:bg-black/[0.04] hover:text-black dark:text-neutral-500 dark:hover:bg-[#1f1f1f] dark:hover:text-neutral-200 lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {!mobileDrawer ? (
          <NavRow item={config.home} pathname={pathname} collapsed={collapsed} />
        ) : null}

        {mobileDrawer ? (
          <>
            {drawerItems!.quickActions.length > 0 ? (
              <>
                <SectionLabel collapsed={false}>Quick access</SectionLabel>
                <div className="space-y-0.5">
                  {drawerItems!.quickActions.map((item) => (
                    <NavRow key={item.href} item={item} pathname={pathname} collapsed={false} />
                  ))}
                </div>
              </>
            ) : null}

            {drawerItems!.manage.length > 0 ? (
              <>
                <SectionLabel collapsed={false}>Manage</SectionLabel>
                <div className="space-y-0.5">
                  {drawerItems!.manage.map((item) => (
                    <NavRow key={item.href} item={item} pathname={pathname} collapsed={false} />
                  ))}
                </div>
              </>
            ) : null}

            {drawerItems!.resources.length > 0 ? (
              <>
                <SectionLabel collapsed={false}>Resources</SectionLabel>
                <div className="space-y-0.5">
                  {drawerItems!.resources.map((item) => (
                    <NavRow key={item.href} item={item} pathname={pathname} collapsed={false} />
                  ))}
                </div>
              </>
            ) : null}

            <SectionLabel collapsed={false}>AI</SectionLabel>
            <FinnaNavRow item={finna} pathname={pathname} collapsed={false} />
            <NavRow item={skills} pathname={pathname} collapsed={false} />
          </>
        ) : (
          <>
            <SectionLabel collapsed={collapsed}>Workspace</SectionLabel>
            <div className="space-y-0.5">
              <NavRow item={config.featured} pathname={pathname} collapsed={collapsed} />
              {config.quickActions.map((item) => (
                <NavRow key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
              ))}
            </div>

            {config.manage.length > 0 ? (
              <>
                <SectionLabel collapsed={collapsed}>Manage</SectionLabel>
                <div className="space-y-0.5">
                  {config.manage.map((item) => (
                    <NavRow key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
                  ))}
                </div>
              </>
            ) : null}

            {config.resources.length > 0 ? (
              <>
                <SectionLabel collapsed={collapsed}>Resources</SectionLabel>
                <div className="space-y-0.5">
                  {config.resources.map((item) => (
                    <NavRow key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
                  ))}
                </div>
              </>
            ) : null}

            <SectionLabel collapsed={collapsed}>AI</SectionLabel>
            <div className="space-y-0.5">
              <FinnaNavRow item={finna} pathname={pathname} collapsed={collapsed} />
              <NavRow item={skills} pathname={pathname} collapsed={collapsed} />
            </div>
          </>
        )}

        {isAdmin ? (
          <>
            <SectionLabel collapsed={mobileDrawer ? false : collapsed}>Admin</SectionLabel>
            <NavRow
              item={adminSidebarItem}
              pathname={pathname}
              collapsed={mobileDrawer ? false : collapsed}
            />
          </>
        ) : null}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-black/10 p-2 dark:border-[#2a2a2a]">
        <Button
          variant="ghost"
          className={cn(footerBtn, collapsed ? "justify-center px-0" : "")}
          onClick={onToggleTheme}
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {!collapsed ? (
            <span className="ml-2.5">{theme === "light" ? "Dark mode" : "Light mode"}</span>
          ) : null}
        </Button>
        <Button
          variant="ghost"
          className={cn(footerBtn, collapsed ? "justify-center px-0" : "")}
          asChild
        >
          <Link href={getSettingsHref(userRole)}>
            <Settings className="h-4 w-4" />
            {!collapsed ? <span className="ml-2.5">Settings</span> : null}
          </Link>
        </Button>
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(footerBtn, collapsed ? "justify-center px-0" : "")}>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {session.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {!collapsed ? (
                  <span className="ml-2.5 truncate">{session.user.name || session.user.email}</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  )
}
