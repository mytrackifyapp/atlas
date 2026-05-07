"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ExternalLink, Loader2, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { AI_AGENTS_CATALOG, AGENT_CATEGORIES, type AgentCategory, type AiAgent } from "@/lib/ai-agents-catalog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AiAgentsHero } from "@/components/ai-agents-hero"

type InstalledAgent = { agentId: string; installedAt: string; enabled: boolean }

async function fetchInstalled(): Promise<InstalledAgent[]> {
  const res = await fetch("/api/ai/installed")
  if (!res.ok) throw new Error("Failed to load installed agents")
  const json = await res.json()
  return (json.installed ?? []) as InstalledAgent[]
}

export function AiAgentsHubView() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<AgentCategory | "All">("All")
  const [installed, setInstalled] = useState<InstalledAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AiAgent | null>(null)
  const [busyAgentId, setBusyAgentId] = useState<string | null>(null)

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

  const installedSet = useMemo(() => new Set(installed.map((a) => a.agentId)), [installed])

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AI_AGENTS_CATALOG.filter((agent) => {
      if (activeCategory !== "All" && agent.category !== activeCategory) return false
      if (!q) return true
      const hay = `${agent.name} ${agent.description} ${agent.category} ${agent.tags.join(" ")}`
      return hay.toLowerCase().includes(q)
    })
  }, [query, activeCategory])

  const myAgents = useMemo(
    () => AI_AGENTS_CATALOG.filter((a) => installedSet.has(a.id)),
    [installedSet]
  )

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

  const AgentCard = ({ agent }: { agent: AiAgent }) => {
    const isInstalled = installedSet.has(agent.id)
    const isBusy = busyAgentId === agent.id

    return (
      <button type="button" onClick={() => setSelected(agent)} className="text-left">
        <Card className="p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div>
                <div className="font-medium leading-tight">{agent.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{agent.category}</div>
              </div>
            </div>
            {isInstalled ? (
              <div className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <Check className="h-4 w-4" />
                Enabled
              </div>
            ) : agent.comingSoon ? (
              <div className="text-xs text-muted-foreground">Coming soon</div>
            ) : null}
          </div>
          <div className="mt-3 text-sm text-muted-foreground line-clamp-2">{agent.description}</div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {agent.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-muted/40 border text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {isInstalled ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    uninstall(agent.id)
                  }}
                  disabled={isBusy}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable"}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    install(agent.id)
                  }}
                  disabled={isBusy || agent.comingSoon}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enable"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </button>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Full-width hero inside dashboard content area */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <AiAgentsHero
          onBegin={() => {
            const el = document.getElementById("ai-agents-catalog")
            el?.scrollIntoView({ behavior: "smooth", block: "start" })
          }}
        ctaLabel="Begin"
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight">Agents catalog</div>
            <div className="text-sm text-muted-foreground">
              Search and enable specialist agents for your workflow.
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <Link href={`${agentBaseHref}/avatar-3d`}>GLB viewer</Link>
            </Button>
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents..."
                className="pl-9 w-[260px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("")
                setActiveCategory("All")
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
        {error ? <div className="mt-3 text-sm text-destructive">{error}</div> : null}
      </Card>

      <Tabs defaultValue="catalog" id="ai-agents-catalog">
        <TabsList>
          <TabsTrigger value="catalog">Agents</TabsTrigger>
          <TabsTrigger value="my">My Agents ({installed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={activeCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("All")}
            >
              All
            </Button>
            {AGENT_CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={activeCategory === c ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>

          {loading ? (
            <Card className="p-8 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading agents…
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCatalog.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          {loading ? (
            <Card className="p-8 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </Card>
          ) : myAgents.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-sm text-muted-foreground">
              You haven’t enabled any agents yet. Browse the catalog to enable specialists.
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => (o ? null : setSelected(null))}>
        <DialogContent>
          {selected ? (
            <>
              {/* Image header */}
              <div className="-mx-6 -mt-6 mb-2 overflow-hidden rounded-t-lg border-b border-border/50">
                <div className="relative h-40 w-full bg-muted/40">
                  {selected.imageSrc ? (
                    <Image
                      src={selected.imageSrc}
                      alt={selected.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 640px"
                      priority={selected.id === "ai-cfo"}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.25),transparent_70%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                </div>
              </div>

              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">{selected.description}</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-muted/40 border text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Category: <span className="text-foreground">{selected.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {installedSet.has(selected.id) ? (
                      <Button
                        variant="outline"
                        onClick={() => uninstall(selected.id)}
                        disabled={busyAgentId === selected.id}
                      >
                        {busyAgentId === selected.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Disable"
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => install(selected.id)}
                        disabled={busyAgentId === selected.id || selected.comingSoon}
                      >
                        {busyAgentId === selected.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : selected.comingSoon ? (
                          "Coming soon"
                        ) : (
                          "Enable"
                        )}
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      asChild
                    >
                      <Link href={`${agentBaseHref}/${selected.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

