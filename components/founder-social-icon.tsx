"use client"

import { cn } from "@/lib/utils"
import {
  SOCIAL_PLATFORM_CONFIG,
  type FounderSocialPlatform,
} from "@/lib/founder/social-platforms"

const LETTER_MARKS: Record<string, string> = {
  github: "GH",
  youtube: "YT",
  tiktok: "TT",
}

export function SocialPlatformIcon({
  platform,
  className,
}: {
  platform: FounderSocialPlatform
  className?: string
}) {
  const config = SOCIAL_PLATFORM_CONFIG[platform]

  if (config.customIcon === "x") {
    return (
      <span className={cn("text-[13px] font-bold leading-none", className)} aria-hidden>
        𝕏
      </span>
    )
  }

  if (config.iconSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={config.iconSrc} alt="" className={cn("h-4 w-4 object-contain", className)} />
    )
  }

  const mark = config.customIcon ? LETTER_MARKS[config.customIcon] : null
  if (mark) {
    return (
      <span className={cn("text-[10px] font-bold leading-none", className)} aria-hidden>
        {mark}
      </span>
    )
  }

  const Icon = config.Icon
  if (!Icon) return null
  return <Icon className={className} />
}
