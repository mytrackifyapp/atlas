"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2, Moon, Settings, Sun, Menu, X, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AIAssistant } from "@/components/ai-assistant"
import { getRoleConfig, getRoleFromPath, sharedNavigation, type UserRole } from "@/lib/role-config"
import { authClient } from "@/lib/auth-client"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  
  // Get role from session or fallback to pathname-based detection
  const sessionRole = (session?.user as any)?.role as UserRole | undefined
  const pathRole = getRoleFromPath(pathname)
  const [userRole, setUserRole] = useState<UserRole>(sessionRole || pathRole)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const roleConfig = getRoleConfig(userRole)

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
  }

  useEffect(() => {
    // Use session role if available, otherwise use path-based role
    const detectedRole = sessionRole || getRoleFromPath(pathname)
    if (detectedRole !== userRole) {
      setUserRole(detectedRole)
    }
  }, [pathname, userRole, sessionRole])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Trackify</h1>
            <p className="text-xs text-muted-foreground">Atlas</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-sidebar-border">
        <Select
          value={userRole}
          onValueChange={(value: UserRole) => {
            setUserRole(value)
            const config = getRoleConfig(value)
            window.location.href = config.defaultRoute
          }}
        >
          <SelectTrigger className="bg-sidebar-accent h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="investor">🎯 Investor View</SelectItem>
            <SelectItem value="founder">🚀 Founder View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {roleConfig.navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "")} />
              <span>{item.name}</span>
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-sidebar-border">
          {sharedNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "")} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground h-10" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="h-4 w-4 mr-3" /> : <Sun className="h-4 w-4 mr-3" />}
          {theme === "light" ? "Dark" : "Light"} Mode
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground h-10">
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </Button>
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground h-10">
                <User className="h-4 w-4 mr-3" />
                <span className="truncate">{session.user.name || session.user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden lg:flex w-64 border-r border-border bg-sidebar flex-col">{sidebarContent}</aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 w-72 border-r border-border bg-sidebar flex flex-col animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-base font-bold">Trackify</h1>
                  <p className="text-xs text-muted-foreground -mt-0.5">Atlas</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session?.user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || ""} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {children}
      </main>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  )
}
