import { openai } from "@ai-sdk/openai"
import { embed, embedMany } from "ai"

const EMBEDDING_MODEL = "text-embedding-3-small"

export function embeddingsConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim())
}

export async function embedQuery(text: string): Promise<number[] | null> {
  if (!embeddingsConfigured()) return null

  const result = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: text.trim(),
  })

  return result.embedding
}

export async function embedDocuments(texts: string[]): Promise<(number[] | null)[]> {
  if (!embeddingsConfigured() || texts.length === 0) {
    return texts.map(() => null)
  }

  const result = await embedMany({
    model: openai.embedding(EMBEDDING_MODEL),
    values: texts,
  })

  return result.embeddings
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
