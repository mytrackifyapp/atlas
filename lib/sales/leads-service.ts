import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"
import { findMatchingSalesLeads } from "@/lib/sales/lead-matching"
import { deleteOutreachForLead } from "@/lib/sales/outreach-service"
import type {
  CreateSalesLeadInput,
  SalesLead,
  SalesLeadStage,
  SalesPipelineStats,
  UpdateSalesLeadInput,
} from "@/lib/sales/types"
import { SALES_LEAD_STAGES } from "@/lib/sales/types"

let indexesEnsured = false

async function ensureIndexes() {
  if (indexesEnsured) return
  const db = await getDatabase()
  const col = db.collection("sales_leads")
  await col.createIndex({ ownerId: 1, updatedAt: -1 })
  await col.createIndex({ ownerId: 1, stage: 1 })
  await col.createIndex({ ownerId: 1, company: 1 })
  await col.createIndex({ ownerId: 1, email: 1 })
  indexesEnsured = true
}

export async function listSalesLeads(
  ownerId: string,
  options?: {
    stage?: SalesLeadStage
    segment?: string
    search?: string
    limit?: number
  }
): Promise<SalesLead[]> {
  await ensureIndexes()
  const db = await getDatabase()

  const filter: Record<string, unknown> = { ownerId }
  if (options?.stage) filter.stage = options.stage
  if (options?.segment?.trim()) filter.segment = options.segment.trim()

  if (options?.search?.trim()) {
    const q = options.search.trim()
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ]
  }

  const limit = Math.min(100, Math.max(1, options?.limit ?? 50))

  const rows = await db
    .collection("sales_leads")
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray()

  return rows.map((row) => toLead(row as Parameters<typeof toLead>[0]))
}

export async function getSalesLead(
  leadId: string,
  ownerId: string
): Promise<SalesLead | null> {
  await ensureIndexes()
  if (!ObjectId.isValid(leadId)) return null

  const db = await getDatabase()
  const row = await db.collection("sales_leads").findOne({
    _id: new ObjectId(leadId),
    ownerId,
  })

  return row ? toLead(row as Parameters<typeof toLead>[0]) : null
}

export type CreateSalesLeadResult = {
  lead: SalesLead
  created: boolean
  matchedOn?: "email" | "name" | "company"
}

export async function createSalesLead(
  ownerId: string,
  input: CreateSalesLeadInput
): Promise<CreateSalesLeadResult> {
  await ensureIndexes()
  const db = await getDatabase()
  const now = new Date()

  const doc = {
    ownerId,
    name: input.name.trim(),
    company: input.company.trim(),
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    title: input.title?.trim() || undefined,
    linkedinUrl: input.linkedinUrl?.trim() || undefined,
    website: input.website?.trim() || undefined,
    segment: input.segment?.trim() || undefined,
    source: input.source ?? "Manual",
    stage: input.stage ?? "New",
    score: clampScore(input.score ?? 0),
    researchSummary: input.researchSummary?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    lastContact: null as string | null,
    createdAt: now,
    updatedAt: now,
  }

  if (!doc.name || !doc.company) {
    throw new Error("Name and company are required")
  }

  const duplicates = await findMatchingSalesLeads(
    ownerId,
    {
      name: doc.name,
      email: doc.email,
      company: doc.company,
    },
    3
  )

  const strongDuplicate = duplicates.find(
    (match) =>
      match.matchScore >= 85 ||
      (doc.email &&
        match.email &&
        match.email.toLowerCase() === doc.email.toLowerCase())
  )

  if (strongDuplicate) {
    return {
      lead: strongDuplicate,
      created: false,
      matchedOn: strongDuplicate.matchReason,
    }
  }

  const result = await db.collection("sales_leads").insertOne(doc)
  return {
    lead: toLead({ _id: result.insertedId, ...doc }),
    created: true,
  }
}

export async function createSalesLeadsBulk(
  ownerId: string,
  leads: CreateSalesLeadInput[]
): Promise<{ created: number; leads: SalesLead[] }> {
  const created: SalesLead[] = []
  for (const lead of leads) {
    if (!lead.name?.trim() || !lead.company?.trim()) continue
    const result = await createSalesLead(ownerId, {
      ...lead,
      source: lead.source ?? "Import",
    })
    if (result.created) created.push(result.lead)
  }
  return { created: created.length, leads: created }
}

