import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { CompanyStructureView } from "@/components/company-structure-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function CompanyStructurePage() {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      redirect("/sign-in")
    }

    if (!session.user.onboardingCompleted) {
      redirect("/onboarding")
    }

    return (
      <DashboardShell>
        <CompanyStructureView />
      </DashboardShell>
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    redirect("/sign-in")
  }
}
