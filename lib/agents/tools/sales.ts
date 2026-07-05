import { tool } from "ai"
import { z } from "zod"

import { writeAuditLog } from "@/lib/agents/services/audit"
import {
  createSalesLead,
  getSalesLead,
  getSalesPipelineStats,
  listSalesLeads,
  updateSalesLead,
} from "@/lib/sales/leads-service"
import {
  createOutreach,
  createOutreachSequence,
  getOutreach,
  listOutreach,
} from "@/lib/sales/outreach-service"
import { executeLogOutreachReply, executeSendOutreach } from "@/lib/sales/send-outreach"
import { findMatchingSalesLeads, resolveSalesLead } from "@/lib/sales/lead-matching"
import { OUTREACH_STATUSES, SALES_LEAD_STAGES } from "@/lib/sales/types"
import type { SalesLead } from "@/lib/sales/types"
import { wrapToolWithPolicy } from "@/lib/agents/tools/wrap"
import type { ToolContext, ToolPolicy } from "@/lib/agents/tools/types"

export type SalesToolName =
  | "list_sales_leads"
  | "get_sales_lead"
  | "find_sales_lead"
  | "get_sales_pipeline_summary"
  | "create_sales_lead"
  | "save_lead_research"
  | "update_lead_stage"
  | "draft_outreach_email"
  | "draft_follow_up_sequence"
  | "list_outreach_drafts"
  | "send_outreach_email"
  | "log_outreach_reply"

type OutreachToolName =
  | "draft_outreach_email"
  | "draft_follow_up_sequence"
  | "list_outreach_drafts"
  | "send_outreach_email"
  | "log_outreach_reply"

const SALES_TOOL_DESCRIPTIONS: Record<SalesToolName, string> = {
  list_sales_leads:
    "List B2B sales leads in the CRM with optional stage, segment, or search filter.",
  get_sales_lead:
    "Get one sales lead by ID including research notes and contact details.",
  find_sales_lead:
    "Find existing CRM leads by name, email, or company before creating or emailing. Always use this when the user mentions a person by name.",
  get_sales_pipeline_summary:
    "Pipeline counts by stage and how many leads need follow-up.",
  create_sales_lead:
    "Add a new B2B lead only when no match exists in CRM. Call find_sales_lead first when the user names someone.",
  save_lead_research:
    "Save research summary and notes on a lead after researching them.",
  update_lead_stage:
    "Move a lead to a new pipeline stage (New, Researched, Contacted, etc.).",
  draft_outreach_email:
    "Save a personalized outreach email draft for a lead (does not send).",
  draft_follow_up_sequence:
    "Create a multi-step email follow-up sequence with scheduled delays.",
  list_outreach_drafts:
    "List outreach email drafts and sent messages, optionally filtered by lead or status.",
  send_outreach_email:
    "Send an approved outreach draft via email (requires human approval before sending).",
  log_outreach_reply:
    "Mark an outreach as replied and move the lead to Replied stage.",
}

