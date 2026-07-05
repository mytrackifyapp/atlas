"use client"

import Link from "next/link"
import { ChevronDown, Menu, TrendingUp, User } from "lucide-react"
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
}: {
  label: string
  items: MarketingMenuLink[]
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
        className="inline-flex items-center gap-1 text-sm font-medium text-white/75 outline-none transition-colors hover:text-white data-[state=open]:text-white"
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={10}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        className="min-w-[200px] rounded-xl border-white/10 bg-neutral-950/95 p-1.5 text-white backdrop-blur-xl"
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuItem
              key={item.href + item.label}
              asChild
              className="gap-2.5 rounded-lg px-2.5 py-2 focus:bg-white/10 focus:text-white"
            >
              <Link href={item.href} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 text-[#c1ff72]" strokeWidth={2} />
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
}: {
  primaryHref?: string
  primaryLabel?: string
  className?: string
  shellClassName?: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkBeforeSolutions = MARKETING_NAV_LINKS.slice(0, 2)
  const linkAfterSolutions = MARKETING_NAV_LINKS.slice(2)

  return (
    <header className={cn("relative z-20 px-4 pt-5 sm:px-6 lg:px-8", className)}>
      <div className={cn("mx-auto max-w-6xl", shellClassName)}>
        <div
          className={cn(
            "relative flex items-center justify-between gap-3 rounded-full border border-white/15",
            "bg-black/50 px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:px-4 sm:py-3",
          )}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2.5 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c1ff72]">
              <TrendingUp className="h-4 w-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
              Trackify Finance
            </span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 lg:flex xl:gap-7">
            {linkBeforeSolutions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/75 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <NavDropdown label="Solutions" items={MARKETING_SOLUTIONS_LINKS} />

            {linkAfterSolutions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/75 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <NavDropdown label="Resources" items={MARKETING_RESOURCES_LINKS} />
          </nav>

          <div className="flex items-center gap-2 pr-0.5">
            <Link
              href={primaryHref}
              className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 sm:inline-flex"
            >
              <User className="h-4 w-4" />
              {primaryLabel}
            </Link>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/10 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[min(100vw,320px)] border-white/10 bg-neutral-950/95 text-white backdrop-blur-xl"
              >
                <div className="mt-8 flex flex-col gap-1">
                  {linkBeforeSolutions.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-3 text-base font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <p className="mt-2 px-3 text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                    Solutions
                  </p>
                  {MARKETING_SOLUTIONS_LINKS.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 pl-5 text-base font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[#c1ff72]" strokeWidth={2} />
                        {item.label}
                      </Link>
                    )
                  })}

                  {linkAfterSolutions.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-3 text-base font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <p className="mt-4 px-3 text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                    Resources
                  </p>
                  {MARKETING_RESOURCES_LINKS.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 pl-5 text-base font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[#c1ff72]" strokeWidth={2} />
                        {item.label}
                      </Link>
                    )
                  })}

                  <Link
                    href={primaryHref}
                    onClick={() => setMenuOpen(false)}
                    className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-white"
                  >
                    <User className="h-4 w-4" />
                    {primaryLabel}
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
