"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  Search,
  ShieldAlert,
} from "lucide-react"

import { AI_AGENTS_CATALOG, type AgentCategory, type AiAgent } from "@/lib/ai-agents-catalog"
import { getAgentMarketingContent } from "@/lib/ai-agents-marketing"
import { AgentKnowledgePanel } from "@/components/agent-knowledge-panel"
import { AgentRunsPanel } from "@/components/agent-runs-panel"
import { AiAgentsHubHero } from "@/components/ai-agents-hub-hero"
import { AiCreditsBadge } from "@/components/ai-credits-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const CAPABILITY_PROMPTS: Record<string, string> = {
  "ai-lawyer": "Help me review an NDA and flag any risky clauses for my startup",
  "ai-cfo": "Analyze my runway and tell me what changed in expenses",
  "ai-sales-rep": "What's in my sales pipeline and who needs a follow-up?",
  "ai-marketer": "Help me plan this week's social content and launch messaging",
  "ai-ops-manager": "Help me plan this week's team priorities and draft a simple SOP",
  "ai-hr": "Write a job description and interview kit for my next hire",
}

const INVESTOR_CATEGORIES: AgentCategory[] = ["Legal", "Finance", "Operations"]

function AgentThumbnail({ agent }: { agent: AiAgent }) {
  const Icon = agent.icon

  if (agent.imageSrc) {
    return (
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        <Image
          src={agent.imageSrc}
          alt={agent.name}
          fill
          className="object-cover object-top"
          sizes="44px"
        />
      </div>
    )
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 transition-colors group-hover:bg-[#c1ff72]/30">
      <Icon className="h-5 w-5" strokeWidth={2} />
    </div>
  )
}

function CapabilityCard({
  agent,
  focusHref,
  onAsk,
}: {
  agent: AiAgent
  focusHref: string
  onAsk: (prompt: string) => void
}) {
  const content = getAgentMarketingContent(agent)
  const prompt = CAPABILITY_PROMPTS[agent.id] ?? `Help me with ${agent.category.toLowerCase()}`

  return (
    <Card className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-none transition-colors hover:border-neutral-300 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => onAsk(prompt)}
        className="flex flex-1 flex-col text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <AgentThumbnail agent={agent} />
            <div className="min-w-0">
              <div className="text-lg font-semibold leading-tight text-neutral-950 dark:text-white">
                {content.displayName}
              </div>
              <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                {content.roleTitle}
              </div>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            {agent.category}
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-500">
          {agent.description}
        </p>
      </button>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {agent.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href={focusHref} onClick={(e) => e.stopPropagation()}>
              Focus room
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            onClick={() => onAsk(prompt)}
          >
            Ask Finna
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function AiAgentsHubView({
  viewerRole,
  onAsk,
}: {
  viewerRole?: "founder" | "investor" | null
  onAsk: (prompt: string) => void
}) {
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<AgentCategory | "All">("All")
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [toolsOpen, setToolsOpen] = useState(false)

  const role = viewerRole ?? (pathname.startsWith("/founder") ? "founder" : "investor")
  const isFounder = role !== "investor"
  const agentBaseHref = isFounder ? "/founder/ai" : "/dashboard/ai"

  useEffect(() => {
    let cancelled = false
    fetch("/api/agents/approvals?status=pending")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setPendingApprovals(data.pendingCount ?? 0)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AI_AGENTS_CATALOG.filter((agent) => {
      if (!isFounder && !INVESTOR_CATEGORIES.includes(agent.category)) return false
      if (activeCategory !== "All" && agent.category !== activeCategory) return false
      if (!q) return true
      const content = getAgentMarketingContent(agent)
      const hay = `${content.displayName} ${content.roleTitle} ${agent.description} ${agent.category} ${agent.tags.join(" ")}`
      return hay.toLowerCase().includes(q)
    })
  }, [query, activeCategory, isFounder])

  return (
    <div className="mx-auto w-full space-y-8">
      <AiAgentsHubHero
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        viewerRole={role}
        onSearch={setQuery}
        onAsk={onAsk}
      />

      <div id="skills" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-950 dark:text-white">
            Skills behind Finna
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Ask Finna directly. Focus rooms are optional for deep setup and specialist threads.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-10 shrink-0 rounded-full border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            asChild
          >
            <Link href={`${agentBaseHref}/approvals`}>
              <ShieldAlert className="mr-1.5 h-4 w-4" />
              Approvals{pendingApprovals > 0 ? ` (${pendingApprovals})` : ""}
            </Link>
          </Button>
          <AiCreditsBadge className="shrink-0" />
          <div className="relative min-w-0 flex-1 sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills..."
              className="h-10 w-full rounded-full border-neutral-200 bg-white pl-9 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            />
          </div>
        </div>
      </div>

      {query.trim() ? (
        <p className="-mt-4 text-sm text-neutral-500">
          Showing skills matching &ldquo;{query.trim()}&rdquo;
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        </p>
      ) : activeCategory !== "All" ? (
        <p className="-mt-4 text-sm text-neutral-500">Showing {activeCategory} skills</p>
      ) : null}

      {filteredCatalog.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCatalog.map((agent) => (
            <CapabilityCard
              key={agent.id}
              agent={agent}
              focusHref={`${agentBaseHref}/${agent.id}`}
              onAsk={onAsk}
            />
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-neutral-200 bg-white p-10 text-base text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          No skills match your filters.
        </Card>
      )}

      <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between rounded-2xl border-neutral-200 bg-white py-6 text-base font-medium dark:border-neutral-800 dark:bg-neutral-900"
          >
            Knowledge base &amp; recent runs
            <ChevronDown className={cn("h-4 w-4 transition-transform", toolsOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <AgentKnowledgePanel />
          <AgentRunsPanel agentId="ai-cfo" />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
