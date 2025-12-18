import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { PortfolioView } from "@/components/portfolio-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function PortfolioPage() {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      console.log("PortfolioPage: No session, redirecting to sign-in")
      redirect("/sign-in")
    }

    console.log("PortfolioPage: Session check:", {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      onboardingCompleted: session.user.onboardingCompleted
    })

    // If onboarding not completed, redirect to onboarding
    if (!session.user.onboardingCompleted) {
      console.log("PortfolioPage: Onboarding not completed, redirecting to onboarding")
      redirect("/onboarding")
    }

    // Redirect founders to their dashboard
    if (session.user.role === "founder") {
      console.log("PortfolioPage: User is founder, redirecting to founder dashboard")
      redirect("/founder")
    }

    // Only render if user is an investor with completed onboarding
    if (session.user.role !== "investor") {
      console.log("PortfolioPage: User role is not investor:", session.user.role, "redirecting to onboarding")
      redirect("/onboarding")
    }

    console.log("PortfolioPage: Rendering portfolio view")
    return (
      <DashboardShell>
        <PortfolioView />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error in PortfolioPage:", error)
    // Don't redirect on NEXT_REDIRECT errors (those are expected)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error // Re-throw redirect errors
    }
    redirect("/sign-in")
  }
}
