"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ExternalLink, Loader2, Search, Store } from "lucide-react"

import { APPS_CATALOG, APP_CATEGORIES, type AppCategory, type StoreApp } from "@/lib/apps-catalog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { cn } from "@/lib/utils"

type InstalledApp = { appId: string; installedAt: string; enabled: boolean }

async function fetchInstalled(): Promise<InstalledApp[]> {
  const res = await fetch("/api/apps/installed")
  if (!res.ok) throw new Error("Failed to load installed apps")
  const json = await res.json()
  return (json.installed ?? []) as InstalledApp[]
}

export function AppsStoreView() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<AppCategory | "All">("All")
  const [installed, setInstalled] = useState<InstalledApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<StoreApp | null>(null)
  const [busyAppId, setBusyAppId] = useState<string | null>(null)

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

  const installedSet = useMemo(() => new Set(installed.map((a) => a.appId)), [installed])

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return APPS_CATALOG.filter((app) => {
      if (activeCategory !== "All" && app.category !== activeCategory) return false
      if (!q) return true
      const hay = `${app.name} ${app.description} ${app.category} ${app.tags.join(" ")}`
      return hay.toLowerCase().includes(q)
    })
  }, [query, activeCategory])

  const myApps = useMemo(
    () => APPS_CATALOG.filter((a) => installedSet.has(a.id)),
    [installedSet]
  )

  async function install(appId: string) {
    setBusyAppId(appId)
    try {
      const res = await fetch("/api/apps/installed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      })
      if (!res.ok) throw new Error("Failed to install")
      const next = await fetchInstalled()
      setInstalled(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyAppId(null)
    }
  }

  async function uninstall(appId: string) {
    setBusyAppId(appId)
    try {
      const res = await fetch(`/api/apps/installed/${appId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to uninstall")
      const next = await fetchInstalled()
      setInstalled(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyAppId(null)
    }
  }

  const AppCard = ({ app }: { app: StoreApp }) => {
    const isInstalled = installedSet.has(app.id)
    const Icon = app.icon
    const isBusy = busyAppId === app.id

    return (
      <button
        type="button"
        onClick={() => setSelected(app)}
        className="text-left"
      >
        <Card className="p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md border bg-muted/20 flex items-center justify-center">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium leading-tight">{app.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{app.category}</div>
              </div>
            </div>
            {isInstalled ? (
              <div className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <Check className="h-4 w-4" />
                Installed
              </div>
            ) : app.comingSoon ? (
              <div className="text-xs text-muted-foreground">Coming soon</div>
            ) : null}
          </div>
          <div className="mt-3 text-sm text-muted-foreground line-clamp-2">{app.description}</div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {app.tags.slice(0, 3).map((t) => (
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
                    uninstall(app.id)
                  }}
                  disabled={isBusy}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Uninstall"}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    install(app.id)
                  }}
                  disabled={isBusy || app.comingSoon}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Install"}
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
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <PageHeader
            title="Apps Store"
            description="Install lightweight tools for sales, marketing, and operations."
          />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps..."
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
              <Store className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
        {error ? <div className="mt-3 text-sm text-destructive">{error}</div> : null}
      </Card>

      <Tabs defaultValue="store">
        <TabsList>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="my">My Apps ({installed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={activeCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("All")}
            >
              All
            </Button>
            {APP_CATEGORIES.map((c) => (
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
              Loading apps…
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCatalog.map((app) => (
                <AppCard key={app.id} app={app} />
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
          ) : myApps.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-sm text-muted-foreground">
              You haven’t installed any apps yet. Browse the Store to install tools.
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => (o ? null : setSelected(null))}>
        <DialogContent>
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <selected.icon className="h-5 w-5 text-muted-foreground" />
                  {selected.name}
                </DialogTitle>
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
                        disabled={busyAppId === selected.id}
                      >
                        {busyAppId === selected.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Uninstall"
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => install(selected.id)}
                        disabled={busyAppId === selected.id || selected.comingSoon}
                      >
                        {busyAppId === selected.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : selected.comingSoon ? (
                          "Coming soon"
                        ) : (
                          "Install"
                        )}
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      className={cn(!selected.href && "opacity-60")}
                      disabled={!selected.href}
                      asChild={!!selected.href}
                    >
                      {selected.href ? (
                        <a href={selected.href} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Launch
                        </a>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Launch
                        </>
                      )}
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

