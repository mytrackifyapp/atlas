export const DOCUMENT_CATEGORIES = [
  "Fundraising",
  "Financials",
  "Legal",
  "Product",
  "Marketing",
] as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]

export type DocumentIndexStatus =
  | "pending"
  | "indexed"
  | "failed"
  | "unsupported"

export type DataRoomDocument = {
  id: string
  ownerId: string
  name: string
  category: DocumentCategory
  mimeType: string
  fileType: string
  sizeBytes: number
  url: string
  shared: boolean
  uploadedByName?: string
  uploadedByEmail?: string
  indexStatus: DocumentIndexStatus
  indexError?: string
  knowledgeSourceId?: string
  createdAt: Date
  updatedAt: Date
}
