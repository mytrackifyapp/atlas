import { redirect } from "next/navigation"
import { Suspense } from "react"

import { StablecoinCheckout } from "@/components/checkout/stablecoin-checkout"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSettingsHref } from "@/lib/role-config"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string; mode?: string; pack?: string }>
}) {
  const session = await getSessionWithRole()
  const params = await searchParams
  const query = new URLSearchParams()
  if (params.plan) query.set("plan", params.plan)
  if (params.interval) query.set("interval", params.interval)
  if (params.mode) query.set("mode", params.mode)
  if (params.pack) query.set("pack", params.pack)
  const next = `/checkout${query.toString() ? `?${query.toString()}` : ""}`

  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`)
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  const settingsHref = getSettingsHref(session.user.role)
  const agentsHubHref = session.user.role === "founder" ? "/founder/ai" : "/dashboard/ai"

  return (
    <DashboardShell>
      <Suspense fallback={<div className="py-20 text-center text-sm text-neutral-500">Loading checkout…</div>}>
        <StablecoinCheckout settingsHref={settingsHref} agentsHubHref={agentsHubHref} />
      </Suspense>
    </DashboardShell>
  )
}
