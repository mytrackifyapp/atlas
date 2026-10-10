"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { DashboardMobileNav } from "@/components/dashboard-mobile-nav"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardSidebarShell } from "@/components/dashboard-sidebar-shell"
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
import { authClient } from "@/lib/auth-client"
import { getRoleConfig, getRoleFromPath, getSettingsHref, type UserRole } from "@/lib/role-config"
import { cn } from "@/lib/utils"
import { LogOut, Moon, Settings, Sun } from "lucide-react"

export function DashboardShell({
  children,
  viewerRole,
}: {
  children: React.ReactNode
  viewerRole?: UserRole
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const pathRole = getRoleFromPath(pathname)
  const [userRole, setUserRole] = useState<UserRole>(viewerRole ?? pathRole)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
  }

  const handleRoleChange = (value: UserRole) => {
    const config = getRoleConfig(value)
    setUserRole(value)
    router.push(config.defaultRoute)
  }

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  useEffect(() => {
    if (pathname.startsWith("/finna")) {
      const stored = window.sessionStorage.getItem("trackify-view-role")
      const nextRole =
        stored === "founder" || stored === "investor"
          ? stored
          : viewerRole ?? null
      if (nextRole && nextRole !== userRole) {
        setUserRole(nextRole)
      }
      if (nextRole) {
        window.sessionStorage.setItem("trackify-view-role", nextRole)
      }
      return
    }
    const detectedRole = getRoleFromPath(pathname)
    if (detectedRole !== userRole) {
      setUserRole(detectedRole)
    }
    window.sessionStorage.setItem("trackify-view-role", detectedRole)
  }, [pathname, userRole, viewerRole])

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/check")
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      } catch {
        setIsAdmin(false)
      }
    }

    if (session?.user) {
      checkAdminStatus()
    }
  }, [session])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  const sidebarProps = {
    userRole,
    onRoleChange: handleRoleChange,
    collapsed: sidebarCollapsed,
    onToggleCollapsed: () => setSidebarCollapsed((c) => !c),
    isAdmin,
    theme,
    onToggleTheme: toggleTheme,
    session,
    onSignOut: handleSignOut,
  }

  return (
    <div className="flex h-[100dvh] bg-[#f4f4f5] dark:bg-neutral-950">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 p-2 transition-[width] duration-200 lg:block",
          sidebarCollapsed ? "w-[76px]" : "w-[272px]",
        )}
      >
        <DashboardSidebarShell>
          <DashboardSidebar {...sidebarProps} />
        </DashboardSidebarShell>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 border-b border-black/10 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-[#2a2a2a] dark:bg-neutral-950/95 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="truncate text-base font-semibold tracking-tight text-black dark:text-white">
              Trackify Finances
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || undefined} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
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
                    <DropdownMenuItem asChild>
                      <Link href={getSettingsHref(userRole)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>
        </div>

        <div className="px-3 py-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-6 lg:pb-6">
          {children}
        </div>
      </main>

      <DashboardMobileNav userRole={userRole} isAdmin={isAdmin} onSignOut={handleSignOut} />
    </div>
  )
}
