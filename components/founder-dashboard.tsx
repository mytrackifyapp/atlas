"use client"

import { DollarSign, Flame, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"

const kpiData = [
  { title: "Monthly Revenue", value: "$125K", change: "+18%", trend: "up" as const, icon: DollarSign },
  { title: "Burn Rate", value: "$85K/mo", change: "+5%", trend: "up" as const, icon: Flame },
  { title: "Runway", value: "18 months", change: "Stable", icon: TrendingUp },
  { title: "Active Investors", value: "12", change: "+3", trend: "up" as const, icon: Users },
]

const revenueData = [
  { month: "Jan", revenue: 85, expenses: 70 },
  { month: "Feb", revenue: 92, expenses: 75 },
  { month: "Mar", revenue: 98, expenses: 78 },
  { month: "Apr", revenue: 105, expenses: 80 },
  { month: "May", revenue: 115, expenses: 82 },
  { month: "Jun", revenue: 125, expenses: 85 },
]

const cashFlowData = [
  { month: "Jan", cash: 450 },
  { month: "Feb", cash: 467 },
  { month: "Mar", cash: 487 },
  { month: "Apr", cash: 512 },
  { month: "May", cash: 545 },
  { month: "Jun", cash: 585 },
]

export function FounderDashboard() {
  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Founder Dashboard"
        description="Track your company performance and manage investor relationships"
        breadcrumbs={[{ label: "Dashboard" }, { label: "Founder Overview" }]}
        actions={
          <>
            <Button variant="outline">Send Update</Button>
            <Button>Start Fundraise</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Current Fundraise</CardTitle>
              <CardDescription>Series A Round</CardDescription>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target</span>
              <span className="font-semibold">$2.5M</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Committed</span>
                <span className="font-semibold text-emerald-600">$1.8M (72%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 w-[72%] transition-all" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">
                View Data Room
              </Button>
              <Button variant="outline" size="sm">
                Share Raise Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Revenue & Expenses</CardTitle>
            <CardDescription>Monthly comparison in thousands (USD)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Cash Flow</CardTitle>
            <CardDescription>Available cash in thousands (USD)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cashFlowData}>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Recent Investor Interest</CardTitle>
          <CardDescription>Investors who have expressed interest in your raise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Africa Ventures Fund", status: "Interested", date: "2 days ago" },
              { name: "TechStars Africa", status: "Reviewing", date: "5 days ago" },
              { name: "Seedcamp", status: "Due Diligence", date: "1 week ago" },
            ].map((investor) => (
              <div
                key={investor.name}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-medium">{investor.name}</div>
                  <div className="text-sm text-muted-foreground">{investor.date}</div>
                </div>
                <Badge variant="secondary">{investor.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
