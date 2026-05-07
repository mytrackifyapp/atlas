import Link from "next/link"
import { redirect } from "next/navigation"

import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import { AiAgentsHero } from "@/components/ai-agents-hero"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function AiAgentsMarketingPage() {
  const session = await getSessionWithRole()
  const isAuthenticated = !!session
  const hasCompletedOnboarding = session?.user.onboardingCompleted ?? false
  const userRole = session?.user.role as "investor" | "founder" | null

  const aiDashboardHref =
    isAuthenticated && hasCompletedOnboarding
      ? userRole === "founder"
        ? "/founder/ai"
        : "/dashboard/ai"
      : isAuthenticated
        ? "/onboarding"
        : "/sign-up"

  return (
    <div className="min-h-screen bg-background">
      <TrackifyVcNavbar />

      <main className="pt-24">
        <AiAgentsHero ctaHref={aiDashboardHref} ctaLabel="Begin" />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Meet your AI agents</h2>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground">
                Enable specialist roles like AI CFO, AI Lawyer, and AI Marketer to speed up execution across your team.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Button asChild>
                  <Link href={aiDashboardHref}>Open AI Agents</Link>
                </Button>
                {!isAuthenticated ? (
                  <Button asChild variant="outline">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {AI_AGENTS_CATALOG.slice(0, 9).map((a) => (
                <Card key={a.id} className="p-6 border-border/50">
                  <div className="text-xs text-muted-foreground">{a.category}</div>
                  <div className="mt-2 text-lg font-semibold">{a.name}</div>
                  <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.description}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {a.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-muted/40 border text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

