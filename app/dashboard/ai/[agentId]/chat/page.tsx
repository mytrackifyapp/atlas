import { redirect } from "next/navigation"

import { AgentChatView } from "@/components/agent-chat-view"
import { DashboardShell } from "@/components/dashboard-shell"
import { isCatalogAgentId, resolveAgentId } from "@/lib/ai-agents-catalog"
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

  const resolved = resolveAgentId(agentId)
  if (!isCatalogAgentId(resolved)) redirect("/dashboard/ai")
  if (resolved !== agentId) redirect(`/dashboard/ai/${resolved}/chat`)

  return (
    <DashboardShell>
      <AgentChatView agentId={resolved} />
    </DashboardShell>
  )
}
