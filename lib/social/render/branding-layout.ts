export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
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

export function brandingFontScale(width: number, height: number) {
  const isSquare = Math.abs(width - height) < 80
  const isStory = height > width * 1.3

  if (isStory) {
    return {
      headline: 64,
      subhead: 30,
      brand: 20,
      logo: 44,
      badge: 14,
      slide: 52,
      footer: 18,
      padding: 64,
      headlineMaxChars: 18,
    }
  }
  if (isSquare) {
    return {
      headline: 56,
      subhead: 26,
      brand: 18,
      logo: 40,
      badge: 13,
      slide: 46,
      footer: 16,
      padding: 56,
      headlineMaxChars: 16,
    }
  }
  return {
    headline: 60,
    subhead: 28,
    brand: 19,
    logo: 42,
    badge: 13,
    slide: 48,
    footer: 17,
    padding: 60,
    headlineMaxChars: 22,
  }
}

export const BRANDING_HEADLINE_FONT = "Oswald"
export const BRANDING_BODY_FONT = "Inter"
