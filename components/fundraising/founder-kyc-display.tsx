"use client"

import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  User,
  Youtube,
  type LucideIcon,
} from "lucide-react"

import {
  SOCIAL_PLATFORM_CONFIG,
  buildSocialUrl,
  formatSocialLink,
  type FounderSocialLink,
  type FounderSocialPlatform,
} from "@/lib/founder/social-platforms"
import { cn } from "@/lib/utils"

export type FounderKycDisplayData = {
  fullName: string
  location: string
  phoneNumber: string
  socialLinks: FounderSocialLink[]
}

function SocialPlatformIcon({
  platform,
  className,
}: {
  platform: FounderSocialPlatform
  className?: string
}) {
  const config = SOCIAL_PLATFORM_CONFIG[platform]
  const Icon = config.Icon

  if (config.customIcon === "x") {
    return <span className={cn("text-[12px] font-bold leading-none", className)}>𝕏</span>
  }
  if (config.customIcon === "tiktok") {
    return <span className={cn("text-[10px] font-bold leading-none", className)}>TT</span>
  }
  if (!Icon) return null
  return <Icon className={className} />
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
  glass,
}: {
  icon: LucideIcon
  label: string
  value: string
  href?: string
  glass?: boolean
}) {
  if (!value.trim()) return null

  const content = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</p>
    </>
  )

  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300",
          glass
            ? "border border-white/45 bg-white/35 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5"
            : "bg-neutral-100 dark:bg-neutral-800",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-opacity hover:opacity-80"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  )
}

export function FounderKycDisplay({ kyc, glass }: { kyc: FounderKycDisplayData; glass?: boolean }) {
  return (
    <div
      className={cn(
        "space-y-4",
        !glass && "border-t border-neutral-200 pt-6 dark:border-neutral-800",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        Verified details
      </p>
      <div className="space-y-3.5">
        <DetailRow glass={glass} icon={User} label="Full name" value={kyc.fullName} />
        <DetailRow glass={glass} icon={MapPin} label="Location" value={kyc.location} />
        <DetailRow
          glass={glass}
          icon={Phone}
          label="Phone"
          value={kyc.phoneNumber}
          href={`tel:${kyc.phoneNumber.replace(/\s/g, "")}`}
        />
      </div>
      {kyc.socialLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Social</p>
          <div className="space-y-2">
            {kyc.socialLinks.map((link) => {
              const config = SOCIAL_PLATFORM_CONFIG[link.platform]
              const url = buildSocialUrl(link)
              return (
                <a
                  key={link.platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                    glass
                      ? "border border-white/40 bg-white/30 backdrop-blur-md hover:bg-white/45 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                      : "border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-100/80 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:bg-neutral-900/60",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-700 dark:text-neutral-200",
                      glass
                        ? "border border-white/40 bg-white/50 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
                        : "bg-white shadow-sm dark:bg-neutral-900",
                    )}
                  >
                    <SocialPlatformIcon platform={link.platform} className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-500">{config.label}</p>
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {formatSocialLink(link)}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
