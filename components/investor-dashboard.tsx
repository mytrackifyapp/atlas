"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PortfolioTable } from "@/components/portfolio-table"
import { PerformanceCharts } from "@/components/performance-charts"
import { DealFlowList } from "@/components/deal-flow-list"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"

const kpiData = [
  {
    title: "Total Portfolio Value",
    value: "$12.4M",
    change: "+12.5%",
    trend: "up" as const,
  },
  {
    title: "Active Investments",
    value: "24",
    change: "+3",
    trend: "up" as const,
  },
  {
    title: "Deployed Capital",
    value: "$8.2M",
    change: "+$1.2M",
    trend: "up" as const,
  },
  {
    title: "Average Runway",
    value: "14 months",
    change: "-2 months",
    trend: "down" as const,
  },
  {
    title: "Portfolio Health",
    value: "87/100",
    change: "+5",
    trend: "up" as const,
  },
]

export function InvestorDashboard() {
  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Investor Dashboard"
        description="Track your portfolio performance and discover new opportunities across Africa"
        breadcrumbs={[{ label: "Dashboard" }, { label: "Overview" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} trend={kpi.trend} />
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>Your active investments across Africa's startup ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioTable />
        </CardContent>
      </Card>

      <PerformanceCharts />

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Deal Flow Inbox</CardTitle>
          <CardDescription>New startups seeking investment — 8 opportunities this week</CardDescription>
        </CardHeader>
        <CardContent>
          <DealFlowList />
        </CardContent>
      </Card>
    </div>
  )
}
