import { Suspense } from "react"
import { redirect } from "next/navigation"
import { FinnaChatFullPage } from "@/components/finna-chat-fullpage"
import { getSessionWithRole } from "@/lib/auth-helpers"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finna AI | Trackify",
  description: "Chat with Finna, your Trackify assistant — finance, fundraising, and portfolio guidance.",
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

  if (!session.user.onboardingCompleted) {
    redirect(`/onboarding?redirect=${encodeURIComponent(next)}`)
  }

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <FinnaChatFullPage />
      </Suspense>
    </main>
  )
}
