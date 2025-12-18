"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const portfolioData = [
  {
    id: "1",
    name: "PayStack Clone",
    logo: "PS",
    stage: "Series A",
    country: "Nigeria",
    investment: "$500K",
    ownership: "12%",
    growth: "+45%",
    growthTrend: "up" as const,
    runway: 18,
    status: "Healthy" as const,
  },
  {
    id: "2",
    name: "AgriTech Solutions",
    logo: "AS",
    stage: "Seed",
    country: "Kenya",
    investment: "$250K",
    ownership: "15%",
    growth: "+32%",
    growthTrend: "up" as const,
    runway: 12,
    status: "Healthy" as const,
  },
  {
    id: "3",
    name: "HealthConnect",
    logo: "HC",
    stage: "Pre-Seed",
    country: "South Africa",
    investment: "$100K",
    ownership: "20%",
    growth: "+28%",
    growthTrend: "up" as const,
    runway: 8,
    status: "Watch" as const,
  },
  {
    id: "4",
    name: "EduPlatform",
    logo: "EP",
    stage: "Seed",
    country: "Ghana",
    investment: "$200K",
    ownership: "18%",
    growth: "-5%",
    growthTrend: "down" as const,
    runway: 6,
    status: "At Risk" as const,
  },
  {
    id: "5",
    name: "LogiTrans",
    logo: "LT",
    stage: "Series A",
    country: "Egypt",
    investment: "$600K",
    ownership: "10%",
    growth: "+52%",
    growthTrend: "up" as const,
    runway: 20,
    status: "Healthy" as const,
  },
]

const statusColors = {
  Healthy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Watch: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "At Risk": "bg-red-500/10 text-red-700 dark:text-red-400",
}

export function PortfolioTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-sm text-muted-foreground">
            <th className="text-left py-3 px-2 font-medium">Company</th>
            <th className="text-left py-3 px-2 font-medium">Stage</th>
            <th className="text-left py-3 px-2 font-medium">Country</th>
            <th className="text-left py-3 px-2 font-medium">Investment</th>
            <th className="text-left py-3 px-2 font-medium">Ownership</th>
            <th className="text-left py-3 px-2 font-medium">Revenue Growth</th>
            <th className="text-left py-3 px-2 font-medium">Runway</th>
            <th className="text-left py-3 px-2 font-medium">Status</th>
            <th className="text-left py-3 px-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {portfolioData.map((company) => (
            <tr key={company.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-4 px-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {company.logo}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{company.name}</span>
                </div>
              </td>
              <td className="py-4 px-2">
                <Badge variant="secondary">{company.stage}</Badge>
              </td>
              <td className="py-4 px-2 text-sm">{company.country}</td>
              <td className="py-4 px-2 text-sm font-medium">{company.investment}</td>
              <td className="py-4 px-2 text-sm">{company.ownership}</td>
              <td className="py-4 px-2">
                <div className="flex items-center gap-1">
                  {company.growthTrend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      company.growthTrend === "up" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {company.growth}
                  </span>
                </div>
              </td>
              <td className="py-4 px-2 text-sm">{company.runway} months</td>
              <td className="py-4 px-2">
                <Badge className={statusColors[company.status]} variant="secondary">
                  {company.status}
                </Badge>
              </td>
              <td className="py-4 px-2">
                <Link href={`/deal-room/${company.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
