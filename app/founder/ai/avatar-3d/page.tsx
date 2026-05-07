import Link from "next/link"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { GlbAvatarVoiceTest } from "@/components/glb-avatar-voice-test"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { Button } from "@/components/ui/button"

export default async function FounderGlbAvatarLabPage() {
  const session = await getSessionWithRole()
  if (!session) redirect("/sign-in")
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/founder/ai">← AI agents</Link>
          </Button>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">GLB avatar lab</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Preview rigged GLB/GLTF models with React Three Fiber and drei (orbit controls, lighting,
          first animation clip). Upload stays in the browser until you add persistence.
        </p>
        <div className="pt-4">
          <GlbAvatarVoiceTest url="/model.glb" />
        </div>
      </div>
    </DashboardShell>
  )
}