const SALES_POLICIES: Record<SalesToolName, ToolPolicy> = {
  list_sales_leads: { id: "list_sales_leads", autonomyTier: "T0", sideEffect: "read", allowedAgents: [] },
  get_sales_lead: { id: "get_sales_lead", autonomyTier: "T0", sideEffect: "read", allowedAgents: [] },
  find_sales_lead: { id: "find_sales_lead", autonomyTier: "T0", sideEffect: "read", allowedAgents: [] },
  get_sales_pipeline_summary: {
    id: "get_sales_pipeline_summary",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  create_sales_lead: {
    id: "create_sales_lead",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
  save_lead_research: {
    id: "save_lead_research",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
  update_lead_stage: {
    id: "update_lead_stage",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
  draft_outreach_email: {
    id: "draft_outreach_email",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
  draft_follow_up_sequence: {
    id: "draft_follow_up_sequence",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
  list_outreach_drafts: {
    id: "list_outreach_drafts",
    autonomyTier: "T0",
    sideEffect: "read",
    allowedAgents: [],
  },
  send_outreach_email: {
    id: "send_outreach_email",
    autonomyTier: "T2",
    sideEffect: "write",
    allowedAgents: [],
  },
  log_outreach_reply: {
    id: "log_outreach_reply",
    autonomyTier: "T1",
    sideEffect: "write",
    allowedAgents: [],
  },
}

async function auditSalesTool(
  ctx: ToolContext,
  toolId: SalesToolName | OutreachToolName,
  correlationId: string | undefined,
  extra?: Record<string, unknown>
) {
  await writeAuditLog({
    ownerId: ctx.userId,
    agentId: ctx.agentId,
    action: "tool.execute",
    correlationId,
    policyDecision: "allowed",
    resource: { type: "tool", id: toolId },
    metadata: { toolId, ...extra },
  })
}

function summarizeLead(lead: SalesLead) {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    title: lead.title,
    stage: lead.stage,
    score: lead.score,
  }
}

async function resolveLeadForAction(
  ownerId: string,
  input: { leadId?: string; leadName?: string; leadEmail?: string; company?: string }
) {
  const resolved = await resolveSalesLead(ownerId, {
    leadId: input.leadId,
    name: input.leadName,
    email: input.leadEmail,
    company: input.company,
  })

  if (resolved.status === "found") {
    return { lead: resolved.lead }
  }

  if (resolved.status === "ambiguous") {
    return {
      error: "Multiple CRM leads match — ask the user which one, or use get_sales_lead with the correct leadId.",
      matches: resolved.matches.map((m) => ({
        ...summarizeLead(m),
        matchReason: m.matchReason,
        matchScore: m.matchScore,
      })),
    }
  }

  return {
    error:
      "No matching lead in CRM. Use find_sales_lead to search, or create_sales_lead only if the user wants a brand-new contact.",
  }
}

export function getSalesToolPolicy(
  toolId: SalesToolName,
  allowedAgents: string[]
): ToolPolicy {
  return { ...SALES_POLICIES[toolId], allowedAgents }
}

export function createSalesTools(ctx: ToolContext, correlationId?: string) {
  const stageSchema = z.enum(SALES_LEAD_STAGES)
  const outreachStatusSchema = z.enum(OUTREACH_STATUSES)

  return {
    list_sales_leads: tool({
      description: SALES_TOOL_DESCRIPTIONS.list_sales_leads,
      inputSchema: z.object({
        stage: stageSchema.optional(),
        segment: z.string().optional(),
        search: z.string().optional(),
        limit: z.union([z.string(), z.number()]).optional(),
      }),
      execute: async ({ stage, segment, search, limit }) => {
        const parsedLimit =
          limit === undefined || limit === ""
            ? 25
            : Math.min(50, Math.max(1, parseInt(String(limit), 10) || 25))

        const leads = await listSalesLeads(ctx.userId, {
          stage,
          segment,
          search,
          limit: parsedLimit,
        })

        await auditSalesTool(ctx, "list_sales_leads", correlationId, {
          count: leads.length,
          stage,
        })

        return {
          leads: leads.map((l) => ({
            id: l.id,
            name: l.name,
            company: l.company,
            email: l.email,
            title: l.title,
            segment: l.segment,
            stage: l.stage,
            score: l.score,
            lastContact: l.lastContact,
          })),
        }
      },
    }),

    get_sales_lead: tool({
      description: SALES_TOOL_DESCRIPTIONS.get_sales_lead,
      inputSchema: z.object({
        leadId: z.string().min(1),
      }),
      execute: async ({ leadId }) => {
        const lead = await getSalesLead(leadId, ctx.userId)
        await auditSalesTool(ctx, "get_sales_lead", correlationId, {
          found: Boolean(lead),
          leadId,
        })
        if (!lead) return { error: "Lead not found" }
        return { lead }
      },
    }),

    find_sales_lead: tool({
      description: SALES_TOOL_DESCRIPTIONS.find_sales_lead,
      inputSchema: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        company: z.string().optional(),
      }),
      execute: async ({ name, email, company }) => {
        if (!name?.trim() && !email?.trim() && !company?.trim()) {
          return { error: "Provide at least one of: name, email, company" }
        }

        const matches = await findMatchingSalesLeads(ctx.userId, {
          name,
          email,
          company,
        })

        await auditSalesTool(ctx, "find_sales_lead", correlationId, {
          count: matches.length,
          name,
          email,
        })

        if (matches.length === 0) {
          return { found: false, matches: [], hint: "No CRM match — safe to create only if user wants a new lead." }
        }

        return {
          found: true,
          bestMatch: summarizeLead(matches[0]),
          matches: matches.map((m) => ({
            ...summarizeLead(m),
            matchReason: m.matchReason,
            matchScore: m.matchScore,
          })),
        }
      },
    }),

    get_sales_pipeline_summary: tool({
      description: SALES_TOOL_DESCRIPTIONS.get_sales_pipeline_summary,
      inputSchema: z.object({}),
      execute: async () => {
        const stats = await getSalesPipelineStats(ctx.userId)
        await auditSalesTool(ctx, "get_sales_pipeline_summary", correlationId)
        return stats
      },
    }),

    create_sales_lead: tool({
      description: SALES_TOOL_DESCRIPTIONS.create_sales_lead,
      inputSchema: z.object({
        name: z.string().min(1),
        company: z.string().min(1),
        email: z.string().optional(),
        title: z.string().optional(),
        segment: z.string().optional(),
        linkedinUrl: z.string().optional(),
        website: z.string().optional(),
        notes: z.string().optional(),
        score: z.number().optional(),
      }),
      execute: async (input) => {
        const existing = await findMatchingSalesLeads(ctx.userId, {
          name: input.name,
          email: input.email,
          company: input.company,
        })

        if (existing.length > 0 && existing[0].matchScore >= 70) {
          await auditSalesTool(ctx, "create_sales_lead", correlationId, {
            leadId: existing[0].id,
            duplicatePrevented: true,
          })
          return {
            lead: summarizeLead(existing[0]),
            alreadyExists: true,
            matchedOn: existing[0].matchReason,
            message: `Lead already in CRM — use leadId ${existing[0].id}. Do not create a duplicate.`,
          }
        }

        const result = await createSalesLead(ctx.userId, {
          ...input,
          source: "Agent",
          stage: "New",
        })
        await auditSalesTool(ctx, "create_sales_lead", correlationId, {
          leadId: result.lead.id,
          created: result.created,
        })
        return {
          lead: summarizeLead(result.lead),
          created: result.created,
          alreadyExists: !result.created,
          matchedOn: result.matchedOn,
        }
      },
    }),

    save_lead_research: tool({
      description: SALES_TOOL_DESCRIPTIONS.save_lead_research,
      inputSchema: z.object({
        leadId: z.string().min(1),
        researchSummary: z.string().min(1),
        notes: z.string().optional(),
        score: z.number().optional(),
      }),
      execute: async ({ leadId, researchSummary, notes, score }) => {
        const lead = await updateSalesLead(leadId, ctx.userId, {
          researchSummary,
          notes,
          score,
          stage: "Researched",
        })
        await auditSalesTool(ctx, "save_lead_research", correlationId, { leadId })
        if (!lead) return { error: "Lead not found" }
        return { lead: { id: lead.id, stage: lead.stage, researchSummary: lead.researchSummary } }
      },
    }),

    update_lead_stage: tool({
      description: SALES_TOOL_DESCRIPTIONS.update_lead_stage,
      inputSchema: z.object({
        leadId: z.string().min(1),
        stage: stageSchema,
        notes: z.string().optional(),
      }),
      execute: async ({ leadId, stage, notes }) => {
        const lead = await updateSalesLead(leadId, ctx.userId, {
          stage,
          notes,
          lastContact: new Date().toISOString(),
        })
        await auditSalesTool(ctx, "update_lead_stage", correlationId, { leadId, stage })
        if (!lead) return { error: "Lead not found" }
        return { lead: { id: lead.id, name: lead.name, stage: lead.stage } }
      },
    }),

    draft_outreach_email: tool({
      description: SALES_TOOL_DESCRIPTIONS.draft_outreach_email,
      inputSchema: z.object({
        leadId: z.string().optional(),
        leadName: z.string().optional(),
        leadEmail: z.string().optional(),
        subject: z.string().min(1),
        body: z.string().min(1),
        toEmail: z.string().optional(),
      }),
      execute: async ({ leadId, leadName, leadEmail, subject, body, toEmail }) => {
        const resolved = await resolveLeadForAction(ctx.userId, {
          leadId,
          leadName,
          leadEmail,
        })
        if ("error" in resolved) return resolved
        const lead = resolved.lead

        const email = toEmail?.trim() || lead.email?.trim()
        if (!email) {
          return { error: "Lead has no email — add an email or pass toEmail" }
        }

        const outreach = await createOutreach(ctx.userId, {
          leadId: lead.id,
          toEmail: email,
          subject,
          body,
          agentId: ctx.agentId,
          status: "draft",
        })

        await auditSalesTool(ctx, "draft_outreach_email", correlationId, {
          outreachId: outreach.id,
          leadId: lead.id,
        })

        return {
          outreach: {
            id: outreach.id,
            leadId: outreach.leadId,
            toEmail: outreach.toEmail,
            subject: outreach.subject,
            status: outreach.status,
          },
          lead: summarizeLead(lead),
        }
      },
    }),

    draft_follow_up_sequence: tool({
      description: SALES_TOOL_DESCRIPTIONS.draft_follow_up_sequence,
      inputSchema: z.object({
        leadId: z.string().optional(),
        leadName: z.string().optional(),
        leadEmail: z.string().optional(),
        toEmail: z.string().optional(),
        steps: z
          .array(
            z.object({
              subject: z.string().min(1),
              body: z.string().min(1),
              delayDays: z.number().optional(),
            })
          )
          .min(1)
          .max(5),
      }),
      execute: async ({ leadId, leadName, leadEmail, toEmail, steps }) => {
        const resolved = await resolveLeadForAction(ctx.userId, {
          leadId,
          leadName,
          leadEmail,
        })
        if ("error" in resolved) return resolved
        const lead = resolved.lead

        const email = toEmail?.trim() || lead.email?.trim()
        if (!email) {
          return { error: "Lead has no email — add an email or pass toEmail" }
        }

        const result = await createOutreachSequence(ctx.userId, {
          leadId: lead.id,
          toEmail: email,
          agentId: ctx.agentId,
          steps,
        })

        await auditSalesTool(ctx, "draft_follow_up_sequence", correlationId, {
          leadId: lead.id,
          sequenceGroupId: result.sequenceGroupId,
          stepCount: result.outreach.length,
        })

        return {
          lead: summarizeLead(lead),
          sequenceGroupId: result.sequenceGroupId,
          steps: result.outreach.map((o) => ({
            id: o.id,
            sequenceStep: o.sequenceStep,
            subject: o.subject,
            status: o.status,
            scheduledFor: o.scheduledFor,
          })),
        }
      },
    }),

    list_outreach_drafts: tool({
      description: SALES_TOOL_DESCRIPTIONS.list_outreach_drafts,
      inputSchema: z.object({
        leadId: z.string().optional(),
        status: outreachStatusSchema.optional(),
        limit: z.union([z.string(), z.number()]).optional(),
      }),
      execute: async ({ leadId, status, limit }) => {
        const parsedLimit =
          limit === undefined || limit === ""
            ? 25
            : Math.min(50, Math.max(1, parseInt(String(limit), 10) || 25))

        const items = await listOutreach(ctx.userId, {
          leadId,
          status,
          limit: parsedLimit,
        })

        await auditSalesTool(ctx, "list_outreach_drafts", correlationId, {
          count: items.length,
          leadId,
          status,
        })

        return {
          outreach: items.map((o) => ({
            id: o.id,
            leadId: o.leadId,
            toEmail: o.toEmail,
            subject: o.subject,
            status: o.status,
            sequenceStep: o.sequenceStep,
            scheduledFor: o.scheduledFor,
            sentAt: o.sentAt,
          })),
        }
      },
    }),

    send_outreach_email: tool({
      description: SALES_TOOL_DESCRIPTIONS.send_outreach_email,
      inputSchema: z.object({
        outreachId: z.string().min(1),
      }),
      execute: async ({ outreachId }) => {
        const outreach = await getOutreach(outreachId, ctx.userId)
        if (!outreach) return { error: "Outreach not found" }

        const result = await executeSendOutreach({
          ownerId: ctx.userId,
          outreachId,
          agentId: ctx.agentId,
          correlationId,
        })

        await auditSalesTool(ctx, "send_outreach_email", correlationId, {
          outreachId,
          messageId: result.messageId,
        })

        return {
          sent: true,
          outreachId: result.outreachId,
          messageId: result.messageId,
        }
      },
    }),

    log_outreach_reply: tool({
      description: SALES_TOOL_DESCRIPTIONS.log_outreach_reply,
      inputSchema: z.object({
        outreachId: z.string().min(1),
        notes: z.string().optional(),
      }),
      execute: async ({ outreachId, notes }) => {
        await executeLogOutreachReply({
          ownerId: ctx.userId,
          outreachId,
          agentId: ctx.agentId,
          notes,
          correlationId,
        })

        await auditSalesTool(ctx, "log_outreach_reply", correlationId, { outreachId })

        return { success: true, outreachId }
      },
    }),
  }
}

export function wrapSalesToolsForAgent(
  ctx: ToolContext,
  toolIds: SalesToolName[],
  correlationId?: string
) {
  const all = createSalesTools(ctx, correlationId)
  const wrapped: Partial<ReturnType<typeof createSalesTools>> = {}

  for (const id of toolIds) {
    const policy = getSalesToolPolicy(id, [ctx.agentId])
    wrapped[id] = wrapToolWithPolicy(all[id], policy, ctx, correlationId)
  }

  return wrapped
}
