"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Check,
  ChevronDown,
  Loader2,
  LogOut,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react"

import { AI_AGENTS_CATALOG, resolveAgentId, type AgentCategory, type AiAgent } from "@/lib/ai-agents-catalog"
import { getAgentMarketingContent } from "@/lib/ai-agents-marketing"
import { agentHasLiveTools } from "@/lib/agents/tool-map"
import { authClient } from "@/lib/auth-client"
import { AgentKnowledgePanel } from "@/components/agent-knowledge-panel"
import { AgentRunsPanel } from "@/components/agent-runs-panel"
import { AiAgentsHubHero } from "@/components/ai-agents-hub-hero"
import { AiCreditsBadge } from "@/components/ai-credits-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type InstalledAgent = { agentId: string; installedAt: string; enabled: boolean }

async function fetchInstalled(): Promise<InstalledAgent[]> {
  const res = await fetch("/api/ai/installed")
  if (!res.ok) throw new Error("Failed to load installed agents")
  const json = await res.json()
  return (json.installed ?? []) as InstalledAgent[]
}

function ProfileMenu() {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
  }

  if (!session?.user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name ?? "Profile"} />
            <AvatarFallback className="bg-neutral-100 text-sm font-semibold text-neutral-700">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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

function AgentCard({
  agent,
  detailHref,
  isInstalled,
  isBusy,
  onInstall,
  onUninstall,
}: {
  agent: AiAgent
  detailHref: string
  isInstalled: boolean
  isBusy: boolean
  onInstall: () => void
  onUninstall: () => void
}) {
  const router = useRouter()
  const content = getAgentMarketingContent(agent)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => router.push(detailHref)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          router.push(detailHref)
        }
      }}
      className="group flex h-full cursor-pointer flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-none transition-colors hover:border-neutral-300 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <AgentThumbnail agent={agent} />
          <div className="min-w-0">
            <div className="text-lg font-semibold leading-tight text-neutral-950 dark:text-white">
              {content.displayName}
            </div>
            <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">{content.roleTitle}</div>
          </div>
        </div>

        {isInstalled ? (
          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#c1ff72] px-2.5 py-1 text-xs font-semibold text-neutral-950">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Enabled
          </div>
        ) : agentHasLiveTools(agent.id) ? (
          <div className="shrink-0 text-xs font-medium text-neutral-500">Live data</div>
        ) : null}
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-500">
        {agent.description}
      </p>

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

        {isInstalled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onUninstall()
            }}
            disabled={isBusy}
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="shrink-0 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            onClick={(e) => {
              e.stopPropagation()
              onInstall()
            }}
            disabled={isBusy}
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enable"}
          </Button>
        )}
      </div>
    </Card>
  )
}

export function AiAgentsHubView() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<AgentCategory | "All">("All")
  const [installed, setInstalled] = useState<InstalledAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyAgentId, setBusyAgentId] = useState<string | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [toolsOpen, setToolsOpen] = useState(false)

  const agentBaseHref = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard/ai"
    return window.location.pathname.startsWith("/founder") ? "/founder/ai" : "/dashboard/ai"
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchInstalled()
      .then((data) => {
        if (cancelled) return
        setInstalled(data)
        setError(null)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed")
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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

  const installedSet = useMemo(
    () => new Set(installed.map((a) => resolveAgentId(a.agentId))),
    [installed],
  )

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AI_AGENTS_CATALOG.filter((agent) => {
      if (activeCategory !== "All" && agent.category !== activeCategory) return false
      if (!q) return true
      const content = getAgentMarketingContent(agent)
      const hay = `${content.displayName} ${content.roleTitle} ${agent.description} ${agent.category} ${agent.tags.join(" ")}`
      return hay.toLowerCase().includes(q)
    })
  }, [query, activeCategory])

  const myAgents = useMemo(() => {
    const seen = new Set<string>()
    return AI_AGENTS_CATALOG.filter((a) => {
      if (!installedSet.has(a.id) || seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })
  }, [installedSet])

  const installedCount = installedSet.size

  async function install(agentId: string) {
    setBusyAgentId(agentId)
    try {
      const res = await fetch("/api/ai/installed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      })
      if (!res.ok) throw new Error("Failed to install")
      const next = await fetchInstalled()
      setInstalled(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyAgentId(null)
    }
  }

  async function uninstall(agentId: string) {
    setBusyAgentId(agentId)
    try {
      const res = await fetch(`/api/ai/installed/${agentId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to uninstall")
      const next = await fetchInstalled()
      setInstalled(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyAgentId(null)
    }
  }

  const renderAgentGrid = (agents: AiAgent[]) => {
    if (loading) {
      return (
        <Card className="flex items-center gap-2 rounded-2xl border-neutral-200 bg-white p-10 text-base text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading agents…
        </Card>
      )
    }

    if (!agents.length) {
      return (
        <Card className="rounded-2xl border-neutral-200 bg-white p-10 text-base text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          No agents match your filters.
        </Card>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            detailHref={`${agentBaseHref}/${agent.id}`}
            isInstalled={installedSet.has(agent.id)}
            isBusy={busyAgentId === agent.id}
            onInstall={() => install(agent.id)}
            onUninstall={() => uninstall(agent.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full space-y-8">
      <AiAgentsHubHero
        agentBaseHref={agentBaseHref}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        installedSet={installedSet}
        onSearch={setQuery}
      />

      <div className="hidden items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="h-10 rounded-full border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" asChild>
          <Link href={`${agentBaseHref}/approvals`}>
            <ShieldAlert className="mr-1.5 h-4 w-4" />
            Approvals{pendingApprovals > 0 ? ` (${pendingApprovals})` : ""}
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-full border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          onClick={() => {
            setQuery("")
            setActiveCategory("All")
          }}
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          Reset filters
        </Button>

        <span className="hidden lg:inline-flex">
          <ProfileMenu />
        </span>
      </div>

      {error ? <div className="text-sm text-destructive">{error}</div> : null}

      <Tabs defaultValue="catalog" id="ai-agents-catalog" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-auto w-full gap-1 rounded-full border border-neutral-200 bg-neutral-100/80 p-1 dark:border-neutral-800 dark:bg-neutral-900/80 sm:w-auto">
            <TabsTrigger
              value="catalog"
              className="flex-1 rounded-full px-5 py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800 sm:flex-none sm:text-base"
            >
              Agents
            </TabsTrigger>
            <TabsTrigger
              value="my"
              className="flex-1 rounded-full px-5 py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800 sm:flex-none sm:text-base"
            >
              My Agents ({installedCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <AiCreditsBadge className="shrink-0" />
            <div className="relative min-w-0 flex-1 sm:w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents..."
                className="h-10 w-full rounded-full border-neutral-200 bg-white pl-9 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              />
            </div>
          </div>
        </div>

        <TabsContent value="catalog" className="space-y-5">
          {query.trim() ? (
            <p className="text-sm text-neutral-500">
              Showing agents matching &ldquo;{query.trim()}&rdquo;
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            </p>
          ) : activeCategory !== "All" ? (
            <p className="text-sm text-neutral-500">Showing {activeCategory} agents</p>
          ) : null}

          {renderAgentGrid(filteredCatalog)}
        </TabsContent>

        <TabsContent value="my" className="space-y-5">
          {myAgents.length ? (
            renderAgentGrid(myAgents)
          ) : loading ? (
            renderAgentGrid([])
          ) : (
            <Card className="rounded-2xl border-neutral-200 bg-white p-10 text-base text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
              You haven&apos;t enabled any agents yet. Browse the catalog to enable specialists.
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
