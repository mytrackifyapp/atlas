"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KPIStrip } from "@/components/kpi-card"
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Activity,
  Target,
  RefreshCw,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import Link from "next/link"

const quickActions = [
  { label: "Portfolio", href: "/portfolio", icon: Briefcase },
  { label: "Deal flow", href: "/deal-flow", icon: Zap },
  { label: "Reports", href: "/reports", icon: Target },
]

interface DashboardData {
  kpis: {
    portfolioValue: {
      value: string
      change: string
      trend: "up" | "down"
    }
    activeInvestments: {
      value: string
      change: string
      trend: "up" | "down"
    }
    portfolioHealth: {
      value: string
      change: string
      trend: "up" | "down"
    }
  }
  portfolioValueOverTime: Array<{ month: string; value: number }>
  topPerformers: Array<{
    id: string
    name: string
    sector: string
    growth: string
    value: string
    trend: "up" | "down"
  }>
  recentActivity: Array<{
    id: string
    type: string
    message: string
    time: string
    icon: string
  }>
}

const iconMap: Record<string, typeof DollarSign> = {
  DollarSign,
  Activity,
  Zap,
}

function formatAxisMillions(value: number) {
  if (!Number.isFinite(value)) return ""
  if (Math.abs(value) >= 1) {
    const digits = Math.abs(value) >= 10 ? 0 : 1
    return `$${value.toFixed(digits)}M`
  }
  const thousands = value * 1000
  if (Math.abs(thousands) >= 1) {
    const digits = Number.isInteger(thousands) ? 0 : 1
    return `$${thousands.toFixed(digits)}K`
  }
  return `$${value.toFixed(2)}M`
}

export function InvestorDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/dashboard/stats")
      const result = await response.json()

      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError("Failed to load dashboard data")
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Show loading state
  if (loading && !data) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !data) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Use real data or fallback to defaults
  const kpiData = data
    ? [
        {
          title: "Portfolio Value",
          value: data.kpis.portfolioValue.value,
          change: data.kpis.portfolioValue.change,
          trend: data.kpis.portfolioValue.trend,
          icon: DollarSign,
        },
        {
          title: "Active Investments",
          value: data.kpis.activeInvestments.value,
          change: data.kpis.activeInvestments.change,
          trend: data.kpis.activeInvestments.trend,
          icon: Briefcase,
        },
        {
          title: "Portfolio Health",
          value: data.kpis.portfolioHealth.value,
          change: data.kpis.portfolioHealth.change,
          trend: data.kpis.portfolioHealth.trend,
          icon: Target,
        },
      ]
    : []

  const portfolioValueData = data?.portfolioValueOverTime || []
  const topPerformers = data?.topPerformers || []
  const recentActivity = data?.recentActivity || []

  const growthPercentage = data?.kpis.portfolioValue.change || "0%"

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your portfolio at a glance</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-10 rounded-full"
            onClick={fetchDashboardData}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw className={loading ? "animate-spin" : undefined} />
          </Button>
          <Button asChild className="h-10 rounded-full px-4">
            <Link href="/deal-flow">
              <Plus className="h-4 w-4" />
              New Deal
            </Link>
          </Button>
        </div>
      </div>

      {kpiData.length > 0 ? <KPIStrip items={kpiData} /> : null}

      <div className="grid grid-cols-3 gap-2 lg:hidden">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-1.5 whitespace-normal rounded-2xl px-2 py-3 text-center text-xs leading-tight"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="gap-3 py-4 lg:col-span-2 lg:gap-6 lg:py-6">
          <CardHeader className="px-4 lg:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle>Portfolio Value</CardTitle>
                <CardDescription>6-month performance trend</CardDescription>
              </div>
              <Badge variant="outline" className="shrink-0 border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                {growthPercentage}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 lg:px-6">
            {portfolioValueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={portfolioValueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c1ff72" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c1ff72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={formatAxisMillions}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [formatAxisMillions(value), "Value"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#c1ff72"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p className="text-sm">No portfolio data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="gap-3 py-4 lg:gap-6 lg:py-6">
          <CardHeader className="px-4 lg:px-6">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 lg:px-6">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const IconComponent = iconMap[activity.icon] || Activity
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
            <Button variant="ghost" className="w-full" size="sm" asChild>
              <Link href="/portfolio">
                View All Activity
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="gap-3 py-4 lg:gap-6 lg:py-6">
          <CardHeader className="px-4 lg:px-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Your best performing investments</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0" asChild>
                <Link href="/portfolio">
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 lg:px-6">
            <div className="space-y-4">
              {topPerformers.length > 0 ? (
                topPerformers.map((company, index) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent/50 sm:p-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{company.sector}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-semibold">{company.value}</p>
                      <div className="flex items-center gap-1">
                        {company.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            company.trend === "up" ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {company.growth}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No portfolio companies yet</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/portfolio">
                      Add Company
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hidden gap-3 py-4 lg:flex lg:gap-6 lg:py-6">
          <CardHeader className="px-4 lg:px-6">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to key sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="h-5 w-5 mr-3" />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{action.label}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
