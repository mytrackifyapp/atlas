import { tool } from "ai"
import { z } from "zod"

import { ingestTextContent } from "@/lib/agents/memory/ingest"
import {
  embedQuery,
  embeddingsConfigured,
} from "@/lib/agents/memory/embeddings"
import { saveAgentMemory } from "@/lib/agents/memory/memories"
import { searchKnowledge } from "@/lib/agents/memory/search"
import { writeAuditLog } from "@/lib/agents/services/audit"
import {
  agentSupportsKnowledge,
  KNOWLEDGE_ENABLED_AGENTS,
} from "@/lib/agents/tool-map"
import { wrapToolWithPolicy } from "@/lib/agents/tools/wrap"
import type { ToolContext, ToolPolicy } from "@/lib/agents/tools/types"

export type KnowledgeToolName = "search_knowledge" | "save_memory"

const KNOWLEDGE_POLICIES: Record<KnowledgeToolName, ToolPolicy> = {
  search_knowledge: {
    id: "search_knowledge",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: KNOWLEDGE_ENABLED_AGENTS,
  },
  save_memory: {
    id: "save_memory",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: KNOWLEDGE_ENABLED_AGENTS.filter((id) => id !== "finna"),
  },
}

export function agentHasKnowledgeTools(agentId: string): boolean {
  return agentSupportsKnowledge(agentId)
}

export function getKnowledgeToolPolicy(toolId: KnowledgeToolName): ToolPolicy {
  return KNOWLEDGE_POLICIES[toolId]
}

export function createKnowledgeTools(
  ctx: ToolContext,
  correlationId?: string,
  conversationId?: string
) {
  if (!agentHasKnowledgeTools(ctx.agentId)) return {}

  const searchKnowledgeTool = tool({
    description:
      "Search the user's indexed knowledge base (workspace memos, uploaded notes, saved memories) for relevant context. Use before answering questions about company docs, memos, policies, or prior context.",
    inputSchema: z.object({
      query: z.string().min(1).describe("Natural language search query"),
      limit: z
        .union([z.string(), z.number()])
        .optional()
        .describe("Max results (default 6)"),
    }),
    execute: async ({ query, limit }) => {
      const parsedLimit =
        typeof limit === "number"
          ? limit
          : limit
            ? parseInt(String(limit), 10)
            : 6

      const result = await searchKnowledge({
        ownerId: ctx.userId,
        query,
        limit: Number.isFinite(parsedLimit) ? Math.min(10, Math.max(1, parsedLimit)) : 6,
        agentId: ctx.agentId,
      })

      return {
        mode: result.mode,
        embeddingsEnabled: result.embeddingsEnabled,
        hint: result.embeddingsEnabled
          ? undefined
          : "Vector search unavailable — using keyword search. Add OPENAI_API_KEY for semantic retrieval.",
        results: result.results.map((row) => ({
          title: row.title,
          category: row.category,
          sourceType: row.sourceType,
          score: Number(row.score.toFixed(3)),
          excerpt: row.content.slice(0, 600),
        })),
      }
    },
  })

  const saveMemoryTool = tool({
    description:
      "Save an important fact, preference, or summary to long-term memory for future retrieval. Use sparingly for durable user context.",
    inputSchema: z.object({
      content: z.string().min(1).describe("Memory to store"),
      memoryType: z
        .enum(["fact", "preference", "summary"])
        .optional()
        .describe("Type of memory (default: fact)"),
    }),
    execute: async ({ content, memoryType }) => {
      const embedding = await embedQuery(content)
      const memory = await saveAgentMemory({
        ownerId: ctx.userId,
        agentId: ctx.agentId,
        conversationId,
        memoryType: memoryType ?? "fact",
        content,
        embedding,
      })

      await writeAuditLog({
        ownerId: ctx.userId,
        agentId: ctx.agentId,
        action: "memory.saved",
        correlationId,
        conversationId,
        policyDecision: "allowed",
        metadata: { memoryId: memory.id, memoryType: memory.memoryType },
      })

      return {
        saved: true,
        memoryId: memory.id,
        memoryType: memory.memoryType,
      }
    },
  })

  return {
    search_knowledge: wrapToolWithPolicy(
      searchKnowledgeTool,
      KNOWLEDGE_POLICIES.search_knowledge,
      ctx,
      correlationId
    ),
    save_memory: wrapToolWithPolicy(
      saveMemoryTool,
      KNOWLEDGE_POLICIES.save_memory,
      ctx,
      correlationId
    ),
  }
}

export async function ingestKnowledgeNote(input: {
  ownerId: string
  title: string
  content: string
  category?: string
}) {
  return ingestTextContent({
    ownerId: input.ownerId,
    title: input.title,
    content: input.content,
    sourceType: "manual",
    category: input.category ?? "note",
  })
}

export function knowledgeStatusMessage(): string {
  return embeddingsConfigured()
    ? "Semantic search enabled (OpenAI embeddings)."
    : "Keyword search only — set OPENAI_API_KEY for vector RAG."
}
