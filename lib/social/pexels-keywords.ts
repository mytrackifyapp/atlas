import type { SocialPlatform, SocialTemplateId } from "@/lib/social/types"
import { orientationForPlatform } from "@/lib/social/render/background"

export type PexelsKeywordContext = {
  keywords?: string
  headline?: string
  subhead?: string
  badge?: string
  caption?: string
  templateId?: SocialTemplateId
  platform?: SocialPlatform
}

export type PexelsVisualIntent =
  | "launch"
  | "fundraising"
  | "milestone"
  | "feature"
  | "quote"
  | "brand"
  | "editorial"
  | "general"

const VAGUE_TERMS = new Set([
  "professional",
  "business",
  "startup",
  "company",
  "success",
  "growth",
  "innovative",
  "modern",
  "digital",
  "technology",
  "tech",
  "solution",
  "platform",
  "team",
  "work",
  "working",
])

const LAUNCH_RE =
  /\b(launch|announc|release|live|ship|introduc|debut|unveil|now available|go live)\b/i
const FUNDRAISING_RE =
  /\b(fundrais|funding|investor|investment|venture capital|\bvc\b|seed round|series [a-d]|raise capital|capital raise|pitch deck|pitch meeting|angel investor|term sheet)\b/i
const MILESTONE_RE =
  /\b(\d+%|\$\d|users|customers|revenue|mrr|arr|milestone|record|growth)\b/i
const FEATURE_RE = /\b(feature|update|new|improv|capabilit)\b/i

const INTENT_QUERY_PACKS: Record<PexelsVisualIntent, string[]> = {
  launch: [
    "product launch celebration spotlight",
    "rocket launch dramatic sky",
    "stage lights product reveal",
    "grand opening event lights",
  ],
  fundraising: [
    "startup pitch investors meeting",
    "entrepreneur investor presentation",
    "business funding handshake deal",
    "venture capital office meeting",
  ],
  milestone: [
    "business growth chart upward",
    "celebration confetti achievement",
    "milestone trophy success",
    "analytics dashboard growth",
  ],
  feature: [
    "software product screen mockup",
    "mobile app interface close up",
    "technology product showcase",
    "innovation product design",
  ],
  quote: [
    "minimal abstract gradient background",
    "elegant texture backdrop",
    "soft bokeh office window",
  ],
  brand: [
    "professional business workspace",
    "modern office desk laptop",
    "city skyline night lights",
    "abstract brand gradient texture",
  ],
  editorial: [
    "city street urban lifestyle",
    "young professional walking city",
    "urban skyline dramatic golden hour",
    "street photography editorial portrait",
  ],
  general: [
    "abstract business background",
    "minimal gradient texture",
  ],
}

const INTENT_NEGATIVE_TERMS: Record<PexelsVisualIntent, string[]> = {
  launch: [
    "team",
    "teamwork",
    "collaboration",
    "meeting",
    "colleagues",
    "group photo",
    "office workers",
    "brainstorm",
    "flat lay",
    "desk setup",
  ],
  fundraising: [
    "flat lay",
    "desk",
    "keyboard",
    "magazine",
    "watch",
    "headphones",
    "sunglasses",
    "candle",
    "plant",
    "notebook",
    "coffee",
    "lifestyle",
    "top view workspace",
    "office desk aesthetic",
  ],
  milestone: ["handshake", "meeting room", "team photo", "flat lay"],
  feature: ["handshake", "team meeting", "group selfie"],
  quote: ["crowd", "busy street", "team"],
  brand: ["handshake", "meeting"],
  editorial: [
    "flat lay",
    "desk",
    "keyboard",
    "notebook",
    "coffee",
    "office desk aesthetic",
    "top view workspace",
    "handshake",
    "meeting room",
  ],
  general: [],
}

function collectText(ctx: PexelsKeywordContext): string {
  return [ctx.keywords, ctx.headline, ctx.subhead, ctx.badge, ctx.caption]
    .filter(Boolean)
    .join(" ")
    .trim()
}

