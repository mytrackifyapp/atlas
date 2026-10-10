import { AiAgentsHero } from "@/components/ai-agents-hero"
import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import { MarketingFooter } from "@/components/marketing-footer"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function AiAgentsMarketingPage() {
  const session = await getSessionWithRole()
  const isAuthenticated = !!session
  const hasCompletedOnboarding = session?.user.onboardingCompleted ?? false

  const aiDashboardHref =
    isAuthenticated && hasCompletedOnboarding
      ? "/finna"
      : isAuthenticated
        ? "/onboarding"
        : "/sign-up"

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="pointer-events-auto">
          <TrackifyVcNavbar />
        </div>
      </div>
      <AiAgentsHero variant="marketing" ctaHref={aiDashboardHref} ctaLabel="Get Trackify" />
      <MarketingFooter />
    </div>
  )
}
