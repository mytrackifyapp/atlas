"use client"

import { useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  MapPin,
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  ArrowUpRight,
  Pencil,
} from "lucide-react"
import Link from "next/link"

import { AddDealDialog } from "@/components/add-deal-dialog"

const statusColors = {
  New: "default",
  "Under Review": "secondary",
  "Due Diligence": "outline",
  Declined: "destructive",
}

type DealStatus = keyof typeof statusColors

type Deal = {
  id: string
  name: string
  logo?: string | null
  tagline: string
  sector: string
  stage: string
  asking?: number | null
  valuation?: number | null
  location: string
  website?: string | null
  onboarded?: boolean
  submittedDate?: string | Date
  status: DealStatus
  score?: number
  highlights?: string[]
}

export function DealFlowView() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "New" | "Under Review" | "Due Diligence" | "Declined">(
    "all"
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editDeal, setEditDeal] = useState<(Deal & { website?: string | null; onboarded?: boolean }) | null>(null)
  const editOpen = !!editDeal

  const fetchDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/deal-flow/deals")
      const data = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(data?.error || "Failed to load deals")
      if (data?.success && Array.isArray(data.deals)) setDeals(data.deals)
      else setDeals([])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load deals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  const filteredDeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return deals.filter((d) => {
      const matchesStatus = statusFilter === "all" ? true : d.status === statusFilter
      const matchesQuery = q
        ? [d.name, d.tagline, d.sector, d.stage, d.location].some((v) =>
            (v ?? "").toString().toLowerCase().includes(q)
          )
        : true
      return matchesStatus && matchesQuery
    })
  }, [deals, searchQuery, statusFilter])

  const summary = useMemo(() => {
    const counts = {
      New: 0,
      "Under Review": 0,
      "Due Diligence": 0,
      Declined: 0,
    } as Record<DealStatus, number>
    for (const d of deals) counts[d.status] = (counts[d.status] ?? 0) + 1
    const total = deals.length
    const progressed = total - counts.Declined
    const conversion = total > 0 ? Math.round((progressed / total) * 100) : 0
    return { counts, conversion }
  }, [deals])

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Deal Flow"
        description="Review and manage incoming investment opportunities"
        actions={
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            Add Deal
          </Button>
        }
      />

      <AddDealDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={fetchDeals}
      />

      <AddDealDialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) setEditDeal(null)
        }}
        onCreated={fetchDeals}
        deal={
          editDeal
            ? {
                id: editDeal.id,
                name: editDeal.name,
                tagline: editDeal.tagline,
                sector: editDeal.sector,
                stage: editDeal.stage,
                location: editDeal.location,
                website: editDeal.website ?? null,
                onboarded: !!editDeal.onboarded,
                asking: editDeal.asking ?? null,
                valuation: editDeal.valuation ?? null,
                status: editDeal.status,
                score: editDeal.score ?? 0,
                highlights: editDeal.highlights ?? [],
                logo: editDeal.logo ?? null,
              }
            : null
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">New Deals</p>
              </div>
              <p className="text-3xl font-bold">{summary.counts.New}</p>
              <p className="text-sm text-muted-foreground">In pipeline</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
              </div>
              <p className="text-3xl font-bold">{summary.counts["Under Review"]}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Due Diligence</p>
              </div>
              <p className="text-3xl font-bold">{summary.counts["Due Diligence"]}</p>
              <p className="text-sm text-muted-foreground">In progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              </div>
              <p className="text-3xl font-bold">{summary.conversion}%</p>
              <p className="text-sm text-muted-foreground">Pipeline health</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Pipeline */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">Deal Pipeline</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search deals..."
                  className="pl-9 w-full sm:w-[200px] lg:w-[240px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter === "all" ? "all" : statusFilter}
                onValueChange={(v) => {
                  if (v === "all") setStatusFilter("all")
                  else setStatusFilter(v as any)
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Due Diligence">Due Diligence</SelectItem>
                  <SelectItem value="Declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="w-full sm:w-auto"
                onClick={fetchDeals}
                disabled={loading}
                aria-label="Refresh"
              >
                <Filter className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {error ? (
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={fetchDeals}>
                  Retry
                </Button>
              </div>
            ) : null}

            {!error && loading && deals.length === 0 ? (
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Loading deals…</p>
              </div>
            ) : null}

            {!error && !loading && filteredDeals.length === 0 ? (
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No deals yet. Click “Add Deal” to create your first one.
                </p>
              </div>
            ) : null}

            {filteredDeals.map((deal) => (
              <div key={deal.id} className="p-4 sm:p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <img src={deal.logo || "/placeholder.svg"} alt={deal.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        {deal.onboarded ? (
                          <Link
                            href={`/deal-room/${deal.id}`}
                            className="text-base sm:text-lg font-semibold hover:text-primary transition-colors truncate"
                          >
                            {deal.name}
                          </Link>
                        ) : deal.website ? (
                          <a
                            href={deal.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-base sm:text-lg font-semibold hover:text-primary transition-colors truncate"
                          >
                            {deal.name}
                          </a>
                        ) : (
                          <span className="text-base sm:text-lg font-semibold truncate">
                            {deal.name}
                          </span>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={statusColors[deal.status] as any} className="text-xs">
                            {deal.status}
                          </Badge>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                            {deal.score ?? 0}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{deal.tagline}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                          {deal.sector}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{deal.location}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          {deal.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      onClick={() => setEditDeal(deal)}
                      aria-label="Edit deal"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {deal.onboarded ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" asChild>
                        <Link href={`/deal-room/${deal.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : deal.website ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" asChild>
                        <a href={deal.website} target="_blank" rel="noreferrer" aria-label="Open website">
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Raising</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {typeof deal.asking === "number"
                          ? `$${(deal.asking / 1000000).toFixed(1)}M`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Valuation</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {typeof deal.valuation === "number"
                          ? `$${(deal.valuation / 1000000).toFixed(1)}M`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Submitted</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {deal.submittedDate ? new Date(deal.submittedDate).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(deal.highlights ?? []).map((highlight, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
