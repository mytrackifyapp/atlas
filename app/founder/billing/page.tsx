import { redirect } from "next/navigation"
import { Suspense } from "react"

import { BillingWorkspace } from "@/components/checkout/billing-workspace"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getStripePublishableKey } from "@/lib/stripe/config"

export const dynamic = "force-dynamic"

export default async function FounderBillingPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in?next=/founder/billing")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <Suspense fallback={<div className="py-20 text-center text-sm text-neutral-500">Loading billing…</div>}>
        <BillingWorkspace
          publishableKey={getStripePublishableKey()}
          settingsHref="/founder/settings"
        />
      </Suspense>
    </DashboardShell>
  )
}
