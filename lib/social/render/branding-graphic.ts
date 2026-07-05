import { Resvg } from "@resvg/resvg-js"

import type { SocialBrandKit, SocialPost, SocialTemplateFields } from "@/lib/social/types"
import {
  BRANDING_BODY_FONT,
  BRANDING_HEADLINE_FONT,
  brandingFontScale,
  escapeXml,
  wrapText,
} from "@/lib/social/render/branding-layout"
import { deriveHeadlineFromCaption } from "@/lib/social/render/photo-launch"
import {
  getInterRegularWoffBase64,
  getInterSemiBoldWoffBase64,
  getOswaldBoldWoffBase64,
} from "@/lib/social/render/fonts"

export function enrichBrandingGraphicFields(
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
    badge: post.fields.badge?.trim() || post.fields.badge,
  }
}

async function renderSvgToPng(svg: Buffer, width: number): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  })
  return Buffer.from(resvg.render().asPng())
}

export async function buildBrandingGraphicSvg(input: {
  width: number
  height: number
  brand: SocialBrandKit
  fields: SocialTemplateFields
  logoDataUri?: string | null
}): Promise<Buffer> {
  const [oswaldBase64, interRegularBase64, interSemiBoldBase64] = await Promise.all([
    getOswaldBoldWoffBase64(),
    getInterRegularWoffBase64(),
    getInterSemiBoldWoffBase64(),
  ])

  const scale = brandingFontScale(input.width, input.height)
  const { width, height, brand, fields, logoDataUri } = input
  const pad = scale.padding
  const accent = brand.accentColor
  const primary = brand.primaryColor
  const secondary = brand.secondaryColor

  const headline = fields.headline ?? "Brand insight"
  const headlineLines = wrapText(headline, scale.headlineMaxChars, 4)
  const subheadLines = fields.subhead ? wrapText(fields.subhead, 34, 3) : []

  const footerText =
    fields.footerCta?.trim() || brand.companyName

  const headlineLineHeight = scale.headline * 1.12
  const subheadLineHeight = scale.subhead * 1.4
  const headlineBlockHeight = headlineLines.length * headlineLineHeight
  const subheadBlockHeight = subheadLines.length * subheadLineHeight
  const contentGap = subheadLines.length > 0 ? 28 : 0
  const totalContentHeight = headlineBlockHeight + contentGap + subheadBlockHeight
  const contentTop = height * 0.38 - totalContentHeight / 2

  const textX = pad + 28
  let y = contentTop + scale.headline * 0.85

  const headlineSvg = headlineLines
    .map((line, i) => {
      const lineY = y + i * headlineLineHeight
      return `<text x="${textX}" y="${lineY}" fill="#ffffff" font-size="${scale.headline}" font-weight="700" font-family="${BRANDING_HEADLINE_FONT}, Arial Black, sans-serif" letter-spacing="0.5">${escapeXml(line)}</text>`
    })
    .join("\n")

  y += headlineBlockHeight + contentGap
  const subheadSvg = subheadLines
    .map((line, i) => {
      const lineY = y + i * subheadLineHeight
      return `<text x="${textX}" y="${lineY}" fill="#ffffff" font-size="${scale.subhead}" font-weight="400" font-family="${BRANDING_BODY_FONT}, Arial, sans-serif" opacity="0.82">${escapeXml(line)}</text>`
    })
    .join("\n")

  const accentBarHeight = Math.max(headlineBlockHeight + subheadBlockHeight + contentGap, 80)

  const logoY = pad
  const logoBlock = logoDataUri
    ? `<image href="${logoDataUri}" x="${pad}" y="${logoY}" width="${scale.logo}" height="${scale.logo}" preserveAspectRatio="xMidYMid meet"/>`
    : ""
  const brandX = logoDataUri ? pad + scale.logo + 12 : pad
  const brandY = logoY + scale.logo * 0.72

  const badge = fields.badge
    ? `<rect x="${pad}" y="${brandY + 18}" width="${Math.min(fields.badge.length * 8 + 28, width * 0.5)}" height="28" rx="14" fill="${accent}"/>
       <text x="${pad + 14}" y="${brandY + 37}" fill="${primary}" font-size="${scale.badge}" font-weight="700" font-family="${BRANDING_BODY_FONT}, Arial, sans-serif" letter-spacing="0.08em">${escapeXml(fields.badge.toUpperCase())}</text>`
    : ""

  const slideNumber = fields.slideNumber?.trim()
  const slideTotal = fields.slideTotal?.trim()
  const slideIndicator =
    slideNumber
      ? `<text x="${width - pad}" y="${pad + scale.slide * 0.55}" text-anchor="end" fill="${accent}" font-size="${scale.slide}" font-weight="700" font-family="${BRANDING_HEADLINE_FONT}, Arial Black, sans-serif">${escapeXml(slideNumber.padStart(2, "0"))}</text>
         ${slideTotal ? `<text x="${width - pad}" y="${pad + scale.slide * 0.55 + 28}" text-anchor="end" fill="#ffffff" font-size="18" font-weight="600" font-family="${BRANDING_BODY_FONT}, Arial, sans-serif" opacity="0.45">/ ${escapeXml(slideTotal.padStart(2, "0"))}</text>` : ""}`
      : `<g opacity="0.75">
           <circle cx="${width - pad - 44}" cy="${pad + 18}" r="5" fill="${accent}"/>
           <circle cx="${width - pad - 28}" cy="${pad + 18}" r="5" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
           <circle cx="${width - pad - 12}" cy="${pad + 18}" r="5" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
         </g>`

  const metricBlock =
    fields.metric
      ? `<rect x="${pad}" y="${height - pad - 100}" width="${width - pad * 2}" height="72" rx="16" fill="rgba(255,255,255,0.06)" stroke="${accent}" stroke-width="2"/>
         <text x="${pad + 24}" y="${height - pad - 58}" fill="${accent}" font-size="42" font-weight="700" font-family="${BRANDING_HEADLINE_FONT}, Arial Black, sans-serif">${escapeXml(fields.metric)}</text>
         ${fields.metricLabel ? `<text x="${pad + 24}" y="${height - pad - 28}" fill="#ffffff" font-size="18" font-weight="400" font-family="${BRANDING_BODY_FONT}, Arial, sans-serif" opacity="0.75">${escapeXml(fields.metricLabel)}</text>` : ""}`
      : ""

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @font-face {
          font-family: '${BRANDING_HEADLINE_FONT}';
          src: url('data:font/woff;base64,${oswaldBase64}') format('woff');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: '${BRANDING_BODY_FONT}';
          src: url('data:font/woff;base64,${interRegularBase64}') format('woff');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: '${BRANDING_BODY_FONT}';
          src: url('data:font/woff;base64,${interSemiBoldBase64}') format('woff');
          font-weight: 600;
          font-style: normal;
        }
      </style>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primary}"/>
        <stop offset="100%" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <polygon points="${width},0 ${width},${height * 0.52} ${width * 0.48},0" fill="${accent}" opacity="0.32"/>
    <polygon points="0,${height} 0,${height * 0.62} ${width * 0.38},${height}" fill="${accent}" opacity="0.14"/>
    <circle cx="${width * 0.88}" cy="${height * 0.78}" r="96" fill="none" stroke="${accent}" stroke-width="3" opacity="0.35"/>
    <circle cx="${width * 0.88}" cy="${height * 0.78}" r="64" fill="${accent}" opacity="0.08"/>
    <rect x="${width * 0.72}" y="${height * 0.18}" width="120" height="120" rx="24" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.12" transform="rotate(18 ${width * 0.72 + 60} ${height * 0.18 + 60})"/>
    <g opacity="0.08">
      ${Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => {
          const cx = pad + col * 48
          const cy = height * 0.55 + row * 48
          return `<circle cx="${cx}" cy="${cy}" r="2" fill="#ffffff"/>`
        }).join("")
      ).join("")}
    </g>
    ${logoBlock}
    <text x="${brandX}" y="${brandY}" fill="#ffffff" font-size="${scale.brand}" font-weight="600" font-family="${BRANDING_BODY_FONT}, Arial, sans-serif" opacity="0.92">${escapeXml(brand.companyName)}</text>
    ${badge}
    ${slideIndicator}
    <rect x="${pad}" y="${contentTop}" width="5" height="${accentBarHeight}" rx="2.5" fill="${accent}"/>
    ${headlineSvg}
    ${subheadSvg}
    ${metricBlock}
    <rect x="${pad}" y="${height - pad - (fields.metric ? 118 : 28)}" width="80" height="4" rx="2" fill="${accent}"/>
    <text x="${pad}" y="${height - pad - (fields.metric ? 8 : 0)}" fill="#ffffff" font-size="${scale.footer}" font-weight="600" font-family="${BRANDING_BODY_FONT}, Arial, sans-serif" opacity="0.7" letter-spacing="0.04em">${escapeXml(footerText)}</text>
  </svg>`

  return Buffer.from(svg)
}

export async function renderBrandingGraphicSharp(input: {
  brand: SocialBrandKit
  fields: SocialTemplateFields
  width: number
  height: number
  logoDataUri: string | null
}): Promise<Buffer> {
  const svg = await buildBrandingGraphicSvg({
    width: input.width,
    height: input.height,
    brand: input.brand,
    fields: input.fields,
    logoDataUri: input.logoDataUri,
  })

  return renderSvgToPng(svg, input.width)
}
