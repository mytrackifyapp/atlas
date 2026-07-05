"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Products", href: "/ai-agents" },
  { label: "Features", href: "/ai-agents#agents" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/blog" },
] as const

export function AiAgentsMarketingNav({
  isAuthenticated,
  ctaHref,
}: {
  isAuthenticated: boolean
  ctaHref: string
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-white lowercase"
        >
          trackify
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              {item.label}
              {item.label === "Products" || item.label === "Features" || item.label === "Resources" ? (
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              ) : null}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            Book a Demo
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {!isAuthenticated ? (
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-white/90 transition-colors hover:text-white sm:inline"
            >
              Log in
            </Link>
          ) : (
            <Link
              href={ctaHref}
              className="hidden text-sm font-medium text-white/90 transition-colors hover:text-white sm:inline"
            >
              Dashboard
            </Link>
          )}
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-lg bg-[#4483f2] px-5 text-white hover:bg-[#3a75e0] shadow-none border-0",
            )}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
