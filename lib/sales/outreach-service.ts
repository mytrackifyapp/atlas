import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import type {
  CreateOutreachInput,
  OutreachStatus,
  SalesOutreach,
} from "@/lib/sales/types"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("sales_outreach")
  await col.createIndex({ ownerId: 1, updatedAt: -1 })
  await col.createIndex({ ownerId: 1, leadId: 1 })
  await col.createIndex({ ownerId: 1, status: 1, scheduledFor: 1 })
  await col.createIndex({ sequenceGroupId: 1 })
  indexesEnsured = true
}

export async function listOutreach(
  ownerId: string,
  options?: {
    leadId?: string
    status?: OutreachStatus
    limit?: number
  }
): Promise<SalesOutreach[]> {
  await ensureIndexes()
  const db = await getDatabase()

  const filter: Record<string, unknown> = { ownerId }
  if (options?.leadId) filter.leadId = options.leadId
  if (options?.status) filter.status = options.status

  const rows = await db
    .collection("sales_outreach")
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(Math.min(100, options?.limit ?? 50))
    .toArray()

  return rows.map((row) => toOutreach(row as Parameters<typeof toOutreach>[0]))
}

export async function getOutreach(
  outreachId: string,
  ownerId: string
): Promise<SalesOutreach | null> {
  await ensureIndexes()
  if (!ObjectId.isValid(outreachId)) return null

  const db = await getDatabase()
  const row = await db.collection("sales_outreach").findOne({
    _id: new ObjectId(outreachId),
    ownerId,
  })

  return row ? toOutreach(row as Parameters<typeof toOutreach>[0]) : null
}

export async function createOutreach(
  ownerId: string,
  input: CreateOutreachInput
): Promise<SalesOutreach> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()

  const doc = {
    ownerId,
    leadId: input.leadId,
    agentId: input.agentId,
    channel: "email" as const,
    toEmail: input.toEmail.trim(),
    subject: input.subject.trim(),
    body: input.body.trim(),
    status: input.status ?? "draft",
    sequenceGroupId: input.sequenceGroupId,
    sequenceStep: input.sequenceStep,
    scheduledFor: input.scheduledFor ?? null,
    sentAt: null as Date | null,
    repliedAt: null as Date | null,
    approvalId: undefined as string | undefined,
    error: undefined as string | undefined,
    createdAt: now,
    updatedAt: now,
  }

  if (!doc.toEmail || !doc.subject || !doc.body) {
    throw new Error("Email, subject, and body are required")
  }

  const result = await db.collection("sales_outreach").insertOne(doc)
  return toOutreach({ _id: result.insertedId, ...doc })
}

export async function createOutreachSequence(
  ownerId: string,
  input: {
    leadId: string
    toEmail: string
    agentId?: string
    steps: Array<{ subject: string; body: string; delayDays?: number }>
  }
): Promise<{ sequenceGroupId: string; outreach: SalesOutreach[] }> {
  const sequenceGroupId = new ObjectId().toString()
  const created: SalesOutreach[] = []
  let cumulativeDays = 0

  for (let i = 0; i < input.steps.length; i++) {
    const step = input.steps[i]
    if (i > 0) {
      cumulativeDays += step.delayDays ?? 3
    }

    const scheduledFor =
      i === 0
        ? null
        : new Date(Date.now() + cumulativeDays * 24 * 60 * 60 * 1000)

    const outreach = await createOutreach(ownerId, {
      leadId: input.leadId,
      toEmail: input.toEmail,
      subject: step.subject,
      body: step.body,
      agentId: input.agentId,
      sequenceGroupId,
      sequenceStep: i + 1,
      status: i === 0 ? "draft" : "scheduled",
      scheduledFor,
    })
    created.push(outreach)
  }

  return { sequenceGroupId, outreach: created }
}

