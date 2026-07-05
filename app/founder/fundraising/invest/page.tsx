import { redirect } from "next/navigation"

import { getSettingsHref } from "@/lib/role-config"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getActiveFundraiseForFounder } from "@/lib/fundraising/service"

export const dynamic = "force-dynamic"

export default async function FundraiseInvestPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in?next=/founder/fundraising/invest")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  const fundraise = await getActiveFundraiseForFounder(session.user.id)
  if (!fundraise) redirect("/founder/fundraising")

  redirect(`/invest/${fundraise.id}?preview=1`)
}
