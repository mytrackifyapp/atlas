"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Coins, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

type CreditSnapshot = {
  planId: string
  planLabel: string
  balance: number
  monthlyAllowance: number
  periodEnd: string
  percentUsed: number
}

type Props = {
  className?: string
  compact?: boolean
}

export function AiCreditsBadge({ className, compact = false }: Props) {
  const [credits, setCredits] = useState<CreditSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/credits", { cache: "no-store" })
      if (!res.ok) return
      const data = (await res.json()) as { credits: CreditSnapshot }
      setCredits(data.credits)
    } catch {
      // ignore — badge is non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const interval = setInterval(() => void load(), 60_000)
    return () => clearInterval(interval)
  }, [load])

  if (loading) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-400 dark:border-neutral-800",
          className,
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        {!compact ? "Credits" : null}
      </span>
    )
  }

  if (!credits) return null

  const low = credits.balance <= Math.max(5, Math.ceil(credits.monthlyAllowance * 0.1))
  const empty = credits.balance <= 0

  return (
    <Link
      href="/checkout?mode=credits&pack=pack_500"
      title={`${credits.balance} of ${credits.monthlyAllowance} AI credits remaining this month (${credits.planLabel} plan)`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        empty
          ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          : low
            ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900",
        className,
      )}
    >
      <Coins className="h-3.5 w-3.5 shrink-0" />
      <span className="tabular-nums">
        {credits.balance}
        {!compact ? ` / ${credits.monthlyAllowance}` : null}
      </span>
      {!compact ? <span className="text-neutral-400">credits</span> : null}
    </Link>
  )
}
