import { orientationForPlatform } from "@/lib/social/render/background"
import {
  buildPexelsQueryVariants,
  detectVisualIntent,
  getNegativeTermsForIntent,
  getPositiveTermsForContext,
  type PexelsKeywordContext,
} from "@/lib/social/pexels-keywords"

export type PexelsPhoto = {
  id: number
  url: string
  photographer: string
  photographerUrl: string
  alt: string
}

export type PexelsSearchResult = PexelsPhoto & {
  query: string
  score: number
}

type PexelsSearchResponse = {
  photos?: Array<{
    id: number
    alt?: string
    photographer?: string
    photographer_url?: string
    src?: {
      large2x?: string
      large?: string
      original?: string
    }
  }>
}

const MIN_ACCEPTABLE_SCORE = 0
const PHOTOS_PER_QUERY = 5
const MAX_QUERY_ATTEMPTS = 2

function parsePhoto(
  photo: NonNullable<PexelsSearchResponse["photos"]>[number],
  fallbackAlt: string
): PexelsPhoto | null {
  if (!photo?.src) return null
  const imageUrl =
    photo.src.large2x ?? photo.src.large ?? photo.src.original ?? null
  if (!imageUrl) return null

  return {
    id: photo.id,
    url: imageUrl,
    photographer: photo.photographer ?? "Pexels",
    photographerUrl: photo.photographer_url ?? "https://www.pexels.com",
    alt: photo.alt ?? fallbackAlt,
  }
}

function scorePhoto(
  photo: PexelsPhoto,
  positiveTerms: string[],
  negativeTerms: string[]
): number {
  const alt = photo.alt.toLowerCase()
  let score = 0

  for (const term of positiveTerms) {
    if (term.length < 3) continue
    if (alt.includes(term)) score += term.length >= 6 ? 4 : 2
  }

  for (const neg of negativeTerms) {
    if (alt.includes(neg)) score -= 5
  }

  return score
}

export async function searchPexelsPhotos(
  query: string,
  options?: { perPage?: number; orientation?: "landscape" | "portrait" | "square" }
): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY?.trim()
  if (!apiKey) return []

  const q = query.trim()
  if (!q) return []

  const url = new URL("https://api.pexels.com/v1/search")
  url.searchParams.set("query", q)
  url.searchParams.set("per_page", String(options?.perPage ?? PHOTOS_PER_QUERY))
  url.searchParams.set("orientation", options?.orientation ?? "landscape")

  const res = await fetch(url.toString(), {
    headers: { Authorization: apiKey },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    console.error("Pexels search failed:", res.status, await res.text())
    return []
  }

  const data = (await res.json()) as PexelsSearchResponse
  return (data.photos ?? [])
    .map((photo) => parsePhoto(photo, q))
    .filter((photo): photo is PexelsPhoto => photo !== null)
}

/** @deprecated Prefer searchBestPexelsPhoto for context-aware selection */
export async function searchPexelsPhoto(query: string): Promise<PexelsPhoto | null> {
  const photos = await searchPexelsPhotos(query, { perPage: 1 })
  return photos[0] ?? null
}

export async function searchBestPexelsPhoto(
  context: PexelsKeywordContext
): Promise<PexelsSearchResult | null> {
  const apiKey = process.env.PEXELS_API_KEY?.trim()
  if (!apiKey) return null

  const intent = detectVisualIntent(context)
  const queries = buildPexelsQueryVariants(context).slice(0, MAX_QUERY_ATTEMPTS)
  const positiveTerms = getPositiveTermsForContext(context)
  const negativeTerms = getNegativeTermsForIntent(intent)

  const ranked: PexelsSearchResult[] = []
  const seenIds = new Set<number>()

  for (const query of queries) {
    const orientation =
      context.platform != null
        ? orientationForPlatform(context.platform)
        : context.templateId === "photo_launch" ||
            context.templateId === "editorial_photo"
          ? "landscape"
          : "landscape"

    const photos = await searchPexelsPhotos(query, {
      perPage: PHOTOS_PER_QUERY,
      orientation,
    })
    for (const photo of photos) {
      if (seenIds.has(photo.id)) continue
      seenIds.add(photo.id)
      ranked.push({
        ...photo,
        query,
        score: scorePhoto(photo, positiveTerms, negativeTerms),
      })
    }

    const bestSoFar = ranked.reduce(
      (best, item) => (item.score > best.score ? item : best),
      ranked[0] ?? { score: -Infinity } as PexelsSearchResult
    )

    if (bestSoFar && bestSoFar.score >= MIN_ACCEPTABLE_SCORE) {
      break
    }
  }

  if (ranked.length === 0) return null

  ranked.sort((a, b) => b.score - a.score)
  return ranked[0]
}

export function isPexelsConfigured(): boolean {
  return Boolean(process.env.PEXELS_API_KEY?.trim())
}
