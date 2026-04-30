import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { FinanceManagementView } from "@/components/finance-management-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function FinancePage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <FinanceManagementView />
    </DashboardShell>
  )
}

