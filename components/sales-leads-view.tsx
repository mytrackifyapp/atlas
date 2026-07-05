"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Building2,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react"

import { AddLeadDialog } from "@/components/add-lead-dialog"
import { SalesOutreachPanel } from "@/components/sales-outreach-panel"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SALES_LEAD_STAGES, type SalesLeadStage } from "@/lib/sales/types"
import { cn } from "@/lib/utils"

type LeadRow = {
  id: string
  name: string
  company: string
  email?: string
  title?: string
  segment?: string
  stage: SalesLeadStage
  score: number
  source: string
  researchSummary?: string
  lastContact?: string | null
  updatedAt: string
}

type Stats = {
  total: number
  byStage: Record<SalesLeadStage, number>
  needsFollowUp: number
}

const STAGE_COLORS: Record<SalesLeadStage, string> = {
  New: "border-slate-500/40 text-slate-700 dark:text-slate-300",
  Researched: "border-blue-500/40 text-blue-700 dark:text-blue-300",
  Contacted: "border-amber-500/40 text-amber-700 dark:text-amber-300",
  Replied: "border-green-500/40 text-green-700 dark:text-green-300",
  Meeting: "border-primary/40 text-primary",
  Won: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  Lost: "border-red-500/40 text-red-700 dark:text-red-300",
}

function parseCsv(text: string): Array<{ name: string; company: string; email?: string; title?: string; segment?: string }> {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const nameIdx = headers.findIndex((h) => h === "name" || h === "full name")
  const companyIdx = headers.findIndex((h) => h === "company" || h === "organization")
  if (nameIdx < 0 || companyIdx < 0) return []

  const emailIdx = headers.indexOf("email")
  const titleIdx = headers.indexOf("title")
  const segmentIdx = headers.indexOf("segment")

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    return {
      name: cols[nameIdx] ?? "",
      company: cols[companyIdx] ?? "",
      email: emailIdx >= 0 ? cols[emailIdx] : undefined,
      title: titleIdx >= 0 ? cols[titleIdx] : undefined,
      segment: segmentIdx >= 0 ? cols[segmentIdx] : undefined,
    }
  }).filter((r) => r.name && r.company)
}

export function SalesLeadsView() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [addOpen, setAddOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (stageFilter !== "all") params.set("stage", stageFilter)
      if (query.trim()) params.set("search", query.trim())

      const res = await fetch(`/api/sales/leads?${params}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load leads")

      setLeads(data.leads ?? [])
      setStats(data.stats ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leads")
    } finally {
      setLoading(false)
    }
  }, [query, stageFilter])

  useEffect(() => {
    const timer = window.setTimeout(loadLeads, query ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [loadLeads, query])

  const stageCounts = useMemo(() => stats?.byStage ?? null, [stats])

  async function updateStage(leadId: string, stage: SalesLeadStage) {
    setBusyId(leadId)
    try {
      const res = await fetch(`/api/sales/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      })
      if (!res.ok) throw new Error("Failed to update stage")
      await loadLeads()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setBusyId(null)
    }
  }

  async function deleteLead(leadId: string) {
    if (!confirm("Delete this lead? Related outreach drafts will also be removed.")) return
    setBusyId(leadId)
    try {
      const res = await fetch(`/api/sales/leads/${leadId}`, { method: "DELETE" })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete lead")
      }
      await loadLeads()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    } finally {
      setBusyId(null)
    }
  }

  async function handleImport() {
    const text = window.prompt(
      "Paste CSV with headers: name, company, email (optional), title, segment"
    )
    if (!text?.trim()) return

    const rows = parseCsv(text)
    if (rows.length === 0) {
      alert("Could not parse CSV. Use headers: name, company")
      return
    }

    try {
      const res = await fetch("/api/sales/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: rows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Import failed")
      alert(`Imported ${data.created} lead(s)`)
      await loadLeads()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Import failed")
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sales"
        description="B2B leads pipeline — research, outreach, and track progress with Ace (Sales Rep)."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/founder/ai/ai-sales-rep/chat">
                <Sparkles className="h-4 w-4 mr-2" />
                Open Sales Rep
              </Link>
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {SALES_LEAD_STAGES.map((stage) => (
          <Card
            key={stage}
            className={cn(
              "cursor-pointer hover:bg-accent/50 transition-colors",
              stageFilter === stage && "ring-2 ring-primary/30"
            )}
            onClick={() => setStageFilter((cur) => (cur === stage ? "all" : stage))}
          >
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{stage}</p>
              <p className="text-2xl font-bold">{stageCounts?.[stage] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total leads</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active (Contacted+)</p>
              <p className="text-3xl font-bold">
                {(stats.byStage.Contacted ?? 0) +
                  (stats.byStage.Replied ?? 0) +
                  (stats.byStage.Meeting ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Need follow-up (7d+)</p>
              <p className="text-3xl font-bold">{stats.needsFollowUp}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Leads</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, company, email…"
                  className="pl-9 w-[220px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {SALES_LEAD_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading leads…
            </div>
          ) : error ? (
            <p className="text-sm text-destructive py-8">{error}</p>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No leads yet. Add one or import a CSV.</p>
              <div className="flex justify-center gap-2">
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add lead
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/founder/ai/ai-sales-rep/chat">Ask Sales Rep to suggest leads</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{lead.name}</p>
                      <Badge variant="outline" className={STAGE_COLORS[lead.stage]}>
                        {lead.stage}
                      </Badge>
                      {lead.segment ? <Badge variant="secondary">{lead.segment}</Badge> : null}
                      <span className="text-xs text-muted-foreground">Score {lead.score}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.title ? `${lead.title} · ` : ""}
                      {lead.company}
                    </p>
                    {lead.email ? (
                      <p className="text-sm flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </p>
                    ) : null}
                    {lead.researchSummary ? (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {lead.researchSummary}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={lead.stage}
                      onValueChange={(v) => updateStage(lead.id, v as SalesLeadStage)}
                      disabled={busyId === lead.id}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SALES_LEAD_STAGES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={busyId === lead.id}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/founder/ai/ai-sales-rep/chat?lead=${lead.id}`}>
                            Research with Ace
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(e) => {
                            e.preventDefault()
                            void deleteLead(lead.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SalesOutreachPanel />

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} onCreated={loadLeads} />
    </div>
  )
}
