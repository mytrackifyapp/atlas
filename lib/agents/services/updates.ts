import { getDatabase } from "@/lib/db"

export type InvestorUpdateSummary = {
  id: string
  title: string
  contentPreview: string
  recipientCount: number
  sentAt: string | null
  status: string
}

export async function listInvestorUpdates(
  userId: string,
  limit = 10
): Promise<InvestorUpdateSummary[]> {
  const db = await getDatabase()
  const rows = await db
    .collection("investor_updates")
    .find({ userId })
    .sort({ sentAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => ({
    id: row._id.toString(),
    title: row.title,
    contentPreview: String(row.content ?? "").slice(0, 300),
    recipientCount: Array.isArray(row.recipients) ? row.recipients.length : 0,
    sentAt: row.sentAt ? new Date(row.sentAt).toISOString() : null,
    status: row.status ?? "sent",
  }))
}
