"use client"

import { useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, Eye, Plus, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const statusColors = {
  Published: "default",
  Draft: "secondary",
  Archived: "outline",
}

type ReportItem = {
  id: string
  title: string
  type: "Quarterly" | "Monthly" | "Annual" | "Company" | "Sector"
  date: string
  status: "Published" | "Draft" | "Archived"
  description: string
}

export function ReportsView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reports, setReports] = useState<ReportItem[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  const [viewOpen, setViewOpen] = useState(false)
  const [activeReport, setActiveReport] = useState<{ title: string; json: any } | null>(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/reports")
      const data = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(data?.error || "Failed to load reports")
      setReports(Array.isArray(data?.data?.reports) ? data.data.reports : [])
      setCategoryCounts(data?.data?.categoryCounts ?? {})
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const categories = useMemo(
    () => [
      { key: "Quarterly", color: "text-primary" },
      { key: "Monthly", color: "text-blue-500" },
      { key: "Company", color: "text-purple-500" },
      { key: "Sector", color: "text-pink-500" },
      { key: "Annual", color: "text-orange-500" },
    ],
    []
  )

  const openReport = async (report: ReportItem) => {
    try {
      setError(null)
      const res = await fetch(`/api/reports/${report.id}`)
      const data = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(data?.error || "Failed to load report")
      setActiveReport({ title: report.title, json: data?.report ?? data })
      setViewOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report")
    }
  }

  const downloadReport = async (report: ReportItem) => {
    try {
      setError(null)
      const res = await fetch(`/api/reports/${report.id}`)
      const data = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(data?.error || "Failed to download report")
      const json = JSON.stringify(data?.report ?? data, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.id}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to download report")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Reports"
        description="Access and manage investment reports and analysis"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button size="sm" variant="outline" onClick={fetchReports} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" className="w-full sm:w-auto" disabled>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Create Report</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        }
      />

      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open)
          if (!open) setActiveReport(null)
        }}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{activeReport?.title ?? "Report"}</DialogTitle>
            <DialogDescription>Generated from your Trackify data</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] rounded-md border border-border">
            <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {activeReport ? JSON.stringify(activeReport.json, null, 2) : ""}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Report Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {categories.map((cat) => (
          <Card key={cat.key}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <FileText className={`h-8 w-8 ${cat.color} mb-2`} />
                <p className="text-sm font-medium text-muted-foreground">{cat.key}</p>
                <p className="text-2xl font-bold">{categoryCounts?.[cat.key] ?? (loading ? "—" : 0)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {error ? (
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={fetchReports}>
                  Retry
                </Button>
              </div>
            ) : null}

            {!error && loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading reports…</span>
              </div>
            ) : null}

            {!error && !loading && reports.length === 0 ? (
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No reports available yet. Add deals and portfolio companies to generate reports.
                </p>
              </div>
            ) : null}

            {!loading &&
              reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="font-semibold truncate">{report.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={statusColors[report.status] as any} className="text-xs">{report.status}</Badge>
                        <Badge variant="outline" className="text-xs">{report.type}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{report.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        {new Date(report.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => openReport(report)}
                  >
                    <Eye className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => downloadReport(report)}
                  >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