export async function updateSalesLead(
  leadId: string,
  ownerId: string,
  patch: UpdateSalesLeadInput
): Promise<SalesLead | null> {
  await ensureIndexes()
  if (!ObjectId.isValid(leadId)) return null

  const db = await getDatabase()
  const $set: Record<string, unknown> = { updatedAt: new Date() }

  if (patch.name !== undefined) $set.name = patch.name.trim()
  if (patch.company !== undefined) $set.company = patch.company.trim()
  if (patch.email !== undefined) $set.email = patch.email?.trim() || null
  if (patch.phone !== undefined) $set.phone = patch.phone?.trim() || null
  if (patch.title !== undefined) $set.title = patch.title?.trim() || null
  if (patch.linkedinUrl !== undefined) {
    $set.linkedinUrl = patch.linkedinUrl?.trim() || null
  }
  if (patch.website !== undefined) $set.website = patch.website?.trim() || null
  if (patch.segment !== undefined) $set.segment = patch.segment?.trim() || null
  if (patch.source !== undefined) $set.source = patch.source
  if (patch.stage !== undefined) $set.stage = patch.stage
  if (patch.score !== undefined) $set.score = clampScore(patch.score)
  if (patch.researchSummary !== undefined) {
    $set.researchSummary = patch.researchSummary?.trim() || null
  }
  if (patch.notes !== undefined) $set.notes = patch.notes?.trim() || null
  if (patch.lastContact !== undefined) $set.lastContact = patch.lastContact

  const result = await db.collection("sales_leads").findOneAndUpdate(
    { _id: new ObjectId(leadId), ownerId },
    { $set },
    { returnDocument: "after" }
  )

  return result ? toLead(result as Parameters<typeof toLead>[0]) : null
}

export async function deleteSalesLead(
  leadId: string,
  ownerId: string
): Promise<boolean> {
  await ensureIndexes()
  if (!ObjectId.isValid(leadId)) return false

  const db = await getDatabase()
  const existing = await db.collection("sales_leads").findOne({
    _id: new ObjectId(leadId),
    ownerId,
  })

  if (!existing) return false

  await deleteOutreachForLead(leadId, ownerId)

  const result = await db.collection("sales_leads").deleteOne({
    _id: new ObjectId(leadId),
    ownerId,
  })

  return result.deletedCount > 0
}

export async function getSalesPipelineStats(
  ownerId: string
): Promise<SalesPipelineStats> {
  await ensureIndexes()
  const db = await getDatabase()
  const rows = await db
    .collection("sales_leads")
    .find({ ownerId })
    .project({ stage: 1, lastContact: 1, updatedAt: 1 })
    .toArray()

  const byStage = Object.fromEntries(
    SALES_LEAD_STAGES.map((stage) => [stage, 0])
  ) as Record<SalesLeadStage, number>

  let needsFollowUp = 0
  const staleCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000

  for (const row of rows) {
    const stage = (row.stage as SalesLeadStage) ?? "New"
    if (byStage[stage] !== undefined) byStage[stage] += 1

    const activeStages: SalesLeadStage[] = ["Contacted", "Replied", "Meeting"]
    if (activeStages.includes(stage)) {
      const touched = row.lastContact
        ? new Date(row.lastContact as string).getTime()
        : new Date(row.updatedAt as Date).getTime()
      if (touched < staleCutoff) needsFollowUp += 1
    }
  }

  return {
    total: rows.length,
    byStage,
    needsFollowUp,
  }
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.min(100, Math.max(0, Math.round(score)))
}

function toLead(row: {
  _id: ObjectId
  ownerId: string
  name: string
  email?: string
  phone?: string
  company: string
  title?: string
  linkedinUrl?: string
  website?: string
  segment?: string
  source: SalesLead["source"]
  stage: SalesLeadStage
  score?: number
  researchSummary?: string
  notes?: string
  lastContact?: string | null
  createdAt: Date
  updatedAt: Date
}): SalesLead {
  return {
    id: row._id.toString(),
    ownerId: row.ownerId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    title: row.title,
    linkedinUrl: row.linkedinUrl,
    website: row.website,
    segment: row.segment,
    source: row.source,
    stage: row.stage,
    score: row.score ?? 0,
    researchSummary: row.researchSummary,
    notes: row.notes,
    lastContact: row.lastContact ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
