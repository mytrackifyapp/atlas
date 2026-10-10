import {
  LINKEDIN_ART,
  LINKEDIN_POST_SIZE,
  type LinkedInStudioPost,
} from "@/lib/content/linkedin-posts"

function fontFamily() {
  const root = document.querySelector("[data-linkedin-studio]")
  return (
    (root ? getComputedStyle(root).fontFamily : "") ||
    getComputedStyle(document.body).fontFamily ||
    "ui-sans-serif, system-ui, sans-serif"
  )
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

function drawCoverCircle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  diameter: number,
  focusY: number
) {
  const r = diameter / 2
  const dx = cx - r
  const dy = cy - r
  const side = Math.min(img.width, img.height) * 0.55
  const sx = (img.width - side) / 2
  const sy = Math.max(0, (img.height - side) * focusY)
  const sw = side
  const sh = side

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, diameter, diameter)
  ctx.restore()
}

export async function downloadLinkedInPng(post: LinkedInStudioPost) {
  await document.fonts.ready

  const size = LINKEDIN_POST_SIZE
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is unavailable")

  ctx.fillStyle = LINKEDIN_ART.white
  ctx.fillRect(0, 0, size, size)
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"

  const headlineSize = 64
  const headlineLine = headlineSize * 1.14
  const labelSize = 22
  const gapIcon = 40
  const gapLabel = 32
  const profileSize = 146
  const logoW = 420
  const logoH = Math.round((logoW * 277) / 1152)

  const headlineHeight = post.lines.length * headlineLine
  const iconH = post.audience === "personal" ? profileSize : logoH
  const blockH = iconH + gapIcon + headlineHeight + gapLabel + labelSize
  let y = (size - blockH) / 2

  if (post.audience === "personal") {
    const img = await loadImage(LINKEDIN_ART.profileSrc)
    drawCoverCircle(
      ctx,
      img,
      size / 2,
      y + profileSize / 2,
      profileSize,
      LINKEDIN_ART.profileFocusY
    )
    y += profileSize + gapIcon
  } else {
    const img = await loadImage(LINKEDIN_ART.logoSrc)
    ctx.drawImage(img, (size - logoW) / 2, y, logoW, logoH)
    y += logoH + gapIcon
  }

  const family = fontFamily()
  ctx.font = `700 ${headlineSize}px ${family}`
  for (const line of post.lines) {
    ctx.fillStyle = line.tone === "muted" ? LINKEDIN_ART.muted : LINKEDIN_ART.ink
    y += headlineLine
    ctx.fillText(line.text, size / 2, y - headlineSize * 0.22)
  }

  y += gapLabel
  ctx.font = `500 ${labelSize}px ${family}`
  ctx.fillStyle = LINKEDIN_ART.ink
  ctx.fillText(post.label, size / 2, y + labelSize * 0.8)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("PNG export failed"))),
      "image/png"
    )
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `linkedin-${post.audience}-${post.id}.png`
  a.click()
  URL.revokeObjectURL(url)
}
