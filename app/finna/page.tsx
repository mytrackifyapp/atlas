import { Suspense } from "react"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { FinnaWorkspace } from "@/components/finna-workspace"
import { getSessionWithRole } from "@/lib/auth-helpers"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finna AI | Trackify",
  description:
    "Chat with Finna, your Trackify operating partner — finance, fundraising, portfolio, and company operations.",
}

export const dynamic = "force-dynamic"

export default async function FinnaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await getSessionWithRole()
  const params = await searchParams
  const q = params.q?.trim()
  const next = q ? `/finna?q=${encodeURIComponent(q)}` : "/finna"

  if (!session) {
    redirect(`/sign-up?redirect=${encodeURIComponent(next)}`)
  }

  if (session && !session.user.onboardingCompleted) {
    redirect(`/onboarding?redirect=${encodeURIComponent(next)}`)
  }

  const viewerRole = session?.user.role === "investor" ? "investor" : "founder"

  return (
    <DashboardShell viewerRole={viewerRole}>
      <Suspense fallback={null}>
        <FinnaWorkspace viewerRole={viewerRole} />
      </Suspense>
    </DashboardShell>
  )
}
