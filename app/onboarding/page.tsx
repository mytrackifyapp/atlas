import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { roleConfigs } from "@/lib/role-config"
import { safeInternalPath } from "@/lib/safe-redirect"
import { OnboardingClient } from "./onboarding-client"

export const dynamic = "force-dynamic"

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  try {
    const session = await getSessionWithRole()
    const params = await searchParams
    const next = safeInternalPath(params.redirect, "")
    const onboardingPath = next ? `/onboarding?redirect=${encodeURIComponent(next)}` : "/onboarding"

    if (!session) {
      redirect(`/sign-in?redirect=${encodeURIComponent(onboardingPath)}`)
    }

    if (session.user.onboardingCompleted) {
      if (next) {
        redirect(next)
      }

      let redirectPath = "/dashboard"
      const userRole = session.user.role as "investor" | "founder" | null

      if (userRole === "founder" || userRole === "investor") {
        redirectPath = roleConfigs[userRole].defaultRoute
      }

      redirect(redirectPath)
    }

    return (
      <Suspense fallback={null}>
        <OnboardingClient />
      </Suspense>
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    redirect("/sign-in?redirect=/onboarding")
  }
}

