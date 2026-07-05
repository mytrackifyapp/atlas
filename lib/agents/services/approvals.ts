import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { AgentApproval, AgentApprovalStatus } from "@/lib/agents/types"

function toApproval(doc: {
  _id: ObjectId
  ownerId: string
  agentId: string
  toolId: string
  status: AgentApprovalStatus
  correlationId?: string
  runId?: string
  input?: Record<string, unknown>
  reason?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}): AgentApproval {
  return {
    id: doc._id.toString(),
    ownerId: doc.ownerId,
    agentId: doc.agentId,
    toolId: doc.toolId,
    status: doc.status,
    correlationId: doc.correlationId,
    runId: doc.runId,
    input: doc.input,
    reason: doc.reason,
    resolvedAt: doc.resolvedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

let indexesEnsured = false

async function ensureApprovalIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("agent_approvals")
  await col.createIndex({ ownerId: 1, status: 1, createdAt: -1 })
  await col.createIndex({ correlationId: 1 })
  indexesEnsured = true
}

export async function createApprovalRequest(input: {
  ownerId: string
  agentId: string
  toolId: string
  correlationId?: string
  runId?: string
  input?: Record<string, unknown>
  reason?: string
}): Promise<AgentApproval> {
  await ensureApprovalIndexes()
  const db = await getDatabase()
  const now = new Date()
  const doc = {
    ownerId: input.ownerId,
    agentId: input.agentId,
    toolId: input.toolId,
    status: "pending" as const,
    correlationId: input.correlationId,
    runId: input.runId,
    input: input.input,
    reason: input.reason,
    createdAt: now,
    updatedAt: now,
  }
  const res = await db.collection("agent_approvals").insertOne(doc)
  return toApproval({ _id: res.insertedId, ...doc })
}

export async function resolveApproval(
  approvalId: string,
  ownerId: string,
  status: "approved" | "rejected",
  reason?: string
): Promise<AgentApproval | null> {
  if (!ObjectId.isValid(approvalId)) return null
  await ensureApprovalIndexes()
  const db = await getDatabase()
  const now = new Date()
  const result = await db.collection("agent_approvals").findOneAndUpdate(
    { _id: new ObjectId(approvalId), ownerId, status: "pending" },
    {
      $set: {
        status,
        reason: reason ?? undefined,
        resolvedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  )
  if (!result) return null
  return toApproval(result as Parameters<typeof toApproval>[0])
}

export async function listPendingApprovals(
  ownerId: string,
  limit = 50
): Promise<AgentApproval[]> {
  await ensureApprovalIndexes()
  const db = await getDatabase()
  const rows = await db
    .collection("agent_approvals")
    .find({ ownerId, status: "pending" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return rows.map((doc) => toApproval(doc as Parameters<typeof toApproval>[0]))
}

export async function listApprovals(
  ownerId: string,
  options?: { status?: AgentApprovalStatus; limit?: number }
): Promise<AgentApproval[]> {
  await ensureApprovalIndexes()
  const db = await getDatabase()
  const query: Record<string, unknown> = { ownerId }
  if (options?.status) query.status = options.status

  const rows = await db
    .collection("agent_approvals")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(options?.limit ?? 50)
    .toArray()

  return rows.map((doc) => toApproval(doc as Parameters<typeof toApproval>[0]))
}

export async function getApprovalById(
  approvalId: string,
  ownerId: string
): Promise<AgentApproval | null> {
  if (!ObjectId.isValid(approvalId)) return null
  await ensureApprovalIndexes()
  const db = await getDatabase()
  const row = await db.collection("agent_approvals").findOne({
    _id: new ObjectId(approvalId),
    ownerId,
  })
  return row ? toApproval(row as Parameters<typeof toApproval>[0]) : null
}

export async function countPendingApprovals(ownerId: string): Promise<number> {
  await ensureApprovalIndexes()
  const db = await getDatabase()
  return db.collection("agent_approvals").countDocuments({
    ownerId,
    status: "pending",
  })
}
