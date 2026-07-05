import type { ReactElement } from "react"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"

import { getBrandKit } from "@/lib/social/brand-kit"
import { searchBestPexelsPhoto } from "@/lib/social/pexels"
import { getSocialPost, updateSocialPost } from "@/lib/social/posts-service"
import type { SocialBrandKit, SocialPost, SocialTemplateFields, SocialTemplateId } from "@/lib/social/types"
import { getDimensionsForPlatform } from "@/lib/social/render/dimensions"
import { fetchImageAsDataUri, getInterFonts } from "@/lib/social/render/fonts"
import { buildHtmlForTemplate } from "@/lib/social/render/html-templates"
import { isPlaywrightAvailable, renderHtmlToPng } from "@/lib/social/render/playwright"
import {
  enrichPhotoLaunchFields,
  renderPhotoLaunchSharp,
  resolveLogoDataUri,
} from "@/lib/social/render/photo-launch"
import {
  enrichEditorialFields,
  renderEditorialPhotoSharp,
} from "@/lib/social/render/editorial-photo"
import {
  enrichBrandingGraphicFields,
  renderBrandingGraphicSharp,
} from "@/lib/social/render/branding-graphic"
import {
  metricAnnouncementTemplate,
  photoLaunchOverlayTemplate,
  quoteCardTemplate,
} from "@/lib/social/render/templates"
import { fetchBackgroundBuffer } from "@/lib/social/render/background"
import { uploadSocialAsset } from "@/lib/social/upload-asset"

const PLAYWRIGHT_TEMPLATES = new Set<SocialTemplateId>([
  "photo_launch",
  "editorial_photo",
  "branding_graphic",
  "feature_highlight",
])

const PHOTO_BG_TEMPLATES = new Set<SocialTemplateId>([
  "photo_launch",
  "editorial_photo",
])

function enrichPhotoBackgroundFields(
  post: Pick<SocialPost, "caption" | "templateId" | "fields">
): SocialTemplateFields {
  if (post.templateId === "editorial_photo") {
    return enrichEditorialFields(post)
  }
  return enrichPhotoLaunchFields(post)
}

function enrichTemplateFields(
  post: Pick<SocialPost, "caption" | "templateId" | "fields">
): SocialTemplateFields {
  if (post.templateId === "branding_graphic") {
    return enrichBrandingGraphicFields(post)
  }
  if (PHOTO_BG_TEMPLATES.has(post.templateId)) {
    return enrichPhotoBackgroundFields(post)
  }
  return post.fields
}

async function renderElementToPng(
  element: ReactElement,
  width: number,
  height: number
): Promise<Buffer> {
  const fonts = await getInterFonts()
  const svg = await satori(element, { width, height, fonts })
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } })
  return Buffer.from(resvg.render().asPng())
}

async function resolveBackgroundUrl(
  post: Pick<SocialPost, "caption" | "templateId" | "platform" | "fields">,
  options?: { ignoreCached?: boolean }
): Promise<{ url: string | null; query?: string; score?: number }> {
  const { fields, caption, templateId, platform } = post

  if (!options?.ignoreCached && fields.bgImageUrl?.trim()) {
    return { url: fields.bgImageUrl.trim(), query: fields.bgKeywords }
  }

  const photo = await searchBestPexelsPhoto({
    keywords: fields.bgKeywords,
    headline: fields.headline,
    subhead: fields.subhead,
    badge: fields.badge,
    caption,
    templateId,
    platform,
  })

  if (!photo) {
    const fallback = await searchBestPexelsPhoto({
      headline: fields.headline,
      subhead: fields.subhead,
      badge: fields.badge,
      caption,
      templateId,
      platform,
    })
    if (!fallback) return { url: null }
    return {
      url: fallback.url,
      query: fallback.query,
      score: fallback.score,
    }
  }

  return {
    url: photo.url,
    query: photo.query,
    score: photo.score,
  }
}

