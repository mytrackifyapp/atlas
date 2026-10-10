import { Suspense } from "react"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { FormationWorkspace } from "@/components/founder/formation-workspace"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

function formationPath(params: { name?: string; state?: string; entity?: string }) {
  const qs = new URLSearchParams()
  if (params.name) qs.set("name", params.name)
  if (params.state) qs.set("state", params.state)
  if (params.entity) qs.set("entity", params.entity)
  const query = qs.toString()
  return query ? `/founder/incorporate?${query}` : "/founder/incorporate"
}

export default async function FounderIncorporatePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; state?: string; entity?: string }>
}) {
  const params = await searchParams
  const dest = formationPath(params)

  try {
    const session = await getSessionWithRole()

    if (!session) {
      redirect(`/sign-in?redirect=${encodeURIComponent(dest)}`)
    }

    if (!session.user.onboardingCompleted) {
      redirect(`/onboarding?redirect=${encodeURIComponent(dest)}`)
    }

    return (
      <DashboardShell>
        <Suspense>
          <FormationWorkspace />
        </Suspense>
      </DashboardShell>
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    redirect(`/sign-in?redirect=${encodeURIComponent(dest)}`)
  }
}
