"use client"

import Link from "next/link"
import { BadgeDollarSign, ChevronDown, Info, Menu, Sparkles, User } from "lucide-react"
import { useRef, useState } from "react"

import { CircularNavOverlay, type CircularNavItem, type CircularNavMoreItem } from "@/components/circular-nav"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MARKETING_NAV_LINKS,
  MARKETING_RESOURCES_LINKS,
  MARKETING_SOLUTIONS_LINKS,
  type MarketingMenuLink,
} from "@/lib/marketing-nav"
import { cn } from "@/lib/utils"

const MARKETING_MORE: CircularNavMoreItem[] = [
  ...MARKETING_SOLUTIONS_LINKS.filter(
    (item) => item.href !== "/solutions/founders" && item.href !== "/solutions/investors",
  ),
  ...MARKETING_RESOURCES_LINKS.filter((item) => item.href !== "/about"),
]

const MARKETING_WHEEL: CircularNavItem[] = [
  { label: "Finna", href: "/ai-agents", icon: Sparkles },
  { label: "Pricing", href: "/pricing", icon: BadgeDollarSign },
  { label: "Founders", href: "/solutions/founders", icon: MARKETING_SOLUTIONS_LINKS[1].icon },
  { label: "Investors", href: "/solutions/investors", icon: MARKETING_SOLUTIONS_LINKS[0].icon },
  { label: "About", href: "/about", icon: Info },
]

function NavDropdown({
  label,
  items,
  light,
}: {
  label: string
  items: MarketingMenuLink[]
  light?: boolean
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openMenu = () => {
    clearCloseTimer()
    setOpen(true)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium outline-none transition-colors",
          light
            ? "text-neutral-900 hover:text-neutral-500 data-[state=open]:text-neutral-500"
            : "text-white/75 hover:text-white data-[state=open]:text-white",
        )}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={10}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        className={cn(
          "min-w-[200px] rounded-xl p-1.5 backdrop-blur-xl",
          light
            ? "border-neutral-200 bg-white text-neutral-900 shadow-lg"
            : "border-white/10 bg-neutral-950/95 text-white",
        )}
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuItem
              key={item.href + item.label}
              asChild
              className={cn(
                "gap-2.5 rounded-lg px-2.5 py-2",
                light ? "focus:bg-neutral-100 focus:text-neutral-900" : "focus:bg-white/10 focus:text-white",
              )}
            >
              <Link href={item.href} className="flex items-center gap-2.5">
                <Icon
                  className={cn("h-4 w-4 shrink-0", light ? "text-neutral-500" : "text-[#c1ff72]")}
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MarketingGlassNavbar({
  primaryHref = "/sign-up",
  primaryLabel = "Sign up",
  loginHref = "/sign-in",
  className,
  shellClassName,
  variant = "glass",
}: {
  primaryHref?: string
  primaryLabel?: string
  loginHref?: string
  className?: string
  shellClassName?: string
  variant?: "glass" | "light"
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const light = variant === "light"
  const loggedOut = primaryHref === "/sign-up" || primaryHref.startsWith("/sign-up?")

  const navLinkClass = light
    ? "text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-500"
    : "text-sm font-medium text-white/75 transition-colors hover:text-white"

  return (
    <header className={cn("relative z-20 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5 lg:px-8", className)}>
      <div className={cn("mx-auto w-full max-w-6xl lg:w-fit", shellClassName)}>
        <div
          className={cn(
            "relative flex items-center justify-between gap-3 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 lg:gap-8",
            light
              ? "border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              : "border border-white/15 bg-black/50 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:py-3",
          )}
        >
          <div className="flex min-w-0 items-center gap-6 xl:gap-8">
            <Link href="/" className="flex shrink-0 items-center gap-2.5 pl-1">
              <img
                src="/trackify-logo.png"
                alt="Trackify"
                className="h-8 w-8 rounded-full object-cover"
              />
              <span
                className={cn(
                  "truncate text-sm font-semibold tracking-tight sm:text-base",
                  light ? "text-neutral-950" : "text-white",
                )}
              >
                Trackify<span className="hidden min-[380px]:inline"> Finance</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
              <NavDropdown label="Solutions" items={MARKETING_SOLUTIONS_LINKS} light={light} />

              {MARKETING_NAV_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className={navLinkClass}>
                  {item.label}
                </Link>
              ))}

              <NavDropdown label="Resources" items={MARKETING_RESOURCES_LINKS} light={light} />
            </nav>
          </div>

          <div className="flex items-center gap-2 pr-0.5 sm:gap-3">
            {light ? (
              <>
                {loggedOut ? (
                  <Link
                    href={loginHref}
                    className="hidden text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-500 sm:inline-flex"
                  >
                    Log in
                  </Link>
                ) : null}
                <Link
                  href={primaryHref}
                  className="hidden h-10 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 sm:inline-flex"
                >
                  {loggedOut ? "Sign up for free" : primaryLabel}
                </Link>
              </>
            ) : (
              <Link
                href={primaryHref}
                className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 sm:inline-flex"
              >
                <User className="h-4 w-4" />
                {primaryLabel}
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 lg:hidden",
                light
                  ? "text-neutral-900 hover:bg-neutral-100"
                  : "text-white hover:bg-white/10",
              )}
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <CircularNavOverlay
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              items={MARKETING_WHEEL}
              moreItems={MARKETING_MORE}
              headerEnd={
                <>
                  {loggedOut ? (
                    <Link href={loginHref} onClick={() => setMenuOpen(false)} className="font-mono text-[11px] uppercase tracking-wide text-neutral-950">
                      Log in
                    </Link>
                  ) : null}
                  <Link href={primaryHref} onClick={() => setMenuOpen(false)} className="font-mono text-[11px] uppercase tracking-wide text-neutral-950">
                    {loggedOut ? "Sign up" : primaryLabel}
                  </Link>
                </>
              }
            />
          </div>
        </div>
      </div>
    </header>
  )
}
