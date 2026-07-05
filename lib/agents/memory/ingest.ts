import { getDatabase } from "@/lib/db"
import { chunkText } from "@/lib/agents/memory/chunking"
import { deleteChunksForSource, insertKnowledgeChunks } from "@/lib/agents/memory/chunks"
import { embedDocuments } from "@/lib/agents/memory/embeddings"
import { upsertKnowledgeSource } from "@/lib/agents/memory/sources"
import {
  extractAllWorkspacesText,
  type WorkspaceDoc,
} from "@/lib/agents/memory/workspace-text"
import type { KnowledgeSource, KnowledgeSourceType } from "@/lib/agents/memory/types"

export async function ingestTextContent(input: {
  ownerId: string
  title: string
  content: string
  sourceType?: KnowledgeSourceType
  sourceId?: string
  category?: string
  url?: string
  mimeType?: string
}): Promise<KnowledgeSource> {
  const content = input.content.trim()
  if (!content) {
    throw new Error("Content is empty")
  }

  const sourceType = input.sourceType ?? "manual"

  const pending = await upsertKnowledgeSource({
    ownerId: input.ownerId,
    sourceType,
    sourceId: input.sourceId,
    title: input.title.trim(),
    category: input.category,
    url: input.url,
    mimeType: input.mimeType,
    status: "pending",
    chunkCount: 0,
  })

  try {
    await deleteChunksForSource(pending.id, input.ownerId)

    const pieces = chunkText(content)
    const embeddings = await embedDocuments(pieces)

    const inserted = await insertKnowledgeChunks({
      ownerId: input.ownerId,
      sourceId: pending.id,
      chunks: pieces.map((piece, index) => ({
        content: piece,
        embedding: embeddings[index],
        metadata: {
          title: input.title,
          category: input.category,
          sourceType,
          chunkIndex: index,
        },
      })),
    })

    return upsertKnowledgeSource({
      ownerId: input.ownerId,
      sourceType,
      sourceId: input.sourceId,
      title: input.title.trim(),
      category: input.category,
      url: input.url,
      mimeType: input.mimeType,
      status: "indexed",
      chunkCount: inserted,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Indexing failed"
    await upsertKnowledgeSource({
      ownerId: input.ownerId,
      sourceType,
      sourceId: input.sourceId,
      title: input.title.trim(),
      category: input.category,
      url: input.url,
      mimeType: input.mimeType,
      status: "failed",
      error: message,
      chunkCount: 0,
    })
    throw error
  }
}

export async function syncWorkspaceKnowledge(ownerId: string): Promise<{
  synced: number
  sources: KnowledgeSource[]
}> {
  const db = await getDatabase()
  const workspaces = (await db
    .collection("workspaces")
    .find({ ownerId })
    .toArray()) as WorkspaceDoc[]

  const extracted = extractAllWorkspacesText(workspaces)
  const sources: KnowledgeSource[] = []

  for (const item of extracted) {
    const source = await ingestTextContent({
      ownerId,
      title: item.title,
      content: item.content,
      sourceType: "workspace",
      sourceId: item.workspaceId,
      category: "workspace",
    })
    sources.push(source)
  }

  return { synced: sources.length, sources }
}
