import { redirect } from "next/navigation"

import { AgentChatView } from "@/components/agent-chat-view"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function FounderSocialPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <AgentChatView
        agentId="ai-marketer"
        homeHref="/founder"
        heading="Social"
        subheading="Draft posts, graphics, and campaigns"
        composerVariant="glow"
      />
    </DashboardShell>
  )
}
