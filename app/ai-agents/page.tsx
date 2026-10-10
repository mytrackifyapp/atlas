import { AiAgentsHero } from "@/components/ai-agents-hero"
import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import { MarketingFooter } from "@/components/marketing-footer"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function AiAgentsMarketingPage() {
  const session = await getSessionWithRole()
  const isAuthenticated = !!session
  const hasCompletedOnboarding = session?.user.onboardingCompleted ?? false

  const finnaPath = "/finna"
  const signUpHref = `/sign-up?redirect=${encodeURIComponent(finnaPath)}`
  const signInHref = `/sign-in?redirect=${encodeURIComponent(finnaPath)}`
  const continueHref =
    isAuthenticated && hasCompletedOnboarding
      ? finnaPath
      : isAuthenticated
        ? `/onboarding?redirect=${encodeURIComponent(finnaPath)}`
        : signUpHref

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="pointer-events-auto">
          <TrackifyVcNavbar
            signedOutSignUpHref={signUpHref}
            signedOutSignInHref={signInHref}
            signedInHref={continueHref}
          />
        </div>
      </div>
      <AiAgentsHero variant="marketing" ctaHref={continueHref} ctaLabel="Get Trackify" />
      <MarketingFooter />
    </div>
  )
}
