import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { FinanceManagementView } from "@/components/finance-management-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function FounderFinancePage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <FinanceManagementView />
    </DashboardShell>
  )
}

