import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import { redactMetadata } from "@/lib/agents/policies/redact"
import type { AgentEvent, AgentEventType } from "@/lib/agents/types"

let indexesEnsured = false

async function ensureEventIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("agent_events")
  await col.createIndex({ ownerId: 1, createdAt: -1 })
  await col.createIndex({ correlationId: 1 })
  await col.createIndex({ type: 1, createdAt: -1 })
  await col.createIndex({ fromAgentId: 1, toAgentId: 1, createdAt: -1 })
  indexesEnsured = true
}

export type PublishAgentEventInput = {
  ownerId: string
  type: AgentEventType
  fromAgentId: string
  toAgentId?: string
  correlationId?: string
  conversationId?: string
  runId?: string
  payload?: Record<string, unknown>
}

export async function publishAgentEvent(
  input: PublishAgentEventInput
): Promise<AgentEvent> {
  await ensureEventIndexes()
  const db = await getDatabase()
  const now = new Date()

  const doc = {
    ownerId: input.ownerId,
    type: input.type,
    fromAgentId: input.fromAgentId,
    toAgentId: input.toAgentId,
    correlationId: input.correlationId,
    conversationId: input.conversationId,
    runId: input.runId,
    payload: redactMetadata(input.payload),
    createdAt: now,
  }

  const res = await db.collection("agent_events").insertOne(doc)

  return {
    id: res.insertedId.toString(),
    ...doc,
  }
}

export async function listAgentEvents(
  ownerId: string,
  options?: {
    type?: AgentEventType
    correlationId?: string
    limit?: number
    cursor?: Date
  }
) {
  await ensureEventIndexes()
  const db = await getDatabase()
  const limit = options?.limit ?? 50

  const query: Record<string, unknown> = { ownerId }
  if (options?.type) query.type = options.type
  if (options?.correlationId) query.correlationId = options.correlationId
  if (options?.cursor) query.createdAt = { $lt: options.cursor }

  const rows = await db
    .collection("agent_events")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => ({
    id: row._id.toString(),
    ownerId: row.ownerId,
    type: row.type as AgentEventType,
    fromAgentId: row.fromAgentId,
    toAgentId: row.toAgentId,
    correlationId: row.correlationId,
    conversationId: row.conversationId,
    runId: row.runId,
    payload: row.payload,
    createdAt: row.createdAt,
  }))
}

export async function getAgentEvent(eventId: string, ownerId: string) {
  await ensureEventIndexes()
  const db = await getDatabase()

  if (!ObjectId.isValid(eventId)) return null

  const row = await db.collection("agent_events").findOne({
    _id: new ObjectId(eventId),
    ownerId,
  })

  if (!row) return null

  return {
    id: row._id.toString(),
    ownerId: row.ownerId,
    type: row.type as AgentEventType,
    fromAgentId: row.fromAgentId,
    toAgentId: row.toAgentId,
    correlationId: row.correlationId,
    conversationId: row.conversationId,
    runId: row.runId,
    payload: row.payload,
    createdAt: row.createdAt,
  }
}
