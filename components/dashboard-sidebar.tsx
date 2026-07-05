"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  User,
} from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  adminSidebarItem,
  allAgentsAction,
  getMobileDrawerItems,
  getSidebarConfig,
  isNavActive,
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
  variant?: "default" | "featured" | "agents-hub"
}) {
  const active = isNavActive(pathname, item.href)
  const Icon = item.icon

  if (variant === "featured") {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
          active
            ? "border-black bg-black text-white dark:border-[#333] dark:bg-[#262626] dark:text-white"
            : "border-black/15 bg-neutral-50 text-black hover:bg-neutral-100 dark:border-[#2a2a2a] dark:bg-[#1c1c1c] dark:text-neutral-200 dark:hover:bg-[#222]",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? item.name : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed ? <span>{item.name}</span> : null}
      </Link>
    )
  }

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

  return (
    <Link
      href={item.href}
      className={cn(navLinkClass(active), collapsed && "justify-center px-2")}
      title={collapsed ? item.name : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span>{item.name}</span> : null}
    </Link>
  )
}

function QuickActionGrid({
  items,
  pathname,
}: {
  items: SidebarAction[]
  pathname: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/15 dark:border-[#2a2a2a]">
      <div className="grid grid-cols-2">
        {items.map((item, index) => {
          const active = isNavActive(pathname, item.href)
          const Icon = item.icon
          const isLeft = index % 2 === 0
          const isTop = index < 2

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 text-center text-[11px] font-medium transition-colors",
                "border-black/10 dark:border-[#2a2a2a]",
                isLeft && "border-r",
                isTop && "border-b",
                active
                  ? "bg-black text-white dark:bg-[#262626] dark:text-white"
                  : "bg-neutral-50 text-black/70 hover:bg-neutral-100 dark:bg-[#1a1a1a] dark:text-neutral-400 dark:hover:bg-[#222] dark:hover:text-neutral-200",
              )}
              title={item.name}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
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
  const agentsHub = allAgentsAction(config.agentsHubHref)

  const footerBtn =
    "h-9 w-full justify-start font-medium text-black/70 hover:bg-black/[0.04] hover:text-black dark:text-neutral-400 dark:hover:bg-[#1f1f1f] dark:hover:text-neutral-200"

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex border-b border-black/10 px-2 py-3 dark:border-[#2a2a2a]",
          collapsed ? "flex-col items-center gap-2" : "items-center justify-between px-3 py-4",
        )}
      >
        <Link href="/" className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white dark:bg-white dark:text-black">
            T
          </div>
          {!collapsed ? (
            <span className="truncate text-sm font-semibold text-black dark:text-white">Trackify</span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden rounded-lg p-1.5 text-black/50 transition-colors hover:bg-black/[0.04] hover:text-black dark:text-neutral-500 dark:hover:bg-[#1f1f1f] dark:hover:text-neutral-200 lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Role switcher */}
      {!collapsed ? (
        <div className="border-b border-black/10 px-3 py-3 dark:border-[#2a2a2a]">
          <Select value={userRole} onValueChange={(v: UserRole) => onRoleChange(v)}>
            <SelectTrigger className="h-9 border-black/15 bg-neutral-50 font-medium text-black shadow-none dark:border-[#2a2a2a] dark:bg-[#1c1c1c] dark:text-neutral-200 dark:focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="investor">Investor view</SelectItem>
              <SelectItem value="founder">Founder view</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

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
            <NavRow item={agentsHub} pathname={pathname} collapsed={false} variant="agents-hub" />
          </>
        ) : (
          <>
            <SectionLabel collapsed={collapsed}>Workspace</SectionLabel>
            <div className="space-y-2">
              <NavRow item={config.featured} pathname={pathname} collapsed={collapsed} variant="featured" />
              {!collapsed ? (
                <QuickActionGrid items={config.quickActions} pathname={pathname} />
              ) : (
                <div className="space-y-0.5">
                  {config.quickActions.map((item) => (
                    <NavRow key={item.href} item={item} pathname={pathname} collapsed />
                  ))}
                </div>
              )}
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

            <SectionLabel collapsed={collapsed}>Pinned Tools</SectionLabel>
            <div className="space-y-0.5">
              <NavRow item={agentsHub} pathname={pathname} collapsed={collapsed} variant="agents-hub" />
              {!collapsed
                ? config.pinnedAgents.map((agent) => {
                    const active = isNavActive(pathname, agent.href)
                    return (
                      <Link
                        key={agent.id}
                        href={agent.href}
                        className={cn(navLinkClass(active), "rounded-lg px-3 py-2")}
                      >
                        {agent.imageSrc ? (
                          <img
                            src={agent.imageSrc}
                            alt=""
                            className="h-7 w-7 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-7 w-7 shrink-0 rounded-md bg-neutral-200 dark:bg-[#262626]" />
                        )}
                        <span>{agent.name}</span>
                      </Link>
                    )
                  })
                : null}
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
                {collapsed ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {session.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    <span className="ml-2.5 truncate">{session.user.name || session.user.email}</span>
                  </>
                )}
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
