export type KnowledgeSourceType =
  | "manual"
  | "workspace"
  | "document"
  | "memory"

export type KnowledgeSourceStatus = "pending" | "indexed" | "failed"

export type KnowledgeSource = {
  id: string
  ownerId: string
  sourceType: KnowledgeSourceType
  sourceId?: string
  title: string
  category?: string
  url?: string
  mimeType?: string
  status: KnowledgeSourceStatus
  chunkCount: number
  error?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type KnowledgeChunk = {
  id: string
  ownerId: string
  sourceId: string
  content: string
  embedding?: number[]
  metadata?: {
    title?: string
    category?: string
    sourceType?: KnowledgeSourceType
    chunkIndex?: number
  }
  createdAt: Date
}

export type AgentMemoryEntry = {
  id: string
  ownerId: string
  agentId?: string
  conversationId?: string
  memoryType: "fact" | "preference" | "summary"
  content: string
  embedding?: number[]
  createdAt: Date
}

export type KnowledgeSearchResult = {
  id: string
  content: string
  score: number
  title?: string
  category?: string
  sourceType?: KnowledgeSourceType | "memory"
  sourceId?: string
}
