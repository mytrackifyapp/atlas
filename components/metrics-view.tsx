"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, Download } from "lucide-react"
import {
  LineChart,
  Line,
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

const revenueData = [
  { month: "Jan", revenue: 125000, mrr: 118000, arr: 1416000 },
  { month: "Feb", revenue: 142000, mrr: 135000, arr: 1620000 },
  { month: "Mar", revenue: 168000, mrr: 158000, arr: 1896000 },
  { month: "Apr", revenue: 195000, mrr: 182000, arr: 2184000 },
  { month: "May", revenue: 218000, mrr: 205000, arr: 2460000 },
  { month: "Jun", revenue: 245000, mrr: 232000, arr: 2784000 },
]

const userGrowthData = [
  { month: "Jan", users: 2400, activeUsers: 1850, churn: 120 },
  { month: "Feb", users: 3100, activeUsers: 2450, churn: 95 },
  { month: "Mar", users: 3850, activeUsers: 3100, churn: 110 },
  { month: "Apr", users: 4680, activeUsers: 3820, churn: 85 },
  { month: "May", users: 5520, activeUsers: 4550, churn: 92 },
  { month: "Jun", users: 6450, activeUsers: 5380, churn: 78 },
]

const customerAcquisitionData = [
  { month: "Jan", cac: 245, ltv: 1850 },
  { month: "Feb", cac: 238, ltv: 1920 },
  { month: "Mar", cac: 225, ltv: 2050 },
  { month: "Apr", cac: 218, ltv: 2180 },
  { month: "May", cac: 205, ltv: 2320 },
  { month: "Jun", cac: 195, ltv: 2450 },
]

const burnRateData = [
  { month: "Jan", revenue: 125000, expenses: 185000, burnRate: -60000 },
  { month: "Feb", revenue: 142000, expenses: 192000, burnRate: -50000 },
  { month: "Mar", revenue: 168000, expenses: 198000, burnRate: -30000 },
  { month: "Apr", revenue: 195000, expenses: 205000, burnRate: -10000 },
  { month: "May", revenue: 218000, expenses: 208000, burnRate: 10000 },
  { month: "Jun", revenue: 245000, expenses: 215000, burnRate: 30000 },
]

export function MetricsView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Metrics"
        description="Track key performance indicators and business metrics"
        actions={
          <div className="flex items-center gap-3">
            <Select defaultValue="6m">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">MRR</p>
              <p className="text-3xl font-bold">$232K</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+13.2% MoM</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">ARR</p>
              <p className="text-3xl font-bold">$2.78M</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+96.5% YoY</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold">5,380</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+18.2% MoM</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Burn Rate</p>
              <p className="text-3xl font-bold">+$30K</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Cash flow positive</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
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
                  dataKey="revenue"
                  stackId="1"
                  stroke="#c1ff72"
                  fill="#c1ff72"
                  fillOpacity={0.6}
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stackId="2"
                  stroke="#60a5fa"
                  fill="#60a5fa"
                  fillOpacity={0.6}
                  name="MRR"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
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
                <Line type="monotone" dataKey="users" stroke="#c1ff72" strokeWidth={2} name="Total Users" />
                <Line type="monotone" dataKey="activeUsers" stroke="#60a5fa" strokeWidth={2} name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Unit Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition (CAC vs LTV)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerAcquisitionData}>
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
                <Line type="monotone" dataKey="ltv" stroke="#c1ff72" strokeWidth={2} name="LTV" />
                <Line type="monotone" dataKey="cac" stroke="#f472b6" strokeWidth={2} name="CAC" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow & Burn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={burnRateData}>
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
                <Bar dataKey="revenue" fill="#c1ff72" name="Revenue" />
                <Bar dataKey="expenses" fill="#f472b6" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
