import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { AnalyticsView } from "@/components/analytics-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function FounderAnalyticsPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")

  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <AnalyticsView />
    </DashboardShell>
  )
}

