import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { UsBankAccountView } from "@/components/finance/us-bank-account"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function FounderUsAccountPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <UsBankAccountView />
    </DashboardShell>
  )
}
