"use client"

import { useState, useEffect } from "react"
import { DollarSign, Flame, TrendingUp, Users, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import { StartFundraiseDialog } from "@/components/start-fundraise-dialog"

interface FounderStats {
  kpis: {
    monthlyRevenue: {
      value: string
      change: string
      trend: "up" | "down"
    }
    burnRate: {
      value: string
      change: string
      trend: "up" | "down"
    }
    runway: {
      value: string
      change: string
      trend: "up" | "down"
    }
    activeInvestors: {
      value: string
      change: string
      trend: "up" | "down"
    }
  }
  currentFundraise: {
    roundType: string
    target: number
    committed: number
    percentage: number
    status: string
  } | null
  revenueData: Array<{ month: string; revenue: number; expenses: number }>
  cashFlowData: Array<{ month: string; cash: number }>
  investorInterests: Array<{ name: string; status: string; date: string }>
}

export function FounderDashboard() {
  const [startFundraiseOpen, setStartFundraiseOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<FounderStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/founder/stats")
      const result = await response.json()

      if (result.success && result.data) {
        setStats(result.data)
      } else {
        setError("Failed to load dashboard data")
      }
    } catch (err) {
      console.error("Error fetching founder stats:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleFundraiseSuccess = () => {
    // Refresh stats after fundraise is started
    fetchStats()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <StartFundraiseDialog
        open={startFundraiseOpen}
        onOpenChange={setStartFundraiseOpen}
        onSuccess={handleFundraiseSuccess}
      />

      <PageHeader
        title="Founder Dashboard"
        description="Track your company performance and manage investor relationships"
        breadcrumbs={[{ label: "Dashboard" }, { label: "Founder Overview" }]}
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Send Update
            </Button>
            <Button size="sm" onClick={() => setStartFundraiseOpen(true)} className="w-full sm:w-auto">
              Start Fundraise
            </Button>
          </div>
        }
      />

      {loading && !stats ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error && !stats ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats && (
              <>
                <KPICard
                  title="Monthly Revenue"
                  value={stats.kpis.monthlyRevenue.value}
                  change={stats.kpis.monthlyRevenue.change}
                  trend={stats.kpis.monthlyRevenue.trend}
                  icon={DollarSign}
                />
                <KPICard
                  title="Burn Rate"
                  value={stats.kpis.burnRate.value}
                  change={stats.kpis.burnRate.change}
                  trend={stats.kpis.burnRate.trend}
                  icon={Flame}
                />
                <KPICard
                  title="Runway"
                  value={stats.kpis.runway.value}
                  change={stats.kpis.runway.change}
                  trend={stats.kpis.runway.trend}
                  icon={TrendingUp}
                />
                <KPICard
                  title="Active Investors"
                  value={stats.kpis.activeInvestors.value}
                  change={stats.kpis.activeInvestors.change}
                  trend={stats.kpis.activeInvestors.trend}
                  icon={Users}
                />
              </>
            )}
          </div>

          {stats?.currentFundraise ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Current Fundraise</CardTitle>
                    <CardDescription>{stats.currentFundraise.roundType} Round</CardDescription>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    {stats.currentFundraise.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target</span>
                    <span className="font-semibold">${(stats.currentFundraise.target / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Committed</span>
                      <span className="font-semibold text-emerald-600">
                        ${(stats.currentFundraise.committed / 1000000).toFixed(1)}M ({stats.currentFundraise.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all"
                        style={{ width: `${stats.currentFundraise.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/founder/fundraising">View Data Room</a>
                    </Button>
                    <Button variant="outline" size="sm">
                      Share Raise Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Current Fundraise</CardTitle>
                <CardDescription>No active fundraise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">You don't have an active fundraise yet.</p>
                  <Button onClick={() => setStartFundraiseOpen(true)}>
                    Start Your First Fundraise
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg sm:text-xl">Revenue & Expenses</CardTitle>
            <CardDescription>Monthly comparison in thousands (USD)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="w-full overflow-x-auto">
              {stats && stats.revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} minHeight={200}>
                  <BarChart data={stats.revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  <p className="text-sm">No revenue data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg sm:text-xl">Cash Flow</CardTitle>
            <CardDescription>Available cash in thousands (USD)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="w-full overflow-x-auto">
              {stats && stats.cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} minHeight={200}>
                  <LineChart data={stats.cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                    <Line type="monotone" dataKey="cash" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  <p className="text-sm">No cash flow data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg sm:text-xl">Recent Investor Interest</CardTitle>
          <CardDescription>Investors who have expressed interest in your raise</CardDescription>
        </CardHeader>
        <CardContent>
          {stats && stats.investorInterests.length > 0 ? (
            <div className="space-y-3">
              {stats.investorInterests.map((investor, index) => (
                <div
                  key={`${investor.name}-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{investor.name}</div>
                    <div className="text-sm text-muted-foreground">{investor.date}</div>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {investor.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No investor interest yet</p>
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}
