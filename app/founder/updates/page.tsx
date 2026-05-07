import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { InvestorUpdatesView } from "@/components/investor-updates-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function InvestorUpdatesPage() {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      redirect("/sign-in")
    }

    if (!session.user.onboardingCompleted) {
      redirect("/onboarding")
    }

    return (
      <DashboardShell>
        <InvestorUpdatesView />
      </DashboardShell>
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    redirect("/sign-in")
  }
}
