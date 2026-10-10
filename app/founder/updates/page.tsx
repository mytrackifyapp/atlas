import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { InvestorLounge } from "@/components/lounge/investor-lounge"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function FounderLoungePage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <InvestorLounge />
    </DashboardShell>
  )
}
