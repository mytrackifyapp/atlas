import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { AgentRun, AgentRunStatus } from "@/lib/agents/types"

function toRun(doc: {
  _id: ObjectId
  ownerId: string
  agentId: string
  taskType: string
  status: AgentRunStatus
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  correlationId?: string
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}): AgentRun {
  return {
    id: doc._id.toString(),
    ownerId: doc.ownerId,
    agentId: doc.agentId,
    taskType: doc.taskType,
    status: doc.status,
    input: doc.input,
    output: doc.output,
    error: doc.error,
    correlationId: doc.correlationId,
    scheduledAt: doc.scheduledAt,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

let indexesEnsured = false

async function ensureRunIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("agent_runs")
  await col.createIndex({ ownerId: 1, createdAt: -1 })
  await col.createIndex({ status: 1, createdAt: -1 })
  await col.createIndex({ agentId: 1, ownerId: 1 })
  await col.createIndex({ "input.conversationId": 1, ownerId: 1, status: 1 })
  indexesEnsured = true
}

export async function createAgentRun(input: {
  ownerId: string
  agentId: string
  taskType: string
  status?: AgentRunStatus
  input?: Record<string, unknown>
  correlationId?: string
  scheduledAt?: Date
}): Promise<AgentRun> {
  await ensureRunIndexes()
  const db = await getDatabase()
  const now = new Date()
  const doc = {
    ownerId: input.ownerId,
    agentId: input.agentId,
    taskType: input.taskType,
    status: input.status ?? "planned",
    input: input.input,
    correlationId: input.correlationId,
    scheduledAt: input.scheduledAt,
    createdAt: now,
    updatedAt: now,
  }
  const res = await db.collection("agent_runs").insertOne(doc)
  return toRun({ _id: res.insertedId, ...doc })
}

export async function updateAgentRun(
  runId: string,
  patch: Partial<{
    status: AgentRunStatus
    output: Record<string, unknown>
    error: string
    startedAt: Date
    completedAt: Date
  }>
): Promise<AgentRun | null> {
  if (!ObjectId.isValid(runId)) return null
  await ensureRunIndexes()
  const db = await getDatabase()
  const result = await db.collection("agent_runs").findOneAndUpdate(
    { _id: new ObjectId(runId) },
    { $set: { ...patch, updatedAt: new Date() } },
    { returnDocument: "after" }
  )
  if (!result) return null
  return toRun(result as Parameters<typeof toRun>[0])
}

export async function getAgentRun(
  runId: string,
  ownerId: string
): Promise<AgentRun | null> {
  if (!ObjectId.isValid(runId)) return null
  await ensureRunIndexes()
  const db = await getDatabase()
  const doc = await db.collection("agent_runs").findOne({
    _id: new ObjectId(runId),
    ownerId,
  })
  if (!doc) return null
  return toRun(doc as Parameters<typeof toRun>[0])
}

export async function listAgentRuns(
  ownerId: string,
  options?: {
    agentId?: string
    limit?: number
    status?: AgentRunStatus | AgentRunStatus[]
    taskType?: string
    conversationId?: string
  }
): Promise<AgentRun[]> {
  await ensureRunIndexes()
  const db = await getDatabase()
  const query: Record<string, unknown> = { ownerId }
  if (options?.agentId) query.agentId = options.agentId
  if (options?.taskType) query.taskType = options.taskType
  if (options?.status) {
    query.status = Array.isArray(options.status)
      ? { $in: options.status }
      : options.status
  }
  if (options?.conversationId) {
    query["input.conversationId"] = options.conversationId
  }

  const rows = await db
    .collection("agent_runs")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(options?.limit ?? 50)
    .toArray()

  return rows.map((doc) => toRun(doc as Parameters<typeof toRun>[0]))
}

export async function listActiveChatTasks(
  ownerId: string,
  options?: { agentId?: string; conversationId?: string }
): Promise<AgentRun[]> {
  return listAgentRuns(ownerId, {
    taskType: "chat_task",
    status: ["planned", "running"],
    agentId: options?.agentId,
    conversationId: options?.conversationId,
    limit: 20,
  })
}

export async function findOwnerIdsWithAgentInstalled(
  agentId: string
): Promise<string[]> {
  const db = await getDatabase()
  const rows = await db
    .collection("installed_agents")
    .find({
      agentId,
      $or: [{ enabled: true }, { enabled: { $exists: false } }],
    })
    .toArray()
  return [...new Set(rows.map((r) => String(r.ownerId)))]
}
