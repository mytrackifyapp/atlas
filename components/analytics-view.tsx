"use client"

import { useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, RefreshCw } from "lucide-react"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type RangeKey = "1m" | "3m" | "6m" | "1y" | "all"

type AnalyticsResponse = {
  kpis: {
    totalRoiPercent: number
    irrPercent: number
    avgDealSize: number
    deploymentRatePercent: number
  }
  portfolioPerformance: Array<{ month: string; value: number; invested: number; roi: number }>
  dealFlowMetrics: Array<{ month: string; received: number; reviewed: number; invested: number }>
  sectorPerformance: Array<{ sector: string; returns: number; invested: number }>
  cashFlowData: Array<{ month: string; inflow: number; outflow: number }>
}

export function AnalyticsView() {
  const [range, setRange] = useState<RangeKey>("6m")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsResponse | null>(null)

  const fetchAnalytics = async (r: RangeKey) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/analytics?range=${encodeURIComponent(r)}`)
      const body = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(body?.error || "Failed to load analytics")
      setData(body?.data ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(range)
  }, [range])

  const kpis = data?.kpis

  const portfolioPerformance = useMemo(() => data?.portfolioPerformance ?? [], [data])
  const dealFlowMetrics = useMemo(() => data?.dealFlowMetrics ?? [], [data])
  const sectorPerformance = useMemo(() => data?.sectorPerformance ?? [], [data])
  const cashFlowData = useMemo(() => data?.cashFlowData ?? [], [data])

  const exportJson = async () => {
    const json = JSON.stringify({ range, data }, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${range}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Analytics"
        description="In-depth analysis of your investment performance"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => fetchAnalytics(range)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={exportJson}
              disabled={!data}
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        }
      />

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchAnalytics(range)}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total ROI</p>
              <p className="text-3xl font-bold">{kpis ? `${kpis.totalRoiPercent}%` : "—"}</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{kpis ? "Updated from live data" : "Loading…"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">IRR</p>
              <p className="text-3xl font-bold">{kpis ? `${kpis.irrPercent}%` : "—"}</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{kpis ? "Heuristic estimate" : "Loading…"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
              <p className="text-3xl font-bold">
                {kpis ? `$${(kpis.avgDealSize / 1_000_000).toFixed(2)}M` : "—"}
              </p>
              <p className="text-sm text-muted-foreground">{data ? "Across portfolio companies" : "Loading…"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Deployment Rate</p>
              <p className="text-3xl font-bold">{kpis ? `${kpis.deploymentRatePercent}%` : "—"}</p>
              <p className="text-sm text-muted-foreground">Placeholder until committed capital is modeled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minHeight={250}>
              <AreaChart data={portfolioPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stackId="1"
                  stroke="#c1ff72"
                  fill="#c1ff72"
                  fillOpacity={0.6}
                  name="Portfolio Value"
                />
                <Area
                  type="monotone"
                  dataKey="invested"
                  stackId="2"
                  stroke="#60a5fa"
                  fill="#60a5fa"
                  fillOpacity={0.6}
                  name="Total Invested"
                />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Deal Flow Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minHeight={250}>
              <BarChart data={dealFlowMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="received" fill="#60a5fa" name="Received" />
                <Bar dataKey="reviewed" fill="#a78bfa" name="Reviewed" />
                <Bar dataKey="invested" fill="#c1ff72" name="Invested" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sector Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minHeight={250}>
            <BarChart data={sectorPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="sector" type="category" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="returns" fill="#c1ff72" name="Returns %" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minHeight={250}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="inflow" fill="#c1ff72" name="Inflow" />
              <Bar dataKey="outflow" fill="#f472b6" name="Outflow" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