function pickSatoriTemplate(
  templateId: SocialTemplateId,
  ctx: Parameters<typeof metricAnnouncementTemplate>[0]
) {
  switch (templateId) {
    case "quote_card":
      return quoteCardTemplate(ctx)
    case "photo_launch":
      return photoLaunchOverlayTemplate(ctx)
    case "metric_announcement":
    case "feature_highlight":
    default:
      return metricAnnouncementTemplate(ctx)
  }
}

async function renderPhotoBackgroundPost(input: {
  post: SocialPost
  brand: SocialBrandKit
  width: number
  height: number
  logoDataUri: string | null
  bgUrl: string | null
  fields: SocialTemplateFields
  templateId: "photo_launch" | "editorial_photo"
}): Promise<{
  png: Buffer
  renderer: "sharp" | "playwright"
  bgUrl: string
  bgQuery?: string
}> {
  let bgUrl = input.bgUrl
  let bgQuery: string | undefined
  let bgBuffer = bgUrl ? await fetchBackgroundBuffer(bgUrl).catch(() => null) : null

  if (!bgBuffer) {
    const refreshed = await resolveBackgroundUrl(input.post, { ignoreCached: true })
    bgUrl = refreshed.url
    bgQuery = refreshed.query
    if (bgUrl) {
      bgBuffer = await fetchBackgroundBuffer(bgUrl).catch(() => null)
    }
  }

  if (!bgUrl || !bgBuffer) {
    throw new Error(
      "Failed to download stock photo for the background. Check PEXELS_API_KEY."
    )
  }

  const renderSharp =
    input.templateId === "editorial_photo"
      ? renderEditorialPhotoSharp
      : renderPhotoLaunchSharp

  try {
    const png = await renderSharp({
      bg: bgBuffer,
      brand: input.brand,
      fields: input.fields,
      width: input.width,
      height: input.height,
      logoDataUri: input.logoDataUri,
    })
    return { png, renderer: "sharp", bgUrl, bgQuery }
  } catch (error) {
    console.error(`Sharp ${input.templateId} render failed, trying Playwright:`, error)
    const bgDataUri = await fetchImageAsDataUri(bgUrl)
    const playwrightPng = await renderWithPlaywright({
      templateId: input.templateId,
      brand: input.brand,
      fields: input.fields,
      width: input.width,
      height: input.height,
      bgImageUrl: bgUrl,
      bgDataUri,
      logoDataUri: input.logoDataUri,
    })
    if (!playwrightPng) {
      throw new Error(`Failed to render ${input.templateId} graphic`)
    }
    return { png: playwrightPng, renderer: "playwright", bgUrl, bgQuery }
  }
}

async function renderWithPlaywright(input: {
  templateId: "photo_launch" | "editorial_photo" | "branding_graphic" | "feature_highlight"
  brand: SocialBrandKit
  fields: SocialTemplateFields
  width: number
  height: number
  bgImageUrl?: string | null
  bgDataUri?: string | null
  logoDataUri?: string | null
}): Promise<Buffer | null> {
  if (!(await isPlaywrightAvailable())) return null

  const html = buildHtmlForTemplate(input.templateId, {
    width: input.width,
    height: input.height,
    companyName: input.brand.companyName,
    logoUrl: input.brand.logoUrl,
    logoDataUri: input.logoDataUri ?? undefined,
    primaryColor: input.brand.primaryColor,
    secondaryColor: input.brand.secondaryColor,
    accentColor: input.brand.accentColor,
    headline: input.fields.headline,
    subhead: input.fields.subhead,
    metric: input.fields.metric,
    metricLabel: input.fields.metricLabel,
    badge: input.fields.badge,
    footerCta: input.fields.footerCta,
    slideNumber: input.fields.slideNumber,
    slideTotal: input.fields.slideTotal,
    bgImageUrl: input.bgImageUrl ?? undefined,
    bgDataUri: input.bgDataUri ?? undefined,
    screenshotUrl: input.fields.screenshotUrl,
  })

  return renderHtmlToPng(html, input.width, input.height)
}

