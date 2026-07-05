import type { SocialPlatform } from "@/lib/social/types"

export type RenderDimensions = {
  width: number
  height: number
}

export function getDimensionsForPlatform(platform: SocialPlatform): RenderDimensions {
  switch (platform) {
    case "linkedin":
      return { width: 1200, height: 627 }
    case "instagram":
      return { width: 1080, height: 1080 }
    case "instagram_story":
      return { width: 1080, height: 1920 }
    case "twitter":
      return { width: 1200, height: 675 }
    default:
      return { width: 1080, height: 1080 }
  }
}
