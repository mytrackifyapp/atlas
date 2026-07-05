import { ObjectId } from "mongodb"

import { deleteKnowledgeSource } from "@/lib/agents/memory/sources"
import { getDatabase } from "@/lib/db"
import type {
  DataRoomDocument,
  DocumentCategory,
  DocumentIndexStatus,
} from "@/lib/documents/types"
import { displayFileType, inferMimeType } from "@/lib/documents/extract-text"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("data_room_documents")
  await col.createIndex({ ownerId: 1, updatedAt: -1 })
  await col.createIndex({ ownerId: 1, category: 1 })
  indexesEnsured = true
}

export async function listDocuments(ownerId: string): Promise<DataRoomDocument[]> {
  await ensureIndexes()
  const db = await getDatabase()
  const rows = await db
    .collection("data_room_documents")
    .find({ ownerId })
    .sort({ updatedAt: -1 })
    .toArray()

  return rows.map((row) => toDocument(row as Parameters<typeof toDocument>[0]))
}

export async function getDocument(
  documentId: string,
  ownerId: string
): Promise<DataRoomDocument | null> {
  await ensureIndexes()
  if (!ObjectId.isValid(documentId)) return null

  const db = await getDatabase()
  const row = await db.collection("data_room_documents").findOne({
    _id: new ObjectId(documentId),
    ownerId,
  })

  return row ? toDocument(row as Parameters<typeof toDocument>[0]) : null
}

export async function createDocumentFromUpload(input: {
  ownerId: string
  name: string
  category: DocumentCategory
  url: string
  mimeType?: string
  sizeBytes: number
  shared?: boolean
  uploadedByName?: string
  uploadedByEmail?: string
}): Promise<DataRoomDocument> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const mimeType = inferMimeType(input.name, input.mimeType)

  const doc = {
    ownerId: input.ownerId,
    name: input.name.trim(),
    category: input.category,
    mimeType,
    fileType: displayFileType(mimeType, input.name),
    sizeBytes: input.sizeBytes,
    url: input.url,
    shared: input.shared ?? false,
    uploadedByName: input.uploadedByName,
    uploadedByEmail: input.uploadedByEmail,
    indexStatus: "pending" as DocumentIndexStatus,
    createdAt: now,
    updatedAt: now,
  }

  const result = await db.collection("data_room_documents").insertOne(doc)
  return toDocument({ _id: result.insertedId, ...doc })
}

export async function updateDocumentIndexStatus(
  documentId: string,
  ownerId: string,
  patch: {
    indexStatus: DocumentIndexStatus
    indexError?: string
    knowledgeSourceId?: string
  }
): Promise<DataRoomDocument> {
  await ensureIndexes()
  if (!ObjectId.isValid(documentId)) {
    throw new Error("Invalid document id")
  }

  const db = await getDatabase()
  const result = await db.collection("data_room_documents").findOneAndUpdate(
    { _id: new ObjectId(documentId), ownerId },
    {
      $set: {
        indexStatus: patch.indexStatus,
        indexError: patch.indexError,
        knowledgeSourceId: patch.knowledgeSourceId,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  )

  if (!result) {
    throw new Error("Document not found")
  }

  return toDocument(result as Parameters<typeof toDocument>[0])
}

export async function deleteDocument(
  documentId: string,
  ownerId: string
): Promise<boolean> {
  await ensureIndexes()
  if (!ObjectId.isValid(documentId)) return false

  const db = await getDatabase()
  const existing = await db.collection("data_room_documents").findOne({
    _id: new ObjectId(documentId),
    ownerId,
  })

  if (!existing) return false

  if (existing.knowledgeSourceId && ObjectId.isValid(existing.knowledgeSourceId)) {
    await deleteKnowledgeSource(existing.knowledgeSourceId, ownerId)
  } else {
    const source = await db.collection("agent_knowledge_sources").findOne({
      ownerId,
      sourceType: "document",
      sourceId: documentId,
    })
    if (source) {
      await deleteKnowledgeSource(source._id.toString(), ownerId)
    }
  }

  const result = await db.collection("data_room_documents").deleteOne({
    _id: new ObjectId(documentId),
    ownerId,
  })

  return result.deletedCount > 0
}

function toDocument(row: {
  _id: ObjectId
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
}): DataRoomDocument {
  return {
    id: row._id.toString(),
    ownerId: row.ownerId,
    name: row.name,
    category: row.category,
    mimeType: row.mimeType,
    fileType: row.fileType,
    sizeBytes: row.sizeBytes,
    url: row.url,
    shared: row.shared,
    uploadedByName: row.uploadedByName,
    uploadedByEmail: row.uploadedByEmail,
    indexStatus: row.indexStatus,
    indexError: row.indexError,
    knowledgeSourceId: row.knowledgeSourceId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
