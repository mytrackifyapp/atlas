"use client"

import Image from "next/image"

import { Button } from "@/components/ui/button"

const PLATFORMS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Publish posts and branded graphics",
    iconSrc: "/icons/linkedin.svg",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Feed and story graphics",
    iconSrc: "/icons/instagram.png",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Page posts and campaigns",
    iconSrc: "/icons/facebook.png",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form video planning",
    iconSrc: "/icons/tik-tok.png",
  },
] as const

export function SocialPlatformsPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative mb-4 flex min-h-[4.25rem] items-center overflow-hidden rounded-xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white px-4 py-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-[#171717]">
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#c1ff72]/20 blur-2xl" />
        <div className="relative min-w-0">
          <p className="text-sm font-semibold leading-snug text-neutral-950 dark:text-white">
            Social platforms
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
            Connect accounts so drafts can publish in the right place.
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium text-neutral-600 dark:text-neutral-400">
          Publishing connections coming soon
        </span>
        <span className="tabular-nums text-neutral-500">0/{PLATFORMS.length} live</span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="rounded-xl border border-neutral-200/80 bg-white px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900/60"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950">
                <Image
                  src={platform.iconSrc}
                  alt=""
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {platform.name}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">
                  {platform.description}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 h-8 w-full rounded-lg text-xs"
              disabled
            >
              Coming soon
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
