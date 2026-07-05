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

export function AiAgentMarketingNav({
  ctaHref,
  ctaLabel = "Get Started",
}: {
  ctaHref: string
  ctaLabel?: string
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-neutral-950 lowercase">
          trackify
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950"
            >
              {item.label}
              {item.label === "Products" || item.label === "Features" || item.label === "Resources" ? (
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              ) : null}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950"
          >
            Book a Demo
          </Link>
        </nav>

        <Link
          href={ctaHref}
          className={cn(
            buttonVariants({ size: "sm" }),
            "rounded-lg bg-[#4483f2] px-5 text-white hover:bg-[#3a75e0] shadow-none border-0",
          )}
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  )
}
