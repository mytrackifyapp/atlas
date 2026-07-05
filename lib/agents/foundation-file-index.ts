import { ingestTextContent } from "@/lib/agents/memory/ingest"
import { extractTextFromUrl, isIndexableMimeType } from "@/lib/documents/extract-text"
import { resolveAgentId } from "@/lib/ai-agents-catalog"

export async function indexAgentSetupFile(input: {
  ownerId: string
  agentId: string
  fileName: string
  url: string
  mimeType?: string
  fileKey: string
}): Promise<void> {
  const agentId = resolveAgentId(input.agentId)
  if (!isIndexableMimeType(input.mimeType, input.fileName)) return

  try {
    const text = await extractTextFromUrl(input.url, input.mimeType, input.fileName)
    if (!text?.trim()) return

    await ingestTextContent({
      ownerId: input.ownerId,
      title: input.fileName,
      content: text,
      sourceType: "document",
      sourceId: `agent-setup:${agentId}:${input.fileKey}`,
      category: "sales-setup",
      url: input.url,
      mimeType: input.mimeType,
    })
  } catch (error) {
    console.error("Agent setup file indexing failed:", error)
  }
}
