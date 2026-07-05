import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { AgentMemoryEntry } from "@/lib/agents/memory/types"

let indexesEnsured = false

async function ensureMemoryIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("agent_memory")
  await col.createIndex({ ownerId: 1, createdAt: -1 })
  await col.createIndex({ ownerId: 1, agentId: 1, createdAt: -1 })
  try {
    await col.createIndex({ content: "text" })
  } catch {
    // ignore
  }
  indexesEnsured = true
}

export async function saveAgentMemory(input: {
  ownerId: string
  agentId?: string
  conversationId?: string
  memoryType: AgentMemoryEntry["memoryType"]
  content: string
  embedding?: number[] | null
}): Promise<AgentMemoryEntry> {
  await ensureMemoryIndexes()
  const db = await getDatabase()
  const now = new Date()

  const doc = {
    ownerId: input.ownerId,
    agentId: input.agentId,
    conversationId: input.conversationId,
    memoryType: input.memoryType,
    content: input.content.trim(),
    ...(input.embedding ? { embedding: input.embedding } : {}),
    createdAt: now,
  }

  const result = await db.collection("agent_memory").insertOne(doc)

  return {
    id: result.insertedId.toString(),
    ownerId: doc.ownerId,
    agentId: doc.agentId,
    conversationId: doc.conversationId,
    memoryType: doc.memoryType,
    content: doc.content,
    embedding: doc.embedding,
    createdAt: doc.createdAt,
  }
}

export async function listAgentMemories(
  ownerId: string,
  options?: { agentId?: string; limit?: number }
): Promise<AgentMemoryEntry[]> {
  await ensureMemoryIndexes()
  const db = await getDatabase()
  const limit = options?.limit ?? 200

  const query: Record<string, unknown> = { ownerId }
  if (options?.agentId) query.agentId = options.agentId

  const rows = await db
    .collection("agent_memory")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => ({
    id: row._id.toString(),
    ownerId: row.ownerId,
    agentId: row.agentId,
    conversationId: row.conversationId,
    memoryType: row.memoryType,
    content: row.content,
    embedding: row.embedding,
    createdAt: row.createdAt,
  }))
}

export async function textSearchMemories(ownerId: string, query: string, limit = 4) {
  await ensureMemoryIndexes()
  const db = await getDatabase()

  try {
    const rows = await db
      .collection("agent_memory")
      .find(
        { ownerId, $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .toArray()

    if (rows.length > 0) return rows
  } catch {
    // fall through
  }

  return db
    .collection("agent_memory")
    .find({
      ownerId,
      content: { $regex: query.split(/\s+/).slice(0, 3).join("|"), $options: "i" },
    })
    .limit(limit)
    .toArray()
}

export async function deleteAgentMemory(memoryId: string, ownerId: string) {
  await ensureMemoryIndexes()
  if (!ObjectId.isValid(memoryId)) return false

  const db = await getDatabase()
  const result = await db.collection("agent_memory").deleteOne({
    _id: new ObjectId(memoryId),
    ownerId,
  })

  return result.deletedCount > 0
}
