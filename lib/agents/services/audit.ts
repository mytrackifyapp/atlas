import { getDatabase } from "@/lib/db"
import { redactMetadata } from "@/lib/agents/policies/redact"
import type { AgentAuditEntry } from "@/lib/agents/types"

let indexesEnsured = false

async function ensureAuditIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("agent_audit_log")
  await col.createIndex({ ownerId: 1, createdAt: -1 })
  await col.createIndex({ correlationId: 1 })
  await col.createIndex({ agentId: 1, createdAt: -1 })
  await col.createIndex({ action: 1, createdAt: -1 })
  indexesEnsured = true
}

export type WriteAuditInput = Omit<AgentAuditEntry, "createdAt"> & {
  actorType?: "user" | "agent" | "system"
}

export async function writeAuditLog(entry: WriteAuditInput): Promise<void> {
  await ensureAuditIndexes()
  const db = await getDatabase()

  const doc: AgentAuditEntry = {
    actorType: entry.actorType ?? "agent",
    actorId: entry.actorId ?? entry.agentId,
    ...entry,
    metadata: redactMetadata(entry.metadata),
    createdAt: new Date(),
  }

  await db.collection("agent_audit_log").insertOne(doc)
}

export async function listAuditLogs(
  ownerId: string,
  options?: { agentId?: string; limit?: number; cursor?: Date }
) {
  await ensureAuditIndexes()
  const db = await getDatabase()
  const limit = options?.limit ?? 50

  const query: Record<string, unknown> = { ownerId }
  if (options?.agentId) query.agentId = options.agentId
  if (options?.cursor) query.createdAt = { $lt: options.cursor }

  const rows = await db
    .collection("agent_audit_log")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => ({
    id: row._id.toString(),
    ownerId: row.ownerId,
    agentId: row.agentId,
    action: row.action,
    actorType: row.actorType ?? "agent",
    actorId: row.actorId,
    conversationId: row.conversationId,
    correlationId: row.correlationId,
    model: row.model,
    resource: row.resource,
    policyDecision: row.policyDecision,
    metadata: row.metadata,
    createdAt: row.createdAt,
  }))
}
