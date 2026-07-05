import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Youtube,
  type LucideIcon,
} from "lucide-react"

export const FOUNDER_SOCIAL_PLATFORMS = [
  "twitter",
  "linkedin",
  "instagram",
  "github",
  "facebook",
  "youtube",
  "tiktok",
] as const

export type FounderSocialPlatform = (typeof FOUNDER_SOCIAL_PLATFORMS)[number]

export type FounderSocialLink = {
  platform: FounderSocialPlatform
  username: string
}

type PlatformConfig = {
  id: FounderSocialPlatform
  label: string
  prefix: string
  placeholder: string
  Icon: LucideIcon | null
  customIcon?: "x"
}

export const SOCIAL_PLATFORM_CONFIG: Record<FounderSocialPlatform, PlatformConfig> = {
  twitter: {
    id: "twitter",
    label: "X",
    prefix: "@",
    placeholder: "janedoe",
    Icon: null,
    customIcon: "x",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    prefix: "linkedin.com/in/",
    placeholder: "janedoe",
    Icon: Linkedin,
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    prefix: "@",
    placeholder: "janedoe",
    Icon: Instagram,
  },
  github: {
    id: "github",
    label: "GitHub",
    prefix: "github.com/",
    placeholder: "janedoe",
    Icon: Github,
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    prefix: "facebook.com/",
    placeholder: "janedoe",
    Icon: Facebook,
  },
  youtube: {
    id: "youtube",
    label: "YouTube",
    prefix: "@",
    placeholder: "janedoe",
    Icon: Youtube,
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    prefix: "@",
    placeholder: "janedoe",
    Icon: null,
    customIcon: "tiktok",
  },
}

export function normalizeSocialUsername(platform: FounderSocialPlatform, raw: string): string {
  let value = raw.trim()
  if (!value) return ""

  const config = SOCIAL_PLATFORM_CONFIG[platform]
  value = value.replace(/^https?:\/\//i, "").replace(/^www\./i, "")

  if (platform === "linkedin") {
    value = value.replace(/^linkedin\.com\/in\//i, "")
  } else if (platform === "github") {
    value = value.replace(/^github\.com\//i, "")
  } else if (platform === "facebook") {
    value = value.replace(/^facebook\.com\//i, "")
  }

  if (config.prefix.startsWith("@")) {
    value = value.replace(/^@+/, "")
  }

  return value.replace(/\/$/, "")
}

export function formatSocialLink(link: FounderSocialLink): string {
  const username = normalizeSocialUsername(link.platform, link.username)
  if (!username) return ""
  const config = SOCIAL_PLATFORM_CONFIG[link.platform]
  return `${config.prefix}${username}`
}

export function buildSocialUrl(link: FounderSocialLink): string {
  const username = normalizeSocialUsername(link.platform, link.username)
  if (!username) return ""

  switch (link.platform) {
    case "twitter":
      return `https://x.com/${username}`
    case "linkedin":
      return `https://www.linkedin.com/in/${username}`
    case "instagram":
      return `https://instagram.com/${username}`
    case "github":
      return `https://github.com/${username}`
    case "facebook":
      return `https://facebook.com/${username}`
    case "youtube":
      return `https://youtube.com/@${username.replace(/^@+/, "")}`
    case "tiktok":
      return `https://tiktok.com/@${username.replace(/^@+/, "")}`
    default:
      return ""
  }
}

export function parseSocialLinks(raw: unknown): FounderSocialLink[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const platform = String((item as FounderSocialLink).platform ?? "") as FounderSocialPlatform
      const username = String((item as FounderSocialLink).username ?? "")
      if (!FOUNDER_SOCIAL_PLATFORMS.includes(platform)) return null
      return {
        platform,
        username: normalizeSocialUsername(platform, username),
      }
    })
    .filter((item): item is FounderSocialLink => Boolean(item))
}

export function hasValidSocialLinks(links: FounderSocialLink[]): boolean {
  return links.some((link) => normalizeSocialUsername(link.platform, link.username).length > 0)
}

export function normalizeSocialLinks(links: FounderSocialLink[]): FounderSocialLink[] {
  const seen = new Set<FounderSocialPlatform>()
  const normalized: FounderSocialLink[] = []

  for (const link of links) {
    const username = normalizeSocialUsername(link.platform, link.username)
    if (!username || seen.has(link.platform)) continue
    seen.add(link.platform)
    normalized.push({ platform: link.platform, username })
  }

  return normalized
}

export function migrateLegacySocialHandle(handle: string): FounderSocialLink[] {
  const trimmed = handle.trim()
  if (!trimmed) return []

  const lower = trimmed.toLowerCase()
  if (lower.includes("linkedin.com")) {
    return [{ platform: "linkedin", username: normalizeSocialUsername("linkedin", trimmed) }]
  }
  if (lower.includes("github.com")) {
    return [{ platform: "github", username: normalizeSocialUsername("github", trimmed) }]
  }
  if (lower.includes("instagram.com")) {
    return [{ platform: "instagram", username: normalizeSocialUsername("instagram", trimmed) }]
  }
  if (lower.includes("facebook.com")) {
    return [{ platform: "facebook", username: normalizeSocialUsername("facebook", trimmed) }]
  }
  if (lower.includes("youtube.com") || lower.startsWith("@")) {
    return [{ platform: "youtube", username: normalizeSocialUsername("youtube", trimmed) }]
  }

  return [{ platform: "twitter", username: normalizeSocialUsername("twitter", trimmed) }]
}
