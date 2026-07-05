import type { ReactElement } from "react"
import sharp from "sharp"

import type { SocialBrandKit, SocialPost, SocialTemplateFields } from "@/lib/social/types"
import { fetchBackgroundBuffer } from "@/lib/social/render/background"
import { fetchImageAsDataUri } from "@/lib/social/render/fonts"
import { photoLaunchOverlayTemplate } from "@/lib/social/render/templates"

export function deriveHeadlineFromCaption(caption: string): string {
  const trimmed = caption.trim()
  if (!trimmed) return "Launch announcement"

  const firstSentence = trimmed.split(/(?<=[.!?])\s+/)[0]?.trim() ?? trimmed
  if (firstSentence.length <= 72) return firstSentence

  const words = firstSentence.split(/\s+/)
  let line = ""
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > 72) break
    line = next
  }
  return line || firstSentence.slice(0, 72)
}

export function enrichPhotoLaunchFields(
  post: Pick<SocialPost, "caption" | "fields">
): SocialTemplateFields {
  const headline =
    post.fields.headline?.trim() ||
    deriveHeadlineFromCaption(post.caption)

  const subhead =
    post.fields.subhead?.trim() ||
    (post.fields.headline?.trim() && post.caption.trim() !== headline
      ? post.caption.trim()
      : undefined)

  return {
    ...post.fields,
    headline,
    subhead,
  }
}

export function photoLaunchFontScale(width: number, height: number) {
  const isSquare = Math.abs(width - height) < 80
  const isStory = height > width * 1.3

  if (isStory) {
    return { headline: 58, subhead: 30, brand: 24, logo: 56, badge: 17, padding: 72 }
  }
  if (isSquare) {
    return { headline: 50, subhead: 26, brand: 22, logo: 52, badge: 16, padding: 56 }
  }
  return { headline: 56, subhead: 28, brand: 22, logo: 52, badge: 16, padding: 64 }
}

export async function resolveLogoDataUri(
  brand: SocialBrandKit
): Promise<string | null> {
  if (!brand.logoUrl?.trim()) return null
  return fetchImageAsDataUri(brand.logoUrl.trim())
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ""

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, maxLines)
}

export function buildPhotoLaunchOverlaySvg(input: {
  width: number
  height: number
  brand: SocialBrandKit
  fields: SocialTemplateFields
  logoDataUri?: string | null
  scale: ReturnType<typeof photoLaunchFontScale>
}): Buffer {
  const { width, height, brand, fields, logoDataUri, scale } = input
  const pad = scale.padding
  const headline = fields.headline ?? "Launch announcement"
  const headlineLines = wrapText(headline, 22, 3)
  const subheadLines = fields.subhead ? wrapText(fields.subhead, 28, 2) : []

  let y = height - pad
  const textBlocks: string[] = []

  if (subheadLines.length > 0) {
    for (let i = subheadLines.length - 1; i >= 0; i--) {
      textBlocks.unshift(
        `<text x="${pad}" y="${y}" fill="#ffffff" font-size="${scale.subhead}" font-family="Arial, Helvetica, sans-serif" opacity="0.95">${escapeXml(subheadLines[i])}</text>`
      )
      y -= scale.subhead * 1.35
    }
    y -= 8
  }

  for (let i = headlineLines.length - 1; i >= 0; i--) {
    textBlocks.unshift(
      `<text x="${pad}" y="${y}" fill="#ffffff" font-size="${scale.headline}" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml(headlineLines[i])}</text>`
    )
    y -= scale.headline * 1.1
  }

  if (fields.badge) {
    y -= 12
    const badgeWidth = fields.badge.length * scale.badge * 0.62 + 32
    textBlocks.unshift(
      `<rect x="${pad}" y="${y - scale.badge - 8}" width="${badgeWidth}" height="${scale.badge + 16}" rx="999" fill="${brand.accentColor}"/>
       <text x="${pad + 16}" y="${y}" fill="${brand.primaryColor}" font-size="${scale.badge}" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml(fields.badge)}</text>`
    )
    y -= scale.badge + 28
  }

  const brandY = y
  const logoBlock = logoDataUri
    ? `<image href="${logoDataUri}" x="${pad}" y="${brandY - scale.logo}" width="${scale.logo}" height="${scale.logo}" preserveAspectRatio="xMidYMid meet"/>`
    : ""
  const brandX = logoDataUri ? pad + scale.logo + 14 : pad
  textBlocks.unshift(
    `${logoBlock}
     <text x="${brandX}" y="${brandY - scale.logo / 3}" fill="#ffffff" font-size="${scale.brand}" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml(brand.companyName)}</text>`
  )

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="45%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.78"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#scrim)"/>
    ${textBlocks.join("\n")}
  </svg>`

  return Buffer.from(svg)
}

export async function renderPhotoLaunchSharp(input: {
  bg: string | Buffer
  brand: SocialBrandKit
  fields: SocialTemplateFields
  width: number
  height: number
  logoDataUri: string | null
}): Promise<Buffer> {
  const bgBuffer = Buffer.isBuffer(input.bg)
    ? input.bg
    : await fetchBackgroundBuffer(input.bg)

  const scale = photoLaunchFontScale(input.width, input.height)
  const resizedBg = await sharp(bgBuffer)
    .resize(input.width, input.height, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.95, saturation: 1.08 })
    .png()
    .toBuffer()

  const overlaySvg = buildPhotoLaunchOverlaySvg({
    width: input.width,
    height: input.height,
    brand: input.brand,
    fields: input.fields,
    logoDataUri: input.logoDataUri,
    scale,
  })

  return sharp(resizedBg)
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .png()
    .toBuffer()
}

export function buildPhotoLaunchOverlay(
  brand: SocialBrandKit,
  fields: SocialTemplateFields,
  width: number,
  height: number,
  logoDataUri: string | null
): ReactElement {
  const scale = photoLaunchFontScale(width, height)

  return photoLaunchOverlayTemplate({
    brand,
    fields,
    width,
    height,
    logoDataUri,
    fontScale: scale,
  }) as ReactElement
}
