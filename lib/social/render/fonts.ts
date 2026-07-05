let interRegular: ArrayBuffer | null = null
let interBold: ArrayBuffer | null = null
let interSemiBold: ArrayBuffer | null = null
let oswaldBold: ArrayBuffer | null = null

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to load font: ${res.status}`)
  }
  return res.arrayBuffer()
}

export async function getInterFonts() {
  if (!interRegular) {
    interRegular = await loadFont(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff"
    )
  }
  if (!interBold) {
    interBold = await loadFont(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff"
    )
  }

  return [
    { name: "Inter", data: interRegular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: interBold, weight: 700 as const, style: "normal" as const },
  ]
}

export async function getOswaldBoldWoffBase64(): Promise<string> {
  if (!oswaldBold) {
    oswaldBold = await loadFont(
      "https://cdn.jsdelivr.net/npm/@fontsource/oswald@5.0.8/files/oswald-latin-700-normal.woff"
    )
  }
  return Buffer.from(oswaldBold).toString("base64")
}

export async function getInterRegularWoffBase64(): Promise<string> {
  if (!interRegular) {
    interRegular = await loadFont(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff"
    )
  }
  return Buffer.from(interRegular).toString("base64")
}

export async function getInterSemiBoldWoffBase64(): Promise<string> {
  if (!interSemiBold) {
    interSemiBold = await loadFont(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-600-normal.woff"
    )
  }
  return Buffer.from(interSemiBold).toString("base64")
}

export async function fetchImageAsDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg"
    return `data:${mime};base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}
