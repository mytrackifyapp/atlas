"use client"

import Link from "next/link"
import { ChevronDown, Menu, User } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  MARKETING_NAV_LINKS,
  MARKETING_RESOURCES_LINKS,
  MARKETING_SOLUTIONS_LINKS,
  type MarketingMenuLink,
} from "@/lib/marketing-nav"
import { cn } from "@/lib/utils"

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
  className,
  shellClassName,
  variant = "glass",
}: {
  primaryHref?: string
  primaryLabel?: string
  className?: string
  shellClassName?: string
  variant?: "glass" | "light"
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const light = variant === "light"
  const loggedOut = primaryHref === "/sign-up"

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
                    href="/sign-in"
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

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
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
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={cn(
                  "w-[min(100vw,320px)] backdrop-blur-xl",
                  light
                    ? "border-neutral-200 bg-white text-neutral-950"
                    : "border-white/10 bg-neutral-950/95 text-white",
                )}
              >
                <div className="mt-8 flex flex-col gap-1">
                  <p
                    className={cn(
                      "px-3 text-xs font-medium uppercase tracking-[0.12em]",
                      light ? "text-neutral-400" : "text-white/45",
                    )}
                  >
                    Solutions
                  </p>
                  {MARKETING_SOLUTIONS_LINKS.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 pl-5 text-base font-medium transition-colors",
                          light
                            ? "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon
                          className={cn("h-4 w-4 shrink-0", light ? "text-neutral-500" : "text-[#c1ff72]")}
                          strokeWidth={2}
                        />
                        {item.label}
                      </Link>
                    )
                  })}

                  {MARKETING_NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                        light
                          ? "text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950"
                          : "text-white/85 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <p
                    className={cn(
                      "mt-4 px-3 text-xs font-medium uppercase tracking-[0.12em]",
                      light ? "text-neutral-400" : "text-white/45",
                    )}
                  >
                    Resources
                  </p>
                  {MARKETING_RESOURCES_LINKS.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 pl-5 text-base font-medium transition-colors",
                          light
                            ? "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon
                          className={cn("h-4 w-4 shrink-0", light ? "text-neutral-500" : "text-[#c1ff72]")}
                          strokeWidth={2}
                        />
                        {item.label}
                      </Link>
                    )
                  })}

                  {light && loggedOut ? (
                    <Link
                      href="/sign-in"
                      onClick={() => setMenuOpen(false)}
                      className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-5 text-sm font-medium text-neutral-900"
                    >
                      Log in
                    </Link>
                  ) : null}

                  <Link
                    href={primaryHref}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium",
                      light
                        ? "mt-2 bg-neutral-950 text-white"
                        : "mt-4 border border-white/20 text-white",
                    )}
                  >
                    {light ? (loggedOut ? "Sign up for free" : primaryLabel) : (
                      <>
                        <User className="h-4 w-4" />
                        {primaryLabel}
                      </>
                    )}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
