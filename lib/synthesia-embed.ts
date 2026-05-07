/**
 * Build Synthesia share-player iframe URL.
 * @see https://docs.synthesia.io/docs/video-player
 */
const SYNTHESIA_EMBED_BASE = "https://share.synthesia.io/embeds/videos"

/** Accepts a bare video id or a share/embed URL and returns the id, or null if unusable. */
export function parseSynthesiaVideoRef(input: string | undefined | null): string | null {
  const s = input?.trim()
  if (!s) return null
  const fromPath = s.match(/embeds\/videos\/([^/?#]+)/i)
  if (fromPath?.[1]) return fromPath[1]
  if (!/[/?#]/.test(s)) return s
  return null
}

export function synthesiaEmbedUrl(videoId: string, language?: string | null): string {
  const id = encodeURIComponent(videoId.trim())
  const url = new URL(`${SYNTHESIA_EMBED_BASE}/${id}`)
  const lang = language?.trim()
  if (lang) url.searchParams.set("language", lang)
  return url.toString()
}
