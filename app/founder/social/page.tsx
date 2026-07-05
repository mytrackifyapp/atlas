import { Suspense } from "react"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { SocialPostsView } from "@/components/social-posts-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function FounderSocialPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading social…</div>}>
        <SocialPostsView />
      </Suspense>
    </DashboardShell>
  )
}
