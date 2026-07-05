import Link from "next/link"

import { AiAgentsHero } from "@/components/ai-agents-hero"
import { AiAgentsMarketingNav } from "@/components/ai-agents-marketing-nav"
import { AiAgentsShowcase } from "@/components/ai-agents-showcase"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"
import { getAgentPagePath } from "@/lib/ai-agents-marketing"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { Button } from "@/components/ui/button"

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
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="relative">
        <AiAgentsMarketingNav isAuthenticated={isAuthenticated} ctaHref={aiDashboardHref} />
        <AiAgentsHero variant="marketing" ctaHref={aiDashboardHref} ctaLabel="Get Trackify" />
      </div>

      <AiAgentsShowcase />

      <section id="agents" className="border-t border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Meet your AI agents</h2>
            <p className="mt-4 text-base text-white/65 sm:text-lg">
              Enable specialist roles like CFO, Vera, and Marketer to speed up execution
              across your team.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="rounded-full bg-[#4483f2] px-8 text-white hover:bg-[#3a75e0]"
              >
                <Link href={aiDashboardHref}>Open AI Agents</Link>
              </Button>
              {!isAuthenticated ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_AGENTS_CATALOG.map((a) => (
              <Link
                key={a.id}
                href={getAgentPagePath(a.id)}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="text-xs font-medium uppercase tracking-wider text-white/45">
                  {a.category}
                </div>
                <div className="mt-2 text-lg font-semibold text-white group-hover:text-[#4483f2] transition-colors">
                  {a.name}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{a.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {a.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/55"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
