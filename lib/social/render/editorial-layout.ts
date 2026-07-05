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

export function editorialFontScale(width: number, height: number) {
  const isSquare = Math.abs(width - height) < 80
  const isStory = height > width * 1.3

  if (isStory) {
    return {
      headline: 82,
      subhead: 32,
      brand: 22,
      logo: 44,
      footer: 20,
      padding: 64,
      headlineMaxChars: 16,
    }
  }
  if (isSquare) {
    return {
      headline: 74,
      subhead: 28,
      brand: 20,
      logo: 40,
      footer: 18,
      padding: 56,
      headlineMaxChars: 14,
    }
  }
  return {
    headline: 78,
    subhead: 30,
    brand: 20,
    logo: 42,
    footer: 18,
    padding: 60,
    headlineMaxChars: 18,
  }
}

export const EDITORIAL_HEADLINE_FONT = "Oswald"
export const EDITORIAL_BODY_FONT = "Inter"
