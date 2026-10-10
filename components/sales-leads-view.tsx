"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Calendar,
  CircleDashed,
  CircleX,
  Clock,
  MessageSquare,
  Search,
  Send,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react"

import { AddLeadDialog } from "@/components/add-lead-dialog"
import { KPIStrip } from "@/components/kpi-card"
import { PageHeader } from "@/components/page-header"
import { SalesOutreachPanel } from "@/components/sales-outreach-panel"
import { SalesFinnaComposer, SalesLeadsBoard } from "@/components/sales-workspace"
import { SALES_LEAD_STAGES, type SalesLeadStage } from "@/lib/sales/types"

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

const STAGE_ICONS: Record<SalesLeadStage, LucideIcon> = {
  New: CircleDashed,
  Researched: Search,
  Contacted: Send,
  Replied: MessageSquare,
  Meeting: Calendar,
  Won: Trophy,
  Lost: CircleX,
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
    <div className="space-y-5">
      <PageHeader
        title="Sales"
        description="B2B leads pipeline — research, outreach, and track progress with Ace (Sales Rep)."
      />

      <KPIStrip
        compact
        fullWidth
        items={[
          ...SALES_LEAD_STAGES.map((stage) => ({
            title: stage,
            value: String(stageCounts?.[stage] ?? 0),
            icon: STAGE_ICONS[stage],
            active: stageFilter === stage,
            onClick: () => setStageFilter((cur) => (cur === stage ? "all" : stage)),
          })),
          {
            title: "Total leads",
            value: String(stats?.total ?? 0),
            icon: Users,
          },
          {
            title: "Active",
            value: String(
              (stats?.byStage.Contacted ?? 0) +
                (stats?.byStage.Replied ?? 0) +
                (stats?.byStage.Meeting ?? 0),
            ),
            change: "Contacted+",
            icon: Send,
          },
          {
            title: "Need follow-up",
            value: String(stats?.needsFollowUp ?? 0),
            change: "7d+",
            icon: Clock,
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.95fr)]">
        <SalesLeadsBoard
          leads={leads}
          stats={stats}
          loading={loading}
          error={error}
          query={query}
          onQueryChange={setQuery}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
          busyId={busyId}
          onAddLead={() => setAddOpen(true)}
          onImport={handleImport}
          onUpdateStage={updateStage}
          onDeleteLead={deleteLead}
        />
        <SalesOutreachPanel />
      </div>

      <SalesFinnaComposer onAddLead={() => setAddOpen(true)} />

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} onCreated={loadLeads} />
    </div>
  )
}
