"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function FinanceSubnav() {
  const pathname = usePathname()
  const base = pathname.startsWith("/dashboard/finance") ? "/dashboard/finance" : "/founder/finance"
  const items = [
    { label: "Overview", href: base },
    { label: "US bank account", href: `${base}/us-account` },
  ]

  return (
    <nav className="flex w-fit items-center gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-black/[0.04] dark:bg-[#171717] dark:ring-white/10">
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
