"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Building2,
  Calendar,
  Eye,
  Plus,
  Activity,
  Target,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import Link from "next/link"

const portfolioValueData = [
  { month: "Jan", value: 10.2 },
  { month: "Feb", value: 10.8 },
  { month: "Mar", value: 11.5 },
  { month: "Apr", value: 11.9 },
  { month: "May", value: 12.1 },
  { month: "Jun", value: 12.4 },
]

const topPerformers = [
  {
    id: 1,
    name: "TechFlow Africa",
    sector: "FinTech",
    growth: "+24.5%",
    value: "$2.1M",
    trend: "up" as const,
  },
  {
    id: 2,
    name: "AgriTech Solutions",
    sector: "AgriTech",
    growth: "+18.2%",
    value: "$1.8M",
    trend: "up" as const,
  },
  {
    id: 3,
    name: "HealthBridge",
    sector: "HealthTech",
    growth: "+15.7%",
    value: "$1.5M",
    trend: "up" as const,
  },
]

const recentActivity = [
  {
    id: 1,
    type: "investment",
    message: "New investment in TechFlow Africa",
    time: "2 hours ago",
    icon: DollarSign,
  },
  {
    id: 2,
    type: "update",
    message: "AgriTech Solutions monthly update received",
    time: "5 hours ago",
    icon: Activity,
  },
  {
    id: 3,
    type: "deal",
    message: "3 new deals in your inbox",
    time: "1 day ago",
    icon: Zap,
  },
]

const quickActions = [
  { label: "View Portfolio", href: "/portfolio", icon: Briefcase },
  { label: "Deal Flow", href: "/deal-flow", icon: Zap },
  { label: "Analytics", href: "/reports", icon: Target },
]

const kpiData = [
  {
    title: "Portfolio Value",
    value: "$12.4M",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Active Investments",
    value: "24",
    change: "+3 this month",
    trend: "up" as const,
    icon: Briefcase,
  },
  {
    title: "Portfolio Health",
    value: "87/100",
    change: "+5 points",
    trend: "up" as const,
    icon: Target,
  },
]

export function InvestorDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your portfolio at a glance"
        actions={
          <Button size="sm" asChild>
            <Link href="/deal-flow">
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Link>
          </Button>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="border-border hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  </div>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1.5">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        kpi.trend === "up" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Value Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Portfolio Value</CardTitle>
                <CardDescription>6-month performance trend</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={portfolioValueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c1ff72" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c1ff72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value}M`, "Value"]}
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
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <activity.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full" size="sm" asChild>
              <Link href="/portfolio">
                View All Activity
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Your best performing investments</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/portfolio">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((company, index) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
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
