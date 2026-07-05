import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { SettingsView } from "@/components/settings-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function FounderSettingsPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <SettingsView />
    </DashboardShell>
  )
}
