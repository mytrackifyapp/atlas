"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Calendar,
  ArrowUpRight,
  Filter,
  Search,
  Download,
} from "lucide-react"
import Link from "next/link"
import { AddCompanyDialog } from "@/components/add-company-dialog"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Default/fallback companies for demo
const defaultCompanies = [
  {
    id: 1,
    name: "TechFlow AI",
    logo: "/abstract-tech-logo.png",
    sector: "AI/ML",
    stage: "Series B",
    investment: 2500000,
    currentValue: 4200000,
    ownership: 12.5,
    lastRound: "Series B",
    lastRoundDate: "2024-03-15",
    location: "San Francisco, CA",
    growth: 68,
    status: "Active",
  },
  {
    id: 2,
    name: "HealthMetrics",
    logo: "/abstract-health-logo.png",
    sector: "HealthTech",
    stage: "Series A",
    investment: 1500000,
    currentValue: 2800000,
    ownership: 15.2,
    lastRound: "Series A",
    lastRoundDate: "2024-01-20",
    location: "Boston, MA",
    growth: 87,
    status: "Active",
  },
  {
    id: 3,
    name: "FinStack",
    logo: "/finance-logo.png",
    sector: "FinTech",
    stage: "Seed",
    investment: 750000,
    currentValue: 1200000,
    ownership: 20.0,
    lastRound: "Seed",
    lastRoundDate: "2023-11-10",
    location: "New York, NY",
    growth: 60,
    status: "Active",
  },
  {
    id: 4,
    name: "EcoShip",
    logo: "/eco-logo.png",
    sector: "CleanTech",
    stage: "Series A",
    investment: 2000000,
    currentValue: 1800000,
    ownership: 10.5,
    lastRound: "Series A",
    lastRoundDate: "2023-09-05",
    location: "Seattle, WA",
    growth: -10,
    status: "Watch",
  },
  {
    id: 5,
    name: "DataViz Pro",
    logo: "/data-logo.png",
    sector: "SaaS",
    stage: "Series B",
    investment: 3000000,
    currentValue: 5500000,
    ownership: 8.3,
    lastRound: "Series B",
    lastRoundDate: "2024-02-28",
    location: "Austin, TX",
    growth: 83,
    status: "Star",
  },
]

const performanceData = [
  { month: "Jan", value: 12500000 },
  { month: "Feb", value: 13200000 },
  { month: "Mar", value: 14100000 },
  { month: "Apr", value: 15800000 },
  { month: "May", value: 16200000 },
  { month: "Jun", value: 17500000 },
]

const sectorAllocation = [
  { name: "AI/ML", value: 4200000, percentage: 24 },
  { name: "HealthTech", value: 2800000, percentage: 16 },
  { name: "FinTech", value: 1200000, percentage: 7 },
  { name: "CleanTech", value: 1800000, percentage: 10 },
  { name: "SaaS", value: 5500000, percentage: 31 },
  { name: "Others", value: 2000000, percentage: 12 },
]

const COLORS = ["#c1ff72", "#60a5fa", "#a78bfa", "#f472b6", "#fb923c", "#94a3b8"]

interface PortfolioCompany {
  id: string | number
  name: string
  logo?: string | null
  sector?: string
  industry?: string
  stage?: string
  investment?: number
  amount?: number
  currentValue?: number
  ownership?: number
  lastRound?: string
  lastRoundDate?: string
  location?: string
  country?: string
  growth?: number
  status?: string
}

