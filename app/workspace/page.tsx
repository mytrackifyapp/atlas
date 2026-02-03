import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { WorkspaceView } from "@/components/workspace-view"
import { getSessionWithRole } from "@/lib/auth-helpers"

export default async function WorkspacePage() {
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
        <WorkspaceView />
      </DashboardShell>
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    redirect("/sign-in")
  }
}
