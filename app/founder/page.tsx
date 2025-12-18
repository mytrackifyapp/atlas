import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { FounderDashboard } from "@/components/founder-dashboard"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function FounderPage() {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      console.log("FounderPage: No session, redirecting to sign-in")
      redirect("/sign-in")
    }

    console.log("FounderPage: Session check:", {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      onboardingCompleted: session.user.onboardingCompleted
    })

    // If onboarding not completed, redirect to onboarding
    if (!session.user.onboardingCompleted) {
      console.log("FounderPage: Onboarding not completed, redirecting to onboarding")
      redirect("/onboarding")
    }

    // Allow users to view any dashboard regardless of their role
    // Users can switch between investor and founder views

    console.log("FounderPage: Rendering founder dashboard")
    return (
      <DashboardShell>
        <FounderDashboard />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error in FounderPage:", error)
    // Don't redirect on NEXT_REDIRECT errors (those are expected)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error // Re-throw redirect errors
    }
    redirect("/sign-in")
  }
}
