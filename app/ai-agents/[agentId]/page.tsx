import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"

import { AiAgentMarketingPage } from "@/components/ai-agent-marketing-page"
import { AI_AGENTS_CATALOG, isCatalogAgentId, resolveAgentId } from "@/lib/ai-agents-catalog"
import {
  getAgentById,
  getAgentMarketingContent,
  toSerializableAgent,
} from "@/lib/ai-agents-marketing"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ agentId: string }>
}

export function generateStaticParams() {
  return AI_AGENTS_CATALOG.map((agent) => ({ agentId: agent.id }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { agentId } = await params
  const agent = getAgentById(agentId)
  if (!agent) return { title: "AI Agent | Trackify" }

  const content = getAgentMarketingContent(agent)
  return {
    title: `${content.displayName} — ${content.roleTitle} | Trackify AI`,
    description: content.heroSubheadline,
  }
}

export default async function AiAgentPage({ params }: PageProps) {
  const { agentId } = await params
  const resolved = resolveAgentId(agentId)
  if (!isCatalogAgentId(resolved)) notFound()
  if (resolved !== agentId) redirect(`/ai-agents/${resolved}`)

  const agent = getAgentById(resolved)
  if (!agent) notFound()

  const session = await getSessionWithRole()
  const isAuthenticated = !!session
  const hasCompletedOnboarding = session?.user.onboardingCompleted ?? false
  const userRole = session?.user.role as "investor" | "founder" | null

  const ctaHref =
    isAuthenticated && hasCompletedOnboarding
      ? userRole === "founder"
        ? `/founder/ai/${agent.id}`
        : `/dashboard/ai/${agent.id}`
      : isAuthenticated
        ? "/onboarding"
        : "/sign-up"

  const content = getAgentMarketingContent(agent)

  return (
    <AiAgentMarketingPage
      agent={toSerializableAgent(agent)}
      content={content}
      ctaHref={ctaHref}
    />
  )
}
