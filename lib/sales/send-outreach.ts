import { writeAuditLog } from "@/lib/agents/services/audit"
import { getAgentFoundation } from "@/lib/agents/services/foundation"
import { sendSalesOutreachEmail } from "@/lib/email/sales-outreach"
import { getSalesLead, updateSalesLead } from "@/lib/sales/leads-service"
import {
  cancelSequenceAfterReply,
  getOutreach,
  listDueScheduledOutreach,
  updateOutreachStatus,
} from "@/lib/sales/outreach-service"

export async function executeSendOutreach(input: {
  ownerId: string
  outreachId: string
  agentId?: string
  correlationId?: string
}): Promise<{ success: true; outreachId: string; messageId: string }> {
  const outreach = await getOutreach(input.outreachId, input.ownerId)
  if (!outreach) {
    throw new Error("Outreach not found")
  }

  if (outreach.status === "sent") {
    return { success: true, outreachId: outreach.id, messageId: "already-sent" }
  }

  if (!["draft", "scheduled", "pending_approval"].includes(outreach.status)) {
    throw new Error(`Cannot send outreach in status: ${outreach.status}`)
  }

  const lead = await getSalesLead(outreach.leadId, input.ownerId)
  if (!lead) {
    throw new Error("Lead not found for outreach")
  }

  try {
    const foundation = input.agentId
      ? await getAgentFoundation(input.ownerId, input.agentId)
      : null
    const replyTo = foundation?.fields.workEmail?.trim() || undefined

    const { id: messageId } = await sendSalesOutreachEmail({
      to: outreach.toEmail,
      subject: outreach.subject,
      body: outreach.body,
      replyTo,
    })

    await updateOutreachStatus(outreach.id, input.ownerId, {
      status: "sent",
      sentAt: new Date(),
      error: undefined,
    })

    const nextStage =
      lead.stage === "New" || lead.stage === "Researched" ? "Contacted" : lead.stage

    await updateSalesLead(outreach.leadId, input.ownerId, {
      stage: nextStage,
      lastContact: new Date().toISOString(),
    })

    await writeAuditLog({
      ownerId: input.ownerId,
      agentId: input.agentId ?? outreach.agentId ?? "system",
      action: "outreach.sent",
      correlationId: input.correlationId,
      policyDecision: "allowed",
      resource: { type: "outreach", id: outreach.id },
      metadata: {
        leadId: outreach.leadId,
        toEmail: outreach.toEmail,
        messageId,
        sequenceGroupId: outreach.sequenceGroupId,
      },
    })

    return { success: true, outreachId: outreach.id, messageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Send failed"
    await updateOutreachStatus(outreach.id, input.ownerId, {
      status: "failed",
      error: message,
    })
    throw error
  }
}

export async function executeLogOutreachReply(input: {
  ownerId: string
  outreachId: string
  agentId?: string
  notes?: string
  correlationId?: string
}): Promise<{ success: true }> {
  const outreach = await getOutreach(input.outreachId, input.ownerId)
  if (!outreach) throw new Error("Outreach not found")

  await updateOutreachStatus(outreach.id, input.ownerId, {
    status: "replied",
    repliedAt: new Date(),
  })

  await updateSalesLead(outreach.leadId, input.ownerId, {
    stage: "Replied",
    lastContact: new Date().toISOString(),
    notes: input.notes,
  })

  if (outreach.sequenceGroupId) {
    await cancelSequenceAfterReply(outreach.sequenceGroupId, input.ownerId)
  }

  await writeAuditLog({
    ownerId: input.ownerId,
    agentId: input.agentId ?? outreach.agentId ?? "system",
    action: "outreach.replied",
    correlationId: input.correlationId,
    policyDecision: "allowed",
    resource: { type: "outreach", id: outreach.id },
    metadata: { leadId: outreach.leadId },
  })

  return { success: true }
}

export async function promoteDueScheduledOutreach(ownerId: string): Promise<number> {
  const due = await listDueScheduledOutreach(ownerId)
  let promoted = 0

  for (const item of due) {
    await updateOutreachStatus(item.id, ownerId, { status: "draft" })
    promoted += 1
  }

  return promoted
}
