import { redirect } from "next/navigation"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { roleConfigs } from "@/lib/role-config"
import { OnboardingClient } from "./onboarding-client"

export default async function OnboardingPage() {
  try {
    // Server-side check: redirect to sign-in if not authenticated
    const session = await getSessionWithRole()

    if (!session) {
      console.log("OnboardingPage: No session, redirecting to sign-in")
      redirect("/sign-in?redirect=/onboarding")
    }

    console.log("OnboardingPage: Session check:", {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      onboardingCompleted: session.user.onboardingCompleted
    })

    // If onboarding already completed, redirect to appropriate dashboard
    if (session.user.onboardingCompleted) {
      // Use roleConfigs to get the correct default route, or fallback to /dashboard
      let redirectPath = "/dashboard"
      const userRole = session.user.role as "investor" | "founder" | null
      
      if (userRole === "founder" || userRole === "investor") {
        redirectPath = roleConfigs[userRole].defaultRoute
      }
      
      console.log("OnboardingPage: Onboarding completed, redirecting to:", redirectPath)
      redirect(redirectPath)
    }

    // Render the client component for authenticated users who haven't completed onboarding
    console.log("OnboardingPage: Rendering onboarding client")
    return <OnboardingClient />
  } catch (error) {
    // If there's an error getting session, redirect to sign-in
    console.error("Error in onboarding page:", error)
    // Don't redirect on NEXT_REDIRECT errors (those are expected)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error // Re-throw redirect errors
    }
    redirect("/sign-in?redirect=/onboarding")
  }
}
