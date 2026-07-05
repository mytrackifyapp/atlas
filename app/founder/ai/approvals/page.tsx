import { redirect } from "next/navigation"

import { AgentApprovalsInbox } from "@/components/agent-approvals-inbox"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function FounderAgentApprovalsPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <AgentApprovalsInbox agentBaseHref="/founder/ai" />
    </DashboardShell>
  )
}
