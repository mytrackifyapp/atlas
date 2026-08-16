import { LandingAIAssistant } from "@/components/landing-ai-assistant"
import { LandingHero } from "@/components/landing-hero"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { roleConfigs } from "@/lib/role-config"

export const dynamic = "force-dynamic"

export default async function Page() {
  const session = await getSessionWithRole()
  const isAuthenticated = !!session
  const hasCompletedOnboarding = session?.user.onboardingCompleted ?? false
  const userRole = session?.user.role as "investor" | "founder" | null

  const dashboardUrl =
    userRole && hasCompletedOnboarding && (userRole === "investor" || userRole === "founder")
      ? roleConfigs[userRole].defaultRoute
      : "/onboarding"

  return (
    <div className="min-h-screen bg-background">
      <LandingHero
        isAuthenticated={isAuthenticated}
        hasCompletedOnboarding={hasCompletedOnboarding}
        dashboardUrl={dashboardUrl}
      />
      <LandingAIAssistant />
    </div>
  )
}