export function detectVisualIntent(ctx: PexelsKeywordContext): PexelsVisualIntent {
  const text = collectText(ctx)
  if (!text) {
    if (ctx.templateId === "editorial_photo") return "editorial"
    if (ctx.templateId === "photo_launch") return "launch"
    if (ctx.templateId === "metric_announcement") return "milestone"
    if (ctx.templateId === "feature_highlight") return "feature"
    if (ctx.templateId === "quote_card") return "quote"
    return "general"
  }

  if (LAUNCH_RE.test(text) && !FUNDRAISING_RE.test(text)) return "launch"
  if (FUNDRAISING_RE.test(text)) return "fundraising"
  if (ctx.templateId === "editorial_photo" && !FEATURE_RE.test(text)) {
    return FUNDRAISING_RE.test(text) ? "fundraising" : "editorial"
  }
  if (ctx.templateId === "photo_launch" && !FEATURE_RE.test(text)) {
    return FUNDRAISING_RE.test(text) ? "fundraising" : "launch"
  }
  if (MILESTONE_RE.test(text) || ctx.templateId === "metric_announcement") {
    return "milestone"
  }
  if (FEATURE_RE.test(text) || ctx.templateId === "feature_highlight") {
    return "feature"
  }
  if (ctx.templateId === "quote_card") return "quote"
  return "general"
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !VAGUE_TERMS.has(w))
}

function buildPrimaryQuery(ctx: PexelsKeywordContext, intent: PexelsVisualIntent): string | null {
  const explicit = ctx.keywords?.trim()
  if (explicit) {
    const tokens = tokenize(explicit)
    if (tokens.length >= 2) return explicit
    const pack = INTENT_QUERY_PACKS[intent][0]
    return `${explicit} ${pack.split(" ").slice(0, 2).join(" ")}`.trim()
  }

  const headline = ctx.headline?.trim()
  const badge = ctx.badge?.trim()
  const subhead = ctx.subhead?.trim()

  if (headline) {
    const headlineTokens = tokenize(headline).slice(0, 4)
    if (headlineTokens.length > 0) {
      const intentAnchor = INTENT_QUERY_PACKS[intent][0].split(" ").slice(-2).join(" ")
      return `${headlineTokens.join(" ")} ${intentAnchor}`.trim()
    }
  }

  if (badge) {
    return `${badge.trim()} ${INTENT_QUERY_PACKS[intent][0]}`
  }

  if (subhead) {
    const subTokens = tokenize(subhead).slice(0, 3)
    if (subTokens.length > 0) {
      return `${subTokens.join(" ")} ${INTENT_QUERY_PACKS[intent][0]}`
    }
  }

  const captionTokens = tokenize(ctx.caption ?? "").slice(0, 4)
  if (captionTokens.length >= 2) {
    return `${captionTokens.join(" ")} ${INTENT_QUERY_PACKS[intent][0]}`
  }

  return null
}

export function buildPexelsQueryVariants(ctx: PexelsKeywordContext): string[] {
  const intent = detectVisualIntent(ctx)
  const pack = INTENT_QUERY_PACKS[intent]
  const primary = buildPrimaryQuery(ctx, intent)
  const variants: string[] = []

  if (primary) variants.push(primary)
  variants.push(pack[0])

  return [...new Set(variants)].slice(0, 2)
}

export function getNegativeTermsForIntent(intent: PexelsVisualIntent): string[] {
  return INTENT_NEGATIVE_TERMS[intent]
}

export function getPositiveTermsForContext(ctx: PexelsKeywordContext): string[] {
  const intent = detectVisualIntent(ctx)
  const text = collectText(ctx)
  const tokens = tokenize(text)
  const intentTokens = tokenize(INTENT_QUERY_PACKS[intent].join(" "))
  return [...new Set([...tokens, ...intentTokens])]
}
