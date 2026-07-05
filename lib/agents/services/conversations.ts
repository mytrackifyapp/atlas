import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { AgentChatMessage, AgentConversation, AgentMessage } from "@/lib/agents/types"

function toConversation(doc: {
  _id: ObjectId
  ownerId: string
  agentId: string
  title?: string
  createdAt: Date
  updatedAt: Date
}): AgentConversation {
  return {
    id: doc._id.toString(),
    ownerId: doc.ownerId,
    agentId: doc.agentId,
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function toMessage(doc: {
  _id: ObjectId
  conversationId: ObjectId
  ownerId: string
  agentId: string
  role: string
  content: string
  metadata?: AgentMessage["metadata"]
  createdAt: Date
}): AgentMessage {
  return {
    id: doc._id.toString(),
    conversationId: doc.conversationId.toString(),
    ownerId: doc.ownerId,
    agentId: doc.agentId,
    role: doc.role as AgentMessage["role"],
    content: doc.content,
    metadata: doc.metadata,
    createdAt: doc.createdAt,
  }
}

export async function getOrCreateConversation(
  ownerId: string,
  agentId: string
): Promise<AgentConversation> {
  const db = await getDatabase()
  const col = db.collection("agent_conversations")

  const existing = await col.findOne(
    { ownerId, agentId },
    { sort: { updatedAt: -1 } }
  )

  if (existing) {
    return toConversation(existing as Parameters<typeof toConversation>[0])
  }

  const now = new Date()
  const doc = {
    ownerId,
    agentId,
    createdAt: now,
    updatedAt: now,
  }
  const res = await col.insertOne(doc)
  return toConversation({ _id: res.insertedId, ...doc })
}

export async function createConversation(
  ownerId: string,
  agentId: string
): Promise<AgentConversation> {
  const db = await getDatabase()
  const now = new Date()
  const doc = {
    ownerId,
    agentId,
    createdAt: now,
    updatedAt: now,
  }
  const res = await db.collection("agent_conversations").insertOne(doc)
  return toConversation({ _id: res.insertedId, ...doc })
}

export async function listConversations(
  ownerId: string,
  agentId?: string
): Promise<AgentConversation[]> {
  const db = await getDatabase()
  const query: Record<string, string> = { ownerId }
  if (agentId) query.agentId = agentId

  const rows = await db
    .collection("agent_conversations")
    .find(query)
    .sort({ updatedAt: -1 })
    .limit(50)
    .toArray()

  return rows.map((doc) =>
    toConversation(doc as Parameters<typeof toConversation>[0])
  )
}

export async function getConversation(
  conversationId: string,
  ownerId: string
): Promise<AgentConversation | null> {
  if (!ObjectId.isValid(conversationId)) return null

  const db = await getDatabase()
  const doc = await db.collection("agent_conversations").findOne({
    _id: new ObjectId(conversationId),
    ownerId,
  })

  if (!doc) return null
  return toConversation(doc as Parameters<typeof toConversation>[0])
}

export async function getConversationMessages(
  conversationId: string,
  ownerId: string
): Promise<AgentChatMessage[]> {
  if (!ObjectId.isValid(conversationId)) return []

  const conversation = await getConversation(conversationId, ownerId)
  if (!conversation) return []

  const db = await getDatabase()
  const rows = await db
    .collection("agent_messages")
    .find({
      conversationId: new ObjectId(conversationId),
      ownerId,
      role: { $in: ["user", "assistant"] },
    })
    .sort({ createdAt: 1 })
    .toArray()

  return rows.map((doc) => ({
    role: doc.role as "user" | "assistant",
    content: String(doc.content ?? ""),
  }))
}

export async function listStoredMessages(
  conversationId: string,
  ownerId: string
): Promise<AgentMessage[]> {
  if (!ObjectId.isValid(conversationId)) return []

  const conversation = await getConversation(conversationId, ownerId)
  if (!conversation) return []

  const db = await getDatabase()
  const rows = await db
    .collection("agent_messages")
    .find({
      conversationId: new ObjectId(conversationId),
      ownerId,
      role: { $in: ["user", "assistant"] },
    })
    .sort({ createdAt: 1 })
    .toArray()

  return rows.map((doc) =>
    toMessage(doc as Parameters<typeof toMessage>[0])
  )
}

export async function saveMessage(input: {
  conversationId: string
  ownerId: string
  agentId: string
  role: "user" | "assistant"
  content: string
  metadata?: AgentMessage["metadata"]
}): Promise<AgentMessage> {
  if (!ObjectId.isValid(input.conversationId)) {
    throw new Error("Invalid conversationId")
  }

  const db = await getDatabase()
  const now = new Date()
  const conversationObjectId = new ObjectId(input.conversationId)

  const doc = {
    conversationId: conversationObjectId,
    ownerId: input.ownerId,
    agentId: input.agentId,
    role: input.role,
    content: input.content,
    metadata: input.metadata,
    createdAt: now,
  }

  const res = await db.collection("agent_messages").insertOne(doc)

  await db.collection("agent_conversations").updateOne(
    { _id: conversationObjectId, ownerId: input.ownerId },
    { $set: { updatedAt: now } }
  )

  return toMessage({ _id: res.insertedId, ...doc })
}
