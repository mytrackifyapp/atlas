"use client"

import Image from "next/image"

import { FounderKycDisplay, type FounderKycDisplayData } from "@/components/fundraising/founder-kyc-display"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VerifiedBadge } from "@/components/verified-badge"
import { cn } from "@/lib/utils"

export type FounderProfileData = {
  founderName: string
  founderTitle: string
  founderBio: string
  founderPhoto: string | null
  founderVerified?: boolean
  founderKyc?: FounderKycDisplayData | null
  companyName: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  founder: FounderProfileData
}

const glassPanel = cn(
  "isolate max-w-md gap-0 overflow-hidden rounded-[1.75rem] border p-0",
  "border-white/70 bg-white/92 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)]",
  "backdrop-blur-xl",
  "dark:border-white/15 dark:bg-neutral-900/92 dark:shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)]",
  "before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:z-10 before:h-px",
  "before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent",
  "dark:before:via-white/30",
  "[&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:right-4",
  "[&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:border",
  "[&_[data-slot=dialog-close]]:border-neutral-200/80 [&_[data-slot=dialog-close]]:bg-white/80",
  "[&_[data-slot=dialog-close]]:text-neutral-700 [&_[data-slot=dialog-close]]:opacity-100",
  "[&_[data-slot=dialog-close]]:hover:bg-white",
  "dark:[&_[data-slot=dialog-close]]:border-white/15 dark:[&_[data-slot=dialog-close]]:bg-neutral-800/90",
  "dark:[&_[data-slot=dialog-close]]:text-neutral-200",
)

export function FounderProfileDialog({ open, onOpenChange, founder }: Props) {
  const displayName = founder.founderName.trim() || "Founder"
  const initial = displayName.charAt(0).toUpperCase()
  const kyc = founder.founderVerified ? founder.founderKyc : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/45 dark:bg-black/65"
        className={glassPanel}
      >
        <div className="relative isolate">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-20 h-40 w-40 rounded-full bg-[#c1ff72]/20 blur-3xl dark:bg-[#c1ff72]/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-12 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-500/10"
          />

          <div className="relative z-10 border-b border-neutral-200/60 px-6 py-5 dark:border-white/10">
            <DialogHeader className="space-y-0 text-left">
              <div className="flex items-center gap-4">
                {founder.founderPhoto ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md dark:ring-white/20">
                    <Image
                      src={founder.founderPhoto}
                      alt={displayName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xl font-semibold text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900">
                    {initial}
                  </div>
                )}
                <div className="min-w-0 pr-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-xl text-neutral-950 dark:text-neutral-50">
                      {displayName}
                    </DialogTitle>
                    {founder.founderVerified ? <VerifiedBadge compact iconOnly /> : null}
                  </div>
                  <DialogDescription className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {founder.founderTitle.trim()
                      ? `${founder.founderTitle.trim()} · `
                      : "Founder · "}
                    Raising {founder.companyName.trim() || "this round"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="relative z-10 max-h-[min(60vh,520px)] overflow-y-auto">
            <div className="space-y-6 px-6 py-5">
              <section aria-labelledby="founder-bio-heading">
                <h3
                  id="founder-bio-heading"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500"
                >
                  About
                </h3>
                {founder.founderBio.trim() ? (
                  <div className="mt-3 rounded-2xl border border-neutral-200/60 bg-neutral-50/55 px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-[15px] leading-[1.7] text-pretty whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                      {founder.founderBio}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 rounded-2xl border border-dashed border-neutral-200/70 bg-neutral-50/30 px-4 py-4 text-sm leading-relaxed text-neutral-500 dark:border-white/10 dark:bg-white/[0.02]">
                    The founder hasn&apos;t added a bio yet.
                  </p>
                )}
              </section>

              {kyc ? <FounderKycDisplay kyc={kyc} glass /> : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
