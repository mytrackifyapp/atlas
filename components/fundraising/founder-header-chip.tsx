"use client"

import { useState } from "react"
import Image from "next/image"

import { FounderProfileDialog, type FounderProfileData } from "@/components/fundraising/founder-profile-dialog"
import { VerifiedBadge } from "@/components/verified-badge"
import { cn } from "@/lib/utils"

type Props = {
  founder: FounderProfileData
  compact?: boolean
  className?: string
}

export function FounderHeaderChip({ founder, compact = false, className }: Props) {
  const [open, setOpen] = useState(false)
  const displayName = founder.founderName.trim() || founder.companyName.trim() || "Founder"
  const initial = displayName.charAt(0).toUpperCase()
  const hasDetails =
    Boolean(founder.founderPhoto) ||
    Boolean(founder.founderName.trim()) ||
    Boolean(founder.founderBio.trim()) ||
    Boolean(founder.companyName.trim())

  if (!hasDetails) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex min-w-0 max-w-full cursor-pointer items-center rounded-full text-left transition-colors",
          "hover:bg-neutral-900/[0.04] active:bg-neutral-900/[0.07]",
          "dark:hover:bg-white/[0.06] dark:active:bg-white/[0.09]",
          compact ? "gap-2 py-1 pl-1.5 pr-2.5 sm:gap-2.5 sm:pr-3" : "gap-3 py-1.5 pl-2 pr-3",
          className,
        )}
      >
        {founder.founderPhoto ? (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200/80 dark:ring-neutral-700",
              compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-11 w-11",
            )}
          >
            <Image
              src={founder.founderPhoto}
              alt={displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full font-semibold",
              "bg-neutral-900 text-white ring-1 ring-neutral-200/80",
              "dark:bg-neutral-100 dark:text-neutral-900 dark:ring-neutral-700",
              compact ? "h-9 w-9 text-sm sm:h-10 sm:w-10" : "h-11 w-11 text-sm",
            )}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <p className="truncate text-sm font-semibold text-neutral-950 dark:text-neutral-50 sm:text-[15px]">
              {displayName}
            </p>
            {founder.founderVerified ? <VerifiedBadge compact iconOnly /> : null}
          </div>
          <p className="truncate text-xs text-neutral-500 sm:text-sm">Founder</p>
        </div>
      </button>

      <FounderProfileDialog open={open} onOpenChange={setOpen} founder={founder} />
    </>
  )
}
