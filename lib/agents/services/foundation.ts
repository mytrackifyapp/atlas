import { randomUUID } from "crypto"

import { resolveAgentId } from "@/lib/ai-agents-catalog"
import { emptyFoundationFields } from "@/lib/agents/foundation-config"
import type { AgentFoundationRecord, FoundationAttachment } from "@/lib/agents/foundation-prompt"
import { getDatabase } from "@/lib/db"

function normalizeAttachments(value: unknown): FoundationAttachment[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as Record<string, unknown>
      const url = typeof row.url === "string" ? row.url.trim() : ""
      const name = typeof row.name === "string" ? row.name.trim() : ""
      if (!url || !name) return null
      return {
        id: typeof row.id === "string" ? row.id : randomUUID(),
        name,
        url,
        mimeType: typeof row.mimeType === "string" ? row.mimeType : undefined,
        sizeBytes: typeof row.sizeBytes === "number" ? row.sizeBytes : undefined,
        uploadedAt: typeof row.uploadedAt === "string" ? row.uploadedAt : undefined,
      } satisfies FoundationAttachment
    })
    .filter((item): item is FoundationAttachment => item !== null)
}

export async function getAgentFoundation(
  ownerId: string,
  agentId: string,
): Promise<AgentFoundationRecord | null> {
  const resolved = resolveAgentId(agentId)
  const db = await getDatabase()
  const doc = await db.collection("agent_foundations").findOne({ ownerId, agentId: resolved })
  if (!doc) return null

  return {
    agentId: resolved,
    fields: { ...emptyFoundationFields(resolved), ...(doc.fields as Record<string, string>) },
    connectedTools: Array.isArray(doc.connectedTools) ? (doc.connectedTools as string[]) : [],
    attachments: normalizeAttachments(doc.attachments),
    updatedAt: doc.updatedAt?.toISOString?.() ?? undefined,
  }
}

export async function saveAgentFoundation(
  ownerId: string,
  agentId: string,
  input: {
    fields: Record<string, string>
    connectedTools: string[]
    attachments?: FoundationAttachment[]
  },
): Promise<AgentFoundationRecord> {
  const resolved = resolveAgentId(agentId)
  const db = await getDatabase()
  const now = new Date()

  const fields = Object.fromEntries(
    Object.entries(input.fields).map(([key, value]) => [key, String(value).trim()]),
  )
  const connectedTools = [...new Set(input.connectedTools.map((t) => t.trim()).filter(Boolean))]
  const attachments = normalizeAttachments(input.attachments ?? [])

  await db.collection("agent_foundations").updateOne(
    { ownerId, agentId: resolved },
    {
      $set: {
        ownerId,
        agentId: resolved,
        fields,
        connectedTools,
        attachments,
        updatedAt: now,
      },
    },
    { upsert: true },
  )

  return {
    agentId: resolved,
    fields: { ...emptyFoundationFields(resolved), ...fields },
    connectedTools,
    attachments,
    updatedAt: now.toISOString(),
  }
}
