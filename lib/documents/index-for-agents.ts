import { ingestTextContent } from "@/lib/agents/memory/ingest"
import { extractTextFromUrl, isIndexableMimeType } from "@/lib/documents/extract-text"
import type { DataRoomDocument } from "@/lib/documents/types"
import { updateDocumentIndexStatus } from "@/lib/documents/service"

export async function indexDocumentForAgents(
  document: DataRoomDocument
): Promise<DataRoomDocument> {
  if (!isIndexableMimeType(document.mimeType, document.name)) {
    return updateDocumentIndexStatus(document.id, document.ownerId, {
      indexStatus: "unsupported",
      indexError: "This file type cannot be indexed for AI search yet",
    })
  }

  await updateDocumentIndexStatus(document.id, document.ownerId, {
    indexStatus: "pending",
    indexError: undefined,
  })

  try {
    const text = await extractTextFromUrl(
      document.url,
      document.mimeType,
      document.name
    )

    if (!text) {
      throw new Error("No extractable text found in document")
    }

    const source = await ingestTextContent({
      ownerId: document.ownerId,
      title: document.name,
      content: text,
      sourceType: "document",
      sourceId: document.id,
      category: document.category.toLowerCase(),
      url: document.url,
      mimeType: document.mimeType,
    })

    return updateDocumentIndexStatus(document.id, document.ownerId, {
      indexStatus: "indexed",
      knowledgeSourceId: source.id,
      indexError: undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Indexing failed"
    const status = message.toLowerCase().includes("not supported")
      ? "unsupported"
      : "failed"

    return updateDocumentIndexStatus(document.id, document.ownerId, {
      indexStatus: status,
      indexError: message,
    })
  }
}
