export const SOCIAL_PLATFORMS = [
  "linkedin",
  "instagram",
  "instagram_story",
  "twitter",
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

export const SOCIAL_TEMPLATES = [
  "metric_announcement",
  "quote_card",
  "photo_launch",
  "editorial_photo",
  "branding_graphic",
  "feature_highlight",
] as const

export type SocialTemplateId = (typeof SOCIAL_TEMPLATES)[number]

export const SOCIAL_POST_STATUSES = [
  "draft",
  "rendered",
  "ready",
  "pending_approval",
  "published",
  "failed",
] as const

export type SocialPostStatus = (typeof SOCIAL_POST_STATUSES)[number]

export type SocialTemplateFields = {
  headline?: string
  subhead?: string
  metric?: string
  metricLabel?: string
  quote?: string
  attribution?: string
  badge?: string
  /** Footer line e.g. "Save this post · Follow for more" (editorial_photo) */
  footerCta?: string
  /** Carousel slide index e.g. "3" (branding_graphic) */
  slideNumber?: string
  /** Carousel slide total e.g. "5" (branding_graphic) */
  slideTotal?: string
  bgKeywords?: string
  bgImageUrl?: string
  /** Product screenshot or hero image for feature_highlight */
  screenshotUrl?: string
}

export type SocialBrandKit = {
  ownerId: string
  companyName: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  updatedAt: Date
}

export type SocialPost = {
  id: string
  ownerId: string
  agentId?: string
  correlationId?: string
  platform: SocialPlatform
  templateId: SocialTemplateId
  caption: string
  fields: SocialTemplateFields
  status: SocialPostStatus
  assetUrl?: string
  assetWidth?: number
  assetHeight?: number
  renderError?: string
  approvalId?: string
  externalUrl?: string
  externalId?: string
  publishedAt?: string | null
  publishError?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateSocialPostInput = {
  platform: SocialPlatform
  templateId: SocialTemplateId
  caption: string
  fields: SocialTemplateFields
  agentId?: string
  correlationId?: string
  status?: SocialPostStatus
}

export type UpdateSocialPostInput = Partial<
  Pick<SocialPost, "caption" | "fields" | "platform" | "templateId" | "status">
> & {
  assetUrl?: string
  assetWidth?: number
  assetHeight?: number
  renderError?: string | null
  approvalId?: string | null
  externalUrl?: string | null
  externalId?: string | null
  publishedAt?: string | null
  publishError?: string | null
}

export type UpdateBrandKitInput = {
  companyName?: string
  logoUrl?: string | null
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export type SocialConnection = {
  id: string
  ownerId: string
  platform: "linkedin"
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  profileId: string
  profileUrn: string
  displayName?: string
  createdAt: Date
  updatedAt: Date
}
