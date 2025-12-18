import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { InvestorDashboard } from "@/components/investor-dashboard"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function DashboardPage() {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      console.log("DashboardPage: No session, redirecting to sign-in")
      redirect("/sign-in")
    }

    // If onboarding not completed, redirect to onboarding
    if (!session.user.onboardingCompleted) {
      console.log("DashboardPage: Onboarding not completed, redirecting to onboarding")
      redirect("/onboarding")
    }

    return (
      <DashboardShell>
        <InvestorDashboard />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error in DashboardPage:", error)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    redirect("/sign-in")
  }
}