export function PortfolioView() {
  const [addCompanyOpen, setAddCompanyOpen] = useState(false)
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>(defaultCompanies)
  const [loading, setLoading] = useState(false)

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/portfolio/companies")
      const data = await response.json()
      
      if (data.success && data.companies) {
        // Transform database companies to match the display format
        const transformedCompanies = data.companies.map((company: any) => ({
          id: company.id,
          name: company.name,
          logo: company.logo || null, // Use the logo URL from database
          sector: company.industry || company.sector,
          industry: company.industry,
          stage: company.stage,
          investment: company.amount || company.investment || 0,
          amount: company.amount,
          currentValue: company.amount ? company.amount * 1.5 : 0, // Calculate or use actual value
          ownership: 0, // Default or calculate
          location: company.location || "",
          country: company.country || "",
          growth: 0, // Default or calculate
          status: "Active",
        }))
        
        // Show database companies first, then default companies
        // Filter out duplicates if any default companies match by name
        const defaultCompanyNames = new Set(transformedCompanies.map((c: any) => c.name.toLowerCase()))
        const uniqueDefaultCompanies = defaultCompanies.filter(
          (dc) => !defaultCompanyNames.has(dc.name.toLowerCase())
        )
        
        setPortfolioCompanies([...transformedCompanies, ...uniqueDefaultCompanies])
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleCompanyAdded = () => {
    // Refresh the companies list
    fetchCompanies()
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Portfolio"
        description="Manage and track your portfolio companies"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" onClick={() => setAddCompanyOpen(true)} className="w-full sm:w-auto">
              <Building2 className="h-4 w-4 sm:mr-2" />
              Add Company
            </Button>
          </div>
        }
      />

      <AddCompanyDialog
        open={addCompanyOpen}
        onOpenChange={setAddCompanyOpen}
        onSuccess={handleCompanyAdded}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
              <p className="text-3xl font-bold">$17.5M</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+18.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Companies</p>
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Across 5 sectors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
              <p className="text-3xl font-bold">$9.75M</p>
              <p className="text-sm text-muted-foreground">Average: $1.95M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Unrealized Gains</p>
              <p className="text-3xl font-bold">$7.75M</p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>79.5% ROI</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Portfolio Value Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minHeight={250}>
              <LineChart data={performanceData}>
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
                <Line type="monotone" dataKey="value" stroke="#c1ff72" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minHeight={250}>
              <PieChart>
                <Pie
                  data={sectorAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Companies */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">Portfolio Companies</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search companies..." className="pl-9 w-full sm:w-[200px] lg:w-[240px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="w-full sm:w-auto">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {portfolioCompanies.map((company) => (
              <div
                key={company.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <img 
                    src={company.logo || "/placeholder.svg"} 
                    alt={company.name} 
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover bg-muted flex-shrink-0" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <Link
                        href={`/deal-room/${company.id}`}
                        className="font-semibold hover:text-primary transition-colors truncate"
                      >
                        {company.name}
                      </Link>
                      <Badge
                        variant={
                          company.status === "Star" ? "default" : company.status === "Watch" ? "secondary" : "outline"
                        }
                        className="w-fit"
                      >
                        {company.status || "Active"}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{company.sector || company.industry || "—"}</span>
                      </span>
                      {(company.location || company.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{company.location || company.country}</span>
                        </span>
                      )}
                      {company.stage && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          {company.stage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 flex-shrink-0">
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6">
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Investment</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {company.investment || company.amount
                          ? `$${((company.investment || company.amount || 0) / 1000000).toFixed(2)}M`
                          : "—"}
                      </p>
                    </div>
                    {company.currentValue && (
                      <div className="text-left sm:text-right space-y-1">
                        <p className="text-xs sm:text-sm text-muted-foreground">Current Value</p>
                        <p className="font-semibold text-sm sm:text-base">${(company.currentValue / 1000000).toFixed(2)}M</p>
                      </div>
                    )}
                    {company.ownership && (
                      <div className="text-left sm:text-right space-y-1 hidden sm:block">
                        <p className="text-xs sm:text-sm text-muted-foreground">Ownership</p>
                        <p className="font-semibold text-sm sm:text-base">{company.ownership}%</p>
                      </div>
                    )}
                    {company.growth !== undefined && (
                      <div className="text-left sm:text-right space-y-1 hidden sm:block">
                        <p className="text-xs sm:text-sm text-muted-foreground">Growth</p>
                        <div
                          className={`flex items-center gap-1 font-semibold text-sm sm:text-base ${company.growth >= 0 ? "text-primary" : "text-destructive"}`}
                        >
                          {company.growth >= 0 ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                          {company.growth >= 0 ? "+" : ""}
                          {company.growth}%
                        </div>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" asChild>
                    <Link href={`/deal-room/${company.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
