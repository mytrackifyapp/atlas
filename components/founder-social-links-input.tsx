"use client"

import { useMemo, useState } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FOUNDER_SOCIAL_PLATFORMS,
  SOCIAL_PLATFORM_CONFIG,
  type FounderSocialLink,
  type FounderSocialPlatform,
  formatSocialLink,
  normalizeSocialUsername,
} from "@/lib/founder/social-platforms"
import { cn } from "@/lib/utils"

type Props = {
  value: FounderSocialLink[]
  onChange: (links: FounderSocialLink[]) => void
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
    return (
      <span className={cn("text-[13px] font-bold leading-none", className)} aria-hidden>
        𝕏
      </span>
    )
  }

  if (config.customIcon === "tiktok") {
    return (
      <span className={cn("text-[11px] font-bold leading-none", className)} aria-hidden>
        TT
      </span>
    )
  }

  if (!Icon) return null
  return <Icon className={className} />
}

function defaultDraftPlatform(usedPlatforms: Set<FounderSocialPlatform>): FounderSocialPlatform {
  return FOUNDER_SOCIAL_PLATFORMS.find((platform) => !usedPlatforms.has(platform)) ?? "linkedin"
}

export function FounderSocialLinksInput({ value, onChange }: Props) {
  const usedPlatforms = useMemo(() => new Set(value.map((link) => link.platform)), [value])
  const [draft, setDraft] = useState<FounderSocialLink>(() => ({
    platform: defaultDraftPlatform(new Set()),
    username: "",
  }))

  function addLink() {
    const username = normalizeSocialUsername(draft.platform, draft.username)
    if (!username) return

    const next = [
      ...value.filter((link) => link.platform !== draft.platform),
      { platform: draft.platform, username },
    ]
    onChange(next)

    const nextUsed = new Set(next.map((link) => link.platform))
    setDraft({
      platform: defaultDraftPlatform(nextUsed),
      username: "",
    })
  }

  function removeLink(platform: FounderSocialPlatform) {
    onChange(value.filter((link) => link.platform !== platform))
  }

  function selectPlatform(platform: FounderSocialPlatform) {
    if (usedPlatforms.has(platform) && draft.platform !== platform) return
    setDraft((prev) => ({
      platform,
      username: prev.platform === platform ? prev.username : "",
    }))
  }

  const canAddMore = value.length < FOUNDER_SOCIAL_PLATFORMS.length
  const draftUsername = normalizeSocialUsername(draft.platform, draft.username)
  const draftConfig = SOCIAL_PLATFORM_CONFIG[draft.platform]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Social profiles</Label>
        <p className="text-xs text-muted-foreground">
          Choose a platform icon, enter your username, then add it. At least one profile is required.
        </p>
      </div>

      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((link) => {
            const config = SOCIAL_PLATFORM_CONFIG[link.platform]
            return (
              <li
                key={link.platform}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-950/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm dark:bg-neutral-900 dark:text-neutral-200">
                    <SocialPlatformIcon platform={link.platform} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-500">{config.label}</p>
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {formatSocialLink(link)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={() => removeLink(link.platform)}
                  aria-label={`Remove ${config.label}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {canAddMore ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/40 p-4 dark:border-neutral-800 dark:bg-neutral-950/30">
          <p className="mb-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">Choose platform</p>
          <div className="flex flex-wrap gap-2">
            {FOUNDER_SOCIAL_PLATFORMS.map((platform) => {
              const config = SOCIAL_PLATFORM_CONFIG[platform]
              const taken = usedPlatforms.has(platform)
              const selected = draft.platform === platform
              return (
                <button
                  key={platform}
                  type="button"
                  disabled={taken && !selected}
                  onClick={() => selectPlatform(platform)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                    selected
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-[#c1ff72] dark:bg-[#c1ff72] dark:text-neutral-950"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
                    taken && !selected && "cursor-not-allowed opacity-40",
                  )}
                  title={config.label}
                  aria-label={config.label}
                >
                  <SocialPlatformIcon platform={platform} className="h-4 w-4" />
                </button>
              )
            })}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="social-username">{draftConfig.label} username</Label>
            <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
              <span className="flex items-center border-r border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400">
                {draftConfig.prefix}
              </span>
              <Input
                id="social-username"
                value={draft.username}
                onChange={(e) => setDraft((prev) => ({ ...prev, username: e.target.value }))}
                placeholder={draftConfig.placeholder}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 rounded-full"
            disabled={!draftUsername || usedPlatforms.has(draft.platform)}
            onClick={addLink}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add {draftConfig.label}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
