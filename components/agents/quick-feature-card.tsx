"use client"

import Image from "next/image"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const QUICK_FEATURE_GLOWS = [
  "from-violet-500/35 via-fuchsia-500/15 to-transparent",
  "from-emerald-500/35 via-green-500/15 to-transparent",
  "from-sky-500/35 via-blue-500/15 to-transparent",
  "from-rose-500/35 via-pink-500/15 to-transparent",
  "from-amber-500/35 via-orange-500/15 to-transparent",
  "from-cyan-500/35 via-teal-500/15 to-transparent",
] as const

export function QuickFeatureCard({
  title,
  features,
  glow,
  superpowers,
  onClick,
  iconSrc,
  icon: Icon,
  className,
}: {
  title: string
  features: readonly string[]
  glow: string
  superpowers?: string
  onClick: () => void
  iconSrc?: string
  icon?: LucideIcon
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-full min-h-[9.5rem] w-full flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white px-3.5 py-3.5 text-left transition-colors hover:border-neutral-300 dark:border-neutral-800/90 dark:bg-[#171717] dark:hover:border-neutral-700",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl",
          glow,
        )}
      />
      <div className="relative flex h-full flex-col">
        {iconSrc ? (
          <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md">
            <Image src={iconSrc} alt="" fill className="object-cover object-top" sizes="20px" />
          </div>
        ) : Icon ? (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-neutral-200/80 bg-white/80 dark:border-neutral-700/80 dark:bg-neutral-800/80">
            <Icon className="h-3 w-3 text-neutral-600 dark:text-neutral-300" strokeWidth={2} />
          </div>
        ) : null}
        <span className="mt-3 text-sm font-semibold text-neutral-950 dark:text-white">{title}</span>
        <ul className="mt-2 space-y-1">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-1.5 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {superpowers ? (
          <span className="mt-auto pt-3 text-[10px] text-neutral-400 dark:text-neutral-500">
            {superpowers}
          </span>
        ) : null}
      </div>
    </button>
  )
}
