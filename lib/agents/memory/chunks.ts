import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { KnowledgeSourceType } from "@/lib/agents/memory/types"

let indexesEnsured = false

async function ensureChunkIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("agent_knowledge_chunks")
  await col.createIndex({ ownerId: 1, sourceId: 1 })
  await col.createIndex({ ownerId: 1, createdAt: -1 })
  try {
    await col.createIndex({ content: "text", "metadata.title": "text" })
  } catch {
    // text index may already exist with different options
  }
  indexesEnsured = true
}

export async function deleteChunksForSource(sourceId: string, ownerId: string) {
  await ensureChunkIndexes()
  const db = await getDatabase()
  if (!ObjectId.isValid(sourceId)) return

  await db.collection("agent_knowledge_chunks").deleteMany({
    ownerId,
    sourceId: new ObjectId(sourceId),
  })
}

export async function insertKnowledgeChunks(input: {
  ownerId: string
  sourceId: string
  chunks: Array<{
    content: string
    embedding?: number[] | null
    metadata?: {
      title?: string
      category?: string
      sourceType?: KnowledgeSourceType
      chunkIndex?: number
    }
  }>
}) {
  await ensureChunkIndexes()
  if (input.chunks.length === 0) return 0

  const db = await getDatabase()
  const now = new Date()
  const sourceObjectId = new ObjectId(input.sourceId)

  const docs = input.chunks.map((chunk) => ({
    ownerId: input.ownerId,
    sourceId: sourceObjectId,
    content: chunk.content,
    ...(chunk.embedding ? { embedding: chunk.embedding } : {}),
    metadata: chunk.metadata,
    createdAt: now,
  }))

  const result = await db.collection("agent_knowledge_chunks").insertMany(docs)
  return result.insertedCount
}

export async function listChunksForOwner(
  ownerId: string,
  options?: { limit?: number; sourceId?: string }
) {
  await ensureChunkIndexes()
  const db = await getDatabase()
  const limit = options?.limit ?? 500

  const query: Record<string, unknown> = { ownerId }
  if (options?.sourceId && ObjectId.isValid(options.sourceId)) {
    query.sourceId = new ObjectId(options.sourceId)
  }

  return db
    .collection("agent_knowledge_chunks")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export async function textSearchChunks(
  ownerId: string,
  query: string,
  limit = 8
) {
  await ensureChunkIndexes()
  const db = await getDatabase()

  try {
    const rows = await db
      .collection("agent_knowledge_chunks")
      .find(
        { ownerId, $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .toArray()

    if (rows.length > 0) return rows
  } catch {
    // fall through to regex search
  }

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 6)

  if (terms.length === 0) return []

  const regex = terms.map((t) => `(?=.*${escapeRegex(t)})`).join("")
  return db
    .collection("agent_knowledge_chunks")
    .find({
      ownerId,
      content: { $regex: regex, $options: "i" },
    })
    .limit(limit)
    .toArray()
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
