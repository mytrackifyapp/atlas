import { agentDelegationRequested } from "@/inngest/functions/agent-delegation"
import { agentRunRequested, cfoWeeklyDigestCron } from "@/inngest/functions/agent-run"
import { approvalResolved } from "@/inngest/functions/approval-resolved"
import { salesOutreachScheduledCron } from "@/inngest/functions/sales-outreach-cron"

export const inngestFunctions = [
  agentRunRequested,
  cfoWeeklyDigestCron,
  approvalResolved,
  agentDelegationRequested,
  salesOutreachScheduledCron,
]
