import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { AgentChatView } from "@/components/agent-chat-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function DashboardAgentChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>
}) {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  const { agentId } = await params
  if (!agentId) redirect("/dashboard/ai")

  return (
    <DashboardShell>
      <AgentChatView agentId={agentId} />
    </DashboardShell>
  )
}

