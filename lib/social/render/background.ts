import sharp from "sharp"

import type { SocialPlatform } from "@/lib/social/types"

export function orientationForPlatform(
  platform: SocialPlatform
): "landscape" | "portrait" | "square" {
  switch (platform) {
    case "instagram":
      return "square"
    case "instagram_story":
      return "portrait"
    case "linkedin":
    case "twitter":
    default:
      return "landscape"
  }
}

export async function fetchBackgroundBuffer(url: string): Promise<Buffer> {
  const normalized = url.trim().replace(/&amp;/g, "&")
  const candidates = [normalized]
  if (normalized.includes("?")) {
    candidates.push(normalized.split("?")[0])
  }

  let lastError: unknown
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        signal: AbortSignal.timeout(20000),
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; TrackifySocial/1.0; +https://trackify.com)",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          Referer: "https://www.pexels.com/",
        },
      })

      if (!res.ok) {
        throw new Error(`Background fetch failed: ${res.status}`)
      }

      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.length < 1000) {
        throw new Error("Background image too small")
      }

      return buffer
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Background fetch failed")
}

export async function canFetchBackground(url: string): Promise<boolean> {
  try {
    await fetchBackgroundBuffer(url)
    return true
  } catch {
    return false
  }
}

export async function compositePhotoBackground(
  bg: string | Buffer,
  overlayPng: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  let bgBuffer: Buffer
  try {
    bgBuffer = Buffer.isBuffer(bg) ? bg : await fetchBackgroundBuffer(bg)
  } catch (error) {
    console.error("Pexels background fetch failed:", error)
    throw new Error("Failed to load stock photo background")
  }

  const resizedBg = await sharp(bgBuffer)
    .resize(width, height, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 1.05 })
    .png()
    .toBuffer()

  const gradient = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
                <stop offset="55%" stop-color="#000000" stop-opacity="0.08"/>
                <stop offset="100%" stop-color="#000000" stop-opacity="0.72"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
          </svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer()

  return sharp(resizedBg)
    .composite([
      { input: gradient, top: 0, left: 0 },
      { input: overlayPng, top: 0, left: 0 },
    ])
    .png()
    .toBuffer()
}
