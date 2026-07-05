import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { SalesLeadsView } from "@/components/sales-leads-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function FounderSalesPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <SalesLeadsView />
    </DashboardShell>
  )
}
