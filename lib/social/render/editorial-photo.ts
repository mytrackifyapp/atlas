import sharp from "sharp"
import { Resvg } from "@resvg/resvg-js"

import type { SocialBrandKit, SocialTemplateFields } from "@/lib/social/types"
import { fetchBackgroundBuffer } from "@/lib/social/render/background"
import {
  EDITORIAL_BODY_FONT,
  EDITORIAL_HEADLINE_FONT,
  editorialFontScale,
  escapeXml,
  wrapText,
} from "@/lib/social/render/editorial-layout"
import {
  getInterRegularWoffBase64,
  getInterSemiBoldWoffBase64,
  getOswaldBoldWoffBase64,
} from "@/lib/social/render/fonts"
import { enrichPhotoLaunchFields } from "@/lib/social/render/photo-launch"

export { enrichPhotoLaunchFields as enrichEditorialFields }

function headlineLineSvg(
  line: string,
  cx: number,
  y: number,
  fontSize: number
): string {
  const safe = escapeXml(line)
  const stroke = 2.2
  return `
    <text x="${cx}" y="${y + 3}" text-anchor="middle" fill="rgba(0,0,0,0.42)" font-size="${fontSize}" font-weight="700" font-family="${EDITORIAL_HEADLINE_FONT}, Arial Black, sans-serif" letter-spacing="2">${safe}</text>
    <text x="${cx}" y="${y}" text-anchor="middle" fill="#ffffff" stroke="rgba(0,0,0,0.38)" stroke-width="${stroke}" paint-order="stroke fill" font-size="${fontSize}" font-weight="700" font-family="${EDITORIAL_HEADLINE_FONT}, Arial Black, sans-serif" letter-spacing="2">${safe}</text>
  `
}

export async function buildEditorialOverlaySvg(input: {
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

  const scale = editorialFontScale(input.width, input.height)
  const { width, height, brand, fields, logoDataUri } = input
  const pad = scale.padding
  const cx = width / 2

  const headline = (fields.headline ?? "Your headline here").toUpperCase()
  const headlineLines = wrapText(headline, scale.headlineMaxChars, 4)
  const subheadLines = fields.subhead ? wrapText(fields.subhead, 32, 2) : []

  const footerText =
    fields.footerCta?.trim() ||
    `Brought to you by ${brand.companyName}`

  const headlineLineHeight = scale.headline * 1.08
  const subheadLineHeight = scale.subhead * 1.38
  const headlineBlockHeight = headlineLines.length * headlineLineHeight
  const subheadBlockHeight = subheadLines.length * subheadLineHeight
  const gap = subheadLines.length > 0 ? 30 : 0
  const totalCenterHeight = headlineBlockHeight + gap + subheadBlockHeight
  let headlineStartY = height / 2 - totalCenterHeight / 2 + scale.headline * 0.82

  const headlineSvg = headlineLines
    .map((line, i) => {
      const y = headlineStartY + i * headlineLineHeight
      return headlineLineSvg(line, cx, y, scale.headline)
    })
    .join("\n")

  headlineStartY += headlineBlockHeight + gap
  const subheadSvg = subheadLines
    .map((line, i) => {
      const y = headlineStartY + i * subheadLineHeight
      return `<text x="${cx}" y="${y}" text-anchor="middle" fill="#ffffff" font-size="${scale.subhead}" font-weight="400" font-family="${EDITORIAL_BODY_FONT}, Arial, sans-serif" opacity="0.94" filter="url(#subheadShadow)">${escapeXml(line)}</text>`
    })
    .join("\n")

  const logoY = pad + 4
  const logoBlock = logoDataUri
    ? `<image href="${logoDataUri}" x="${pad}" y="${logoY}" width="${scale.logo}" height="${scale.logo}" preserveAspectRatio="xMidYMid meet"/>`
    : ""
  const brandX = logoDataUri ? pad + scale.logo + 12 : pad
  const brandY = logoY + scale.logo * 0.72

  const badge = fields.badge
    ? `<rect x="${pad}" y="${brandY + 14}" width="${Math.min(fields.badge.length * 9 + 28, width - pad * 2)}" height="30" rx="15" fill="rgba(255,255,255,0.22)"/>
       <text x="${pad + 14}" y="${brandY + 34}" fill="#ffffff" font-size="13" font-weight="600" font-family="${EDITORIAL_BODY_FONT}, Arial, sans-serif" letter-spacing="1">${escapeXml(fields.badge.toUpperCase())}</text>`
    : ""

  const carouselDots = `<g opacity="0.88">
    <circle cx="${width - pad - 52}" cy="${pad + 16}" r="5" fill="#ffffff"/>
    <circle cx="${width - pad - 36}" cy="${pad + 16}" r="5" fill="none" stroke="#ffffff" stroke-width="2"/>
    <circle cx="${width - pad - 20}" cy="${pad + 16}" r="5" fill="none" stroke="#ffffff" stroke-width="2"/>
  </g>`

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @font-face {
          font-family: '${EDITORIAL_HEADLINE_FONT}';
          src: url('data:font/woff;base64,${oswaldBase64}') format('woff');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: '${EDITORIAL_BODY_FONT}';
          src: url('data:font/woff;base64,${interRegularBase64}') format('woff');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: '${EDITORIAL_BODY_FONT}';
          src: url('data:font/woff;base64,${interSemiBoldBase64}') format('woff');
          font-weight: 600;
          font-style: normal;
        }
      </style>
      <filter id="subheadShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.55"/>
      </filter>
      <filter id="footerShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
      <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.58"/>
        <stop offset="38%" stop-color="#000000" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="52%" stop-color="#000000" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.76"/>
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="48%" r="58%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#topFade)"/>
    <rect width="100%" height="100%" fill="url(#bottomFade)"/>
    <rect width="100%" height="100%" fill="url(#centerGlow)"/>
    ${logoBlock}
    <text x="${brandX}" y="${brandY}" fill="#ffffff" font-size="${scale.brand}" font-weight="600" font-family="${EDITORIAL_BODY_FONT}, Arial, sans-serif" filter="url(#footerShadow)">${escapeXml(brand.companyName)}</text>
    ${badge}
    ${carouselDots}
    ${headlineSvg}
    ${subheadSvg}
    <text x="${cx}" y="${height - pad}" text-anchor="middle" fill="#ffffff" font-size="${scale.footer}" font-weight="600" font-family="${EDITORIAL_BODY_FONT}, Arial, sans-serif" opacity="0.9" letter-spacing="0.6" filter="url(#footerShadow)">${escapeXml(footerText)}</text>
  </svg>`

  return Buffer.from(svg)
}

async function renderOverlayPng(svg: Buffer, width: number): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  })
  return Buffer.from(resvg.render().asPng())
}

export async function renderEditorialPhotoSharp(input: {
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

  const resizedBg = await sharp(bgBuffer)
    .resize(input.width, input.height, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.86, saturation: 0.78 })
    .png()
    .toBuffer()

  const overlaySvg = await buildEditorialOverlaySvg({
    width: input.width,
    height: input.height,
    brand: input.brand,
    fields: input.fields,
    logoDataUri: input.logoDataUri,
  })

  const overlayPng = await renderOverlayPng(overlaySvg, input.width)

  return sharp(resizedBg)
    .composite([{ input: overlayPng, top: 0, left: 0 }])
    .png()
    .toBuffer()
}
