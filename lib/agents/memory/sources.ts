import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { KnowledgeSource, KnowledgeSourceType } from "@/lib/agents/memory/types"

let indexesEnsured = false

async function ensureSourceIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("agent_knowledge_sources")
  await col.createIndex({ ownerId: 1, updatedAt: -1 })
  await col.createIndex({ ownerId: 1, sourceType: 1, sourceId: 1 })
  indexesEnsured = true
}

export async function listKnowledgeSources(ownerId: string): Promise<KnowledgeSource[]> {
  await ensureSourceIndexes()
  const db = await getDatabase()

  const rows = await db
    .collection("agent_knowledge_sources")
    .find({ ownerId })
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray()

  return rows.map(toSource)
}

export async function getKnowledgeSource(
  sourceId: string,
  ownerId: string
): Promise<KnowledgeSource | null> {
  await ensureSourceIndexes()
  if (!ObjectId.isValid(sourceId)) return null

  const db = await getDatabase()
  const row = await db.collection("agent_knowledge_sources").findOne({
    _id: new ObjectId(sourceId),
    ownerId,
  })

  return row ? toSource(row) : null
}

export async function upsertKnowledgeSource(input: {
  ownerId: string
  sourceType: KnowledgeSourceType
  sourceId?: string
  title: string
  category?: string
  url?: string
  mimeType?: string
  status: KnowledgeSource["status"]
  chunkCount?: number
  error?: string
  metadata?: Record<string, unknown>
}): Promise<KnowledgeSource> {
  await ensureSourceIndexes()
  const db = await getDatabase()
  const now = new Date()

  const filter: Record<string, unknown> = {
    ownerId: input.ownerId,
    sourceType: input.sourceType,
  }
  if (input.sourceId) {
    filter.sourceId = input.sourceId
  } else {
    filter.title = input.title
  }

  const update = {
    $set: {
      title: input.title,
      category: input.category,
      url: input.url,
      mimeType: input.mimeType,
      status: input.status,
      chunkCount: input.chunkCount ?? 0,
      error: input.error,
      metadata: input.metadata,
      updatedAt: now,
    },
    $setOnInsert: {
      ownerId: input.ownerId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      createdAt: now,
    },
  }

  const result = await db
    .collection("agent_knowledge_sources")
    .findOneAndUpdate(filter, update, { upsert: true, returnDocument: "after" })

  if (!result) {
    throw new Error("Failed to upsert knowledge source")
  }

  return toSource(result)
}

export async function deleteKnowledgeSource(sourceId: string, ownerId: string): Promise<boolean> {
  await ensureSourceIndexes()
  if (!ObjectId.isValid(sourceId)) return false

  const db = await getDatabase()
  const objectId = new ObjectId(sourceId)

  await db.collection("agent_knowledge_chunks").deleteMany({
    ownerId,
    sourceId: objectId,
  })

  const result = await db.collection("agent_knowledge_sources").deleteOne({
    _id: objectId,
    ownerId,
  })

  return result.deletedCount > 0
}

function toSource(row: {
  _id: ObjectId
  ownerId: string
  sourceType: KnowledgeSourceType
  sourceId?: string
  title: string
  category?: string
  url?: string
  mimeType?: string
  status: KnowledgeSource["status"]
  chunkCount?: number
  error?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}): KnowledgeSource {
  return {
    id: row._id.toString(),
    ownerId: row.ownerId,
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    title: row.title,
    category: row.category,
    url: row.url,
    mimeType: row.mimeType,
    status: row.status,
    chunkCount: row.chunkCount ?? 0,
    error: row.error,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
