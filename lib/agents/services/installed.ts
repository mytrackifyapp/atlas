import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"
import { getDatabase } from "@/lib/db"
import { isKnownAgentId } from "@/lib/agents/registry"

export async function ensureAgentInstalled(
  ownerId: string,
  agentId: string
): Promise<boolean> {
  if (!isKnownAgentId(agentId) || agentId === "finna") {
    return false
  }

  const db = await getDatabase()
  const col = db.collection("installed_agents")

  const existing = await col.findOne({ ownerId, agentId })
  if (existing) {
    if (existing.enabled === false) {
      await col.updateOne(
        { _id: existing._id },
        { $set: { enabled: true, updatedAt: new Date() } }
      )
    }
    return true
  }

  const now = new Date()
  await col.insertOne({
    ownerId,
    agentId,
    enabled: true,
    installedAt: now,
    updatedAt: now,
  })

  return true
}

export async function isAgentInstalled(
  ownerId: string,
  agentId: string
): Promise<boolean> {
  const db = await getDatabase()
  const doc = await db.collection("installed_agents").findOne({
    ownerId,
    agentId,
    $or: [{ enabled: true }, { enabled: { $exists: false } }],
  })
  return Boolean(doc)
}

export type InstalledAgentProfile = {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
}

export async function listInstalledAgentProfiles(
  ownerId: string
): Promise<InstalledAgentProfile[]> {
  const db = await getDatabase()
  const docs = await db
    .collection("installed_agents")
    .find({
      ownerId,
      $or: [{ enabled: true }, { enabled: { $exists: false } }],
    })
    .toArray()

  const installedIds = new Set(docs.map((d) => d.agentId as string))

  return AI_AGENTS_CATALOG.filter((agent) => installedIds.has(agent.id)).map(
    (agent) => ({
      id: agent.id,
      name: agent.name,
      category: agent.category,
      description: agent.description,
      tags: agent.tags,
    })
  )
}
