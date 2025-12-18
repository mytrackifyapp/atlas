"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp } from "lucide-react"
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

const portfolioPerformance = [
  { month: "Jan '24", value: 12500000, invested: 9750000, roi: 28 },
  { month: "Feb '24", value: 13200000, invested: 9750000, roi: 35 },
  { month: "Mar '24", value: 14100000, invested: 9750000, roi: 45 },
  { month: "Apr '24", value: 15800000, invested: 9750000, roi: 62 },
  { month: "May '24", value: 16200000, invested: 9750000, roi: 66 },
  { month: "Jun '24", value: 17500000, invested: 9750000, roi: 79 },
]

const dealFlowMetrics = [
  { month: "Jan", received: 45, reviewed: 38, invested: 2 },
  { month: "Feb", received: 52, reviewed: 45, invested: 3 },
  { month: "Mar", received: 48, reviewed: 41, invested: 2 },
  { month: "Apr", received: 61, reviewed: 52, invested: 4 },
  { month: "May", received: 58, reviewed: 49, invested: 3 },
  { month: "Jun", received: 67, reviewed: 58, invested: 5 },
]

const sectorPerformance = [
  { sector: "AI/ML", returns: 85, invested: 4200000 },
  { sector: "HealthTech", returns: 68, invested: 2800000 },
  { sector: "FinTech", returns: 52, invested: 1200000 },
  { sector: "CleanTech", returns: -8, invested: 1800000 },
  { sector: "SaaS", returns: 91, invested: 5500000 },
]

const cashFlowData = [
  { month: "Jan", inflow: 450000, outflow: 1200000 },
  { month: "Feb", inflow: 380000, outflow: 0 },
  { month: "Mar", inflow: 520000, outflow: 2500000 },
  { month: "Apr", inflow: 680000, outflow: 0 },
  { month: "May", inflow: 420000, outflow: 750000 },
  { month: "Jun", inflow: 890000, outflow: 0 },
]

export function AnalyticsView() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Analytics"
        description="In-depth analysis of your investment performance"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Select defaultValue="6m">
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
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total ROI</p>
              <p className="text-3xl font-bold">79.5%</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12.3% vs last quarter</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">IRR</p>
              <p className="text-3xl font-bold">42.8%</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Above target</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
              <p className="text-3xl font-bold">$1.95M</p>
              <p className="text-sm text-muted-foreground">Across 5 companies</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Deployment Rate</p>
              <p className="text-3xl font-bold">68%</p>
              <p className="text-sm text-muted-foreground">Of committed capital</p>
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