export async function updateOutreachContent(
  outreachId: string,
  ownerId: string,
  patch: { subject?: string; body?: string; toEmail?: string }
): Promise<SalesOutreach | null> {
  await ensureIndexes()
  if (!ObjectId.isValid(outreachId)) return null

  const set: Record<string, unknown> = { updatedAt: new Date() }
  if (patch.subject?.trim()) set.subject = patch.subject.trim()
  if (patch.body?.trim()) set.body = patch.body.trim()
  if (patch.toEmail?.trim()) set.toEmail = patch.toEmail.trim()
  if (Object.keys(set).length === 1) return getOutreach(outreachId, ownerId)

  const db = await getDatabase()
  const result = await db.collection("sales_outreach").findOneAndUpdate(
    {
      _id: new ObjectId(outreachId),
      ownerId,
      status: { $in: ["draft", "scheduled", "failed"] },
    },
    { $set: set },
    { returnDocument: "after" }
  )

  return result ? toOutreach(result as Parameters<typeof toOutreach>[0]) : null
}

export async function updateOutreachStatus(
  outreachId: string,
  ownerId: string,
  patch: {
    status?: OutreachStatus
    sentAt?: Date | null
    repliedAt?: Date | null
    approvalId?: string
    error?: string
  }
): Promise<SalesOutreach | null> {
  await ensureIndexes()
  if (!ObjectId.isValid(outreachId)) return null

  const db = await getDatabase()
  const result = await db.collection("sales_outreach").findOneAndUpdate(
    { _id: new ObjectId(outreachId), ownerId },
    {
      $set: {
        ...patch,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  )

  return result ? toOutreach(result as Parameters<typeof toOutreach>[0]) : null
}

export async function deleteOutreachForLead(
  leadId: string,
  ownerId: string
): Promise<number> {
  await ensureIndexes()
  const db = await getDatabase()
  const result = await db.collection("sales_outreach").deleteMany({
    ownerId,
    leadId,
  })
  return result.deletedCount
}

export async function deleteOutreach(
  outreachId: string,
  ownerId: string
): Promise<boolean> {
  await ensureIndexes()
  if (!ObjectId.isValid(outreachId)) return false

  const db = await getDatabase()
  const result = await db.collection("sales_outreach").deleteOne({
    _id: new ObjectId(outreachId),
    ownerId,
    status: { $in: ["draft", "scheduled", "cancelled", "failed"] },
  })

  return result.deletedCount > 0
}

export async function listDueScheduledOutreach(
  ownerId: string,
  limit = 20
): Promise<SalesOutreach[]> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()

  const rows = await db
    .collection("sales_outreach")
    .find({
      ownerId,
      status: "scheduled",
      scheduledFor: { $lte: now },
    })
    .sort({ scheduledFor: 1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => toOutreach(row as Parameters<typeof toOutreach>[0]))
}

export async function listOwnerIdsWithDueScheduledOutreach(): Promise<string[]> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()
  const ownerIds = await db.collection("sales_outreach").distinct("ownerId", {
    status: "scheduled",
    scheduledFor: { $lte: now },
  })
  return ownerIds as string[]
}

export async function cancelSequenceAfterReply(
  sequenceGroupId: string,
  ownerId: string
): Promise<number> {
  await ensureIndexes()
  const db = await getDatabase()
  const result = await db.collection("sales_outreach").updateMany(
    {
      ownerId,
      sequenceGroupId,
      status: { $in: ["draft", "scheduled"] },
    },
    {
      $set: { status: "cancelled", updatedAt: new Date() },
    }
  )
  return result.modifiedCount
}

function toOutreach(row: {
  _id: ObjectId
  ownerId: string
  leadId: string
  agentId?: string
  channel: "email"
  toEmail: string
  subject: string
  body: string
  status: OutreachStatus
  sequenceGroupId?: string
  sequenceStep?: number
  scheduledFor?: Date | null
  sentAt?: Date | null
  repliedAt?: Date | null
  approvalId?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}): SalesOutreach {
  return {
    id: row._id.toString(),
    ownerId: row.ownerId,
    leadId: row.leadId,
    agentId: row.agentId,
    channel: row.channel,
    toEmail: row.toEmail,
    subject: row.subject,
    body: row.body,
    status: row.status,
    sequenceGroupId: row.sequenceGroupId,
    sequenceStep: row.sequenceStep,
    scheduledFor: row.scheduledFor?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
    repliedAt: row.repliedAt?.toISOString() ?? null,
    approvalId: row.approvalId,
    error: row.error,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
