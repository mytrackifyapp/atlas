import { getDatabase } from "@/lib/db"

export type DealSummary = {
  id: string
  name: string
  tagline: string
  sector: string
  stage: string
  status: string
  score: number
  asking: number | null
  valuation: number | null
  location: string
  highlights: string[]
}

export async function listDealFlow(
  ownerId: string,
  limit = 20
): Promise<DealSummary[]> {
  const db = await getDatabase()
  const rows = await db
    .collection("deal_flow_deals")
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => ({
    id: row._id.toString(),
    name: row.name,
    tagline: row.tagline,
    sector: row.sector,
    stage: row.stage,
    status: row.status ?? "New",
    score: row.score ?? 0,
    asking: row.asking ?? null,
    valuation: row.valuation ?? null,
    location: row.location,
    highlights: row.highlights ?? [],
  }))
}
