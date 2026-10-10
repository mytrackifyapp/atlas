import { redirect } from "next/navigation"
import { Suspense } from "react"

import { CheckoutSuccess } from "@/components/checkout/checkout-success"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getSettingsHref } from "@/lib/role-config"

export const dynamic = "force-dynamic"

export default async function CheckoutSuccessPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in?next=/checkout/success")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  const settingsHref = getSettingsHref(session.user.role)
  const agentsHubHref = session.user.role === "founder" ? "/founder/ai" : "/dashboard/ai"

  return (
    <DashboardShell>
      <Suspense
        fallback={<div className="py-20 text-center text-sm text-neutral-500">Confirming payment…</div>}
      >
        <CheckoutSuccess settingsHref={settingsHref} agentsHubHref={agentsHubHref} />
      </Suspense>
    </DashboardShell>
  )
}
