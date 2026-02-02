import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { isAdmin } from "@/lib/admin-helpers"

export default async function AdminPage() {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      redirect("/sign-in?redirect=/admin")
    }

    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      redirect("/dashboard")
    }

    return (
      <DashboardShell>
        <AdminDashboard />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error in AdminPage:", error)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    redirect("/sign-in")
  }
}