export async function renderSocialPostAsset(input: {
  ownerId: string
  postId: string
}): Promise<{
  assetUrl: string
  width: number
  height: number
  backgroundSource?: string
  renderer?: "playwright" | "satori" | "sharp"
}> {
  const post = await getSocialPost(input.postId, input.ownerId)
  if (!post) {
    throw new Error("Social post not found")
  }

  const brand = await getBrandKit(input.ownerId)
  const { width, height } = getDimensionsForPlatform(post.platform)
  const logoDataUri = await resolveLogoDataUri(brand)
  const enrichedFields = enrichTemplateFields(post)

  const ctx = {
    brand,
    fields: enrichedFields,
    width,
    height,
    logoDataUri,
  }

  let png: Buffer
  let renderer: "playwright" | "satori" | "sharp" = "satori"
  let backgroundQuery: string | undefined

  if (PHOTO_BG_TEMPLATES.has(post.templateId)) {
    const enrichedPost = { ...post, fields: enrichedFields }
    const bg = await resolveBackgroundUrl(enrichedPost, { ignoreCached: true })
    const bgUrl = bg.url
    backgroundQuery = bg.query

    if (bgUrl) {
      await updateSocialPost(input.postId, input.ownerId, {
        fields: {
          ...enrichedFields,
          bgImageUrl: bgUrl,
          bgKeywords: bg.query ?? enrichedFields.bgKeywords,
        },
      })
    }

    const result = await renderPhotoBackgroundPost({
      post: enrichedPost,
      brand,
      width,
      height,
      logoDataUri,
      bgUrl,
      fields: enrichedFields,
      templateId: post.templateId as "photo_launch" | "editorial_photo",
    })
    png = result.png
    renderer = result.renderer
    backgroundQuery = result.bgQuery ?? backgroundQuery

    if (result.bgUrl !== enrichedPost.fields.bgImageUrl) {
      await updateSocialPost(input.postId, input.ownerId, {
        fields: {
          ...enrichedFields,
          bgImageUrl: result.bgUrl,
          bgKeywords: result.bgQuery ?? enrichedFields.bgKeywords,
        },
      })
    }
  } else if (post.templateId === "branding_graphic") {
    try {
      png = await renderBrandingGraphicSharp({
        brand,
        fields: enrichedFields,
        width,
        height,
        logoDataUri,
      })
      renderer = "sharp"
    } catch (error) {
      console.error("Sharp branding_graphic render failed, trying Playwright:", error)
      const playwrightPng = await renderWithPlaywright({
        templateId: "branding_graphic",
        brand,
        fields: enrichedFields,
        width,
        height,
        logoDataUri,
      })
      if (!playwrightPng) {
        throw new Error("Failed to render branding_graphic")
      }
      png = playwrightPng
      renderer = "playwright"
    }
  } else if (post.templateId === "feature_highlight") {
    const playwrightPng = await renderWithPlaywright({
      templateId: "feature_highlight",
      brand,
      fields: enrichedFields,
      width,
      height,
      logoDataUri,
    })

    if (playwrightPng) {
      png = playwrightPng
      renderer = "playwright"
    } else {
      png = await renderElementToPng(
        metricAnnouncementTemplate({
          ...ctx,
          fields: {
            ...enrichedFields,
            headline: enrichedFields.headline ?? "New feature",
          },
        }) as ReactElement,
        width,
        height
      )
    }
  } else {
    const element = pickSatoriTemplate(post.templateId, ctx)
    png = await renderElementToPng(element as ReactElement, width, height)
  }

  const assetUrl = await uploadSocialAsset(png, input.ownerId)

  await updateSocialPost(input.postId, input.ownerId, {
    assetUrl,
    assetWidth: width,
    assetHeight: height,
    status: "rendered",
    renderError: null,
  })

  return {
    assetUrl,
    width,
    height,
    backgroundSource: backgroundQuery ?? post.fields.bgImageUrl ?? post.fields.bgKeywords,
    renderer,
  }
}
