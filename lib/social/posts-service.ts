import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type {
  CreateSocialPostInput,
  SocialPost,
  SocialPostStatus,
  SocialTemplateId,
  UpdateSocialPostInput,
} from "@/lib/social/types"
import { SOCIAL_POST_STATUSES } from "@/lib/social/types"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("social_posts")
  await col.createIndex({ ownerId: 1, updatedAt: -1 })
  await col.createIndex({ ownerId: 1, status: 1 })
  indexesEnsured = true
}

function toPost(row: {
  _id: ObjectId
  ownerId: string
  agentId?: string
  correlationId?: string
  platform: SocialPost["platform"]
  templateId: SocialTemplateId
  caption: string
  fields: SocialPost["fields"]
  status: SocialPostStatus
  assetUrl?: string
  assetWidth?: number
  assetHeight?: number
  renderError?: string
  approvalId?: string
  externalUrl?: string
  externalId?: string
  publishedAt?: string | null
  publishError?: string
  createdAt: Date
  updatedAt: Date
}): SocialPost {
  return {
    id: row._id.toString(),
    ownerId: row.ownerId,
    agentId: row.agentId,
    correlationId: row.correlationId as string | undefined,
    platform: row.platform,
    templateId: row.templateId,
    caption: row.caption,
    fields: row.fields ?? {},
    status: row.status,
    assetUrl: row.assetUrl,
    assetWidth: row.assetWidth,
    assetHeight: row.assetHeight,
    renderError: row.renderError,
    approvalId: row.approvalId,
    externalUrl: row.externalUrl,
    externalId: row.externalId,
    publishedAt: row.publishedAt ?? null,
    publishError: row.publishError,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function listSocialPosts(
  ownerId: string,
  options?: { status?: SocialPostStatus; limit?: number }
): Promise<SocialPost[]> {
  await ensureIndexes()
  const db = await getDatabase()

  const filter: Record<string, unknown> = { ownerId }
  if (options?.status) filter.status = options.status

  const limit = Math.min(50, Math.max(1, options?.limit ?? 25))

  const rows = await db
    .collection("social_posts")
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => toPost(row as Parameters<typeof toPost>[0]))
}

export async function getSocialPost(
  postId: string,
  ownerId: string
): Promise<SocialPost | null> {
  await ensureIndexes()
  if (!ObjectId.isValid(postId)) return null

  const db = await getDatabase()
  const row = await db.collection("social_posts").findOne({
    _id: new ObjectId(postId),
    ownerId,
  })

  return row ? toPost(row as Parameters<typeof toPost>[0]) : null
}

function normalizeCaption(caption: string): string {
  return caption.trim().toLowerCase().replace(/\s+/g, " ")
}

export async function findRecentDuplicatePost(
  ownerId: string,
  input: {
    platform: SocialPost["platform"]
    templateId: SocialTemplateId
    caption: string
    correlationId?: string
  },
  withinMs = 5 * 60 * 1000
): Promise<SocialPost | null> {
  await ensureIndexes()
  const db = await getDatabase()
  const since = new Date(Date.now() - withinMs)
  const normalized = normalizeCaption(input.caption)

  const filter: Record<string, unknown> = {
    ownerId,
    platform: input.platform,
    templateId: input.templateId,
    updatedAt: { $gte: since },
  }

  if (input.correlationId) {
    filter.correlationId = input.correlationId
  }

  const rows = await db
    .collection("social_posts")
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(input.correlationId ? 5 : 20)
    .toArray()

  const match = rows.find(
    (row) => normalizeCaption(String(row.caption ?? "")) === normalized
  )

  return match ? toPost(match as Parameters<typeof toPost>[0]) : null
}

export async function createSocialPost(
  ownerId: string,
  input: CreateSocialPostInput
): Promise<SocialPost> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()

  const caption = input.caption.trim()
  if (!caption) {
    throw new Error("Caption is required")
  }

  const doc = {
    ownerId,
    agentId: input.agentId,
    correlationId: input.correlationId,
    platform: input.platform,
    templateId: input.templateId,
    caption,
    fields: input.fields ?? {},
    status: input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  }

  const result = await db.collection("social_posts").insertOne(doc)
  return toPost({ ...doc, _id: result.insertedId })
}

export async function updateSocialPost(
  postId: string,
  ownerId: string,
  input: UpdateSocialPostInput
): Promise<SocialPost | null> {
  await ensureIndexes()
  if (!ObjectId.isValid(postId)) return null

  const db = await getDatabase()
  const updates: Record<string, unknown> = { updatedAt: new Date() }

  if (input.caption !== undefined) updates.caption = input.caption.trim()
  if (input.platform !== undefined) updates.platform = input.platform
  if (input.templateId !== undefined) updates.templateId = input.templateId
  if (input.fields !== undefined) updates.fields = input.fields
  if (input.status !== undefined) {
    if (!SOCIAL_POST_STATUSES.includes(input.status)) {
      throw new Error(`Invalid status: ${input.status}`)
    }
    updates.status = input.status
  }
  if (input.assetUrl !== undefined) updates.assetUrl = input.assetUrl
  if (input.assetWidth !== undefined) updates.assetWidth = input.assetWidth
  if (input.assetHeight !== undefined) updates.assetHeight = input.assetHeight
  if (input.renderError !== undefined) {
    updates.renderError = input.renderError ?? undefined
  }
  if (input.approvalId !== undefined) {
    updates.approvalId = input.approvalId ?? undefined
  }
  if (input.externalUrl !== undefined) {
    updates.externalUrl = input.externalUrl ?? undefined
  }
  if (input.externalId !== undefined) {
    updates.externalId = input.externalId ?? undefined
  }
  if (input.publishedAt !== undefined) {
    updates.publishedAt = input.publishedAt ?? undefined
  }
  if (input.publishError !== undefined) {
    updates.publishError = input.publishError ?? undefined
  }

  const result = await db.collection("social_posts").findOneAndUpdate(
    { _id: new ObjectId(postId), ownerId },
    { $set: updates },
    { returnDocument: "after" }
  )

  return result ? toPost(result as Parameters<typeof toPost>[0]) : null
}

export async function deleteSocialPost(
  postId: string,
  ownerId: string
): Promise<boolean> {
  await ensureIndexes()
  if (!ObjectId.isValid(postId)) return false

  const db = await getDatabase()
  const result = await db.collection("social_posts").deleteOne({
    _id: new ObjectId(postId),
    ownerId,
  })
  return result.deletedCount === 1
}
