export const SALES_LEAD_STAGES = [
  "New",
  "Researched",
  "Contacted",
  "Replied",
  "Meeting",
  "Won",
  "Lost",
] as const

export type SalesLeadStage = (typeof SALES_LEAD_STAGES)[number]

export const SALES_LEAD_SOURCES = [
  "Manual",
  "Import",
  "Agent",
  "Referral",
  "Website",
  "Event",
  "Other",
] as const

export type SalesLeadSource = (typeof SALES_LEAD_SOURCES)[number]

export type SalesLead = {
  id: string
  ownerId: string
  name: string
  email?: string
  phone?: string
  company: string
  title?: string
  linkedinUrl?: string
  website?: string
  segment?: string
  source: SalesLeadSource
  stage: SalesLeadStage
  score: number
  researchSummary?: string
  notes?: string
  lastContact?: string | null
  createdAt: Date
  updatedAt: Date
}

export type SalesPipelineStats = {
  total: number
  byStage: Record<SalesLeadStage, number>
  needsFollowUp: number
}

export type CreateSalesLeadInput = {
  name: string
  company: string
  email?: string
  phone?: string
  title?: string
  linkedinUrl?: string
  website?: string
  segment?: string
  source?: SalesLeadSource
  stage?: SalesLeadStage
  score?: number
  researchSummary?: string
  notes?: string
}

export type UpdateSalesLeadInput = Partial<CreateSalesLeadInput> & {
  stage?: SalesLeadStage
  lastContact?: string | null
}

export const OUTREACH_STATUSES = [
  "draft",
  "pending_approval",
  "scheduled",
  "sent",
  "replied",
  "cancelled",
  "failed",
] as const

export type OutreachStatus = (typeof OUTREACH_STATUSES)[number]

export type SalesOutreach = {
  id: string
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
  scheduledFor?: string | null
  sentAt?: string | null
  repliedAt?: string | null
  approvalId?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateOutreachInput = {
  leadId: string
  toEmail: string
  subject: string
  body: string
  agentId?: string
  status?: OutreachStatus
  sequenceGroupId?: string
  sequenceStep?: number
  scheduledFor?: Date | null
}

export type OutreachSequenceStepInput = {
  subject: string
  body: string
  delayDays?: number
}

