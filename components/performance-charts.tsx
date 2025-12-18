"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const portfolioValueData = [
  { month: "Jan", value: 8.2 },
  { month: "Feb", value: 8.8 },
  { month: "Mar", value: 9.4 },
  { month: "Apr", value: 10.1 },
  { month: "May", value: 10.8 },
  { month: "Jun", value: 11.5 },
  { month: "Jul", value: 12.4 },
]

const sectorData = [
  { name: "Fintech", value: 35, color: "#10b981" },
  { name: "Healthtech", value: 20, color: "#3b82f6" },
  { name: "Edtech", value: 15, color: "#8b5cf6" },
  { name: "Agritech", value: 18, color: "#f59e0b" },
  { name: "Logistics", value: 12, color: "#ef4444" },
]

const geographyData = [
  { country: "Nigeria", value: 4.2 },
  { country: "Kenya", value: 3.1 },
  { country: "South Africa", value: 2.4 },
  { country: "Egypt", value: 1.8 },
  { country: "Ghana", value: 0.9 },
]

export function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Portfolio Value Over Time */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Portfolio Value Over Time</CardTitle>
          <CardDescription>Total value of your portfolio in millions (USD)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioValueData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Allocation by Sector */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation by Sector</CardTitle>
          <CardDescription>Investment distribution (%)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {sectorData.map((sector) => (
              <div key={sector.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: sector.color }} />
                  <span>{sector.name}</span>
                </div>
                <span className="font-medium">{sector.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation by Geography */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Allocation by Geography</CardTitle>
          <CardDescription>Investment by country in millions (USD)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={geographyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="country" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
