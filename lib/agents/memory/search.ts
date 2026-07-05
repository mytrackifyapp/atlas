import {
  cosineSimilarity,
  embedQuery,
  embeddingsConfigured,
} from "@/lib/agents/memory/embeddings"
import { listChunksForOwner, textSearchChunks } from "@/lib/agents/memory/chunks"
import { listAgentMemories, textSearchMemories } from "@/lib/agents/memory/memories"
import type { KnowledgeSearchResult } from "@/lib/agents/memory/types"

export async function searchKnowledge(input: {
  ownerId: string
  query: string
  limit?: number
  agentId?: string
}): Promise<{
  results: KnowledgeSearchResult[]
  mode: "vector" | "text"
  embeddingsEnabled: boolean
}> {
  const limit = input.limit ?? 6
  const query = input.query.trim()
  if (!query) {
    return { results: [], mode: "text", embeddingsEnabled: embeddingsConfigured() }
  }

  const embeddingsEnabled = embeddingsConfigured()
  const queryEmbedding = embeddingsEnabled ? await embedQuery(query) : null

  if (queryEmbedding) {
    const chunkRows = await listChunksForOwner(input.ownerId, { limit: 400 })
    const memoryRows = await listAgentMemories(input.ownerId, {
      agentId: input.agentId,
      limit: 100,
    })

    const scored: KnowledgeSearchResult[] = []

    for (const row of chunkRows) {
      const embedding = row.embedding as number[] | undefined
      if (!embedding?.length) continue
      scored.push({
        id: row._id.toString(),
        content: row.content as string,
        score: cosineSimilarity(queryEmbedding, embedding),
        title: row.metadata?.title as string | undefined,
        category: row.metadata?.category as string | undefined,
        sourceType: row.metadata?.sourceType as KnowledgeSearchResult["sourceType"],
        sourceId: (row.sourceId as { toString(): string })?.toString?.(),
      })
    }

    for (const row of memoryRows) {
      const embedding = row.embedding
      if (!embedding?.length) continue
      scored.push({
        id: row.id,
        content: row.content,
        score: cosineSimilarity(queryEmbedding, embedding),
        title: `Memory (${row.memoryType})`,
        sourceType: "memory",
        sourceId: row.id,
      })
    }

    scored.sort((a, b) => b.score - a.score)

    return {
      results: scored.slice(0, limit),
      mode: "vector",
      embeddingsEnabled: true,
    }
  }

  const [chunkRows, memoryRows] = await Promise.all([
    textSearchChunks(input.ownerId, query, limit),
    textSearchMemories(input.ownerId, query, Math.max(2, Math.floor(limit / 2))),
  ])

  const results: KnowledgeSearchResult[] = [
    ...chunkRows.map((row, index) => ({
      id: row._id.toString(),
      content: row.content as string,
      score: 1 - index * 0.05,
      title: row.metadata?.title as string | undefined,
      category: row.metadata?.category as string | undefined,
      sourceType: row.metadata?.sourceType as KnowledgeSearchResult["sourceType"],
      sourceId: (row.sourceId as { toString(): string })?.toString?.(),
    })),
    ...memoryRows.map((row, index) => ({
      id: row._id.toString(),
      content: row.content as string,
      score: 0.8 - index * 0.05,
      title: `Memory (${row.memoryType as string})`,
      sourceType: "memory" as const,
      sourceId: row._id.toString(),
    })),
  ]

  return {
    results: results.slice(0, limit),
    mode: "text",
    embeddingsEnabled: false,
  }
}
