import { redirect } from "next/navigation"

import { AgentChatView } from "@/components/agent-chat-view"
import { DashboardShell } from "@/components/dashboard-shell"
import { isCatalogAgentId, resolveAgentId } from "@/lib/ai-agents-catalog"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function FounderAgentChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>
}) {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  const { agentId } = await params
  if (!agentId) redirect("/founder/ai")

  const resolved = resolveAgentId(agentId)
  if (!isCatalogAgentId(resolved)) redirect("/founder/ai")
  if (resolved !== agentId) redirect(`/founder/ai/${resolved}/chat`)

  return (
    <DashboardShell>
      <AgentChatView agentId={resolved} />
    </DashboardShell>
  )
}
