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

interface PortfolioAnalytics {
  summary: {
    totalPortfolioValue: number
    activeCompanies: number
    totalInvested: number
    unrealizedGains: number
    roi: string
    growthPercentage: string
    uniqueSectors: number
    averageInvestment: number
  }
  performanceData: Array<{ month: string; value: number }>
  sectorAllocation: Array<{ name: string; value: number; percentage: number; count: number }>
}

export function PortfolioView() {
  const [addCompanyOpen, setAddCompanyOpen] = useState(false)
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([])
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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
          logo: company.logo || null,
          sector: company.industry || company.sector,
          industry: company.industry,
          stage: company.stage,
          investment: company.amount || company.investment || 0,
          amount: company.amount,
          currentValue: company.amount ? company.amount * 1.5 : 0, // Calculate current value
          ownership: 0, // Can be calculated if ownership data is available
          location: company.location || "",
          country: company.country || "",
          growth: company.amount ? 50 : 0, // Simplified growth calculation
          status: "Active",
        }))
        
        setPortfolioCompanies(transformedCompanies)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/portfolio/analytics")
      const data = await response.json()
      
      if (data.success && data.data) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  useEffect(() => {
    fetchCompanies()
    fetchAnalytics()
  }, [])

  const handleCompanyAdded = () => {
    // Refresh the companies list and analytics
    fetchCompanies()
    fetchAnalytics()
  }

  // Filter companies based on search and status
  const filteredCompanies = portfolioCompanies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.sector || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.industry || "").toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || company.status?.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const performanceData = analytics?.performanceData || []
  const sectorAllocation = analytics?.sectorAllocation || []

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
              <p className="text-3xl font-bold">
                {analytics
                  ? `$${(analytics.summary.totalPortfolioValue / 1000000).toFixed(1)}M`
                  : "$0M"}
              </p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+{analytics?.summary.growthPercentage || "0"}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Companies</p>
              <p className="text-3xl font-bold">{analytics?.summary.activeCompanies || 0}</p>
              <p className="text-sm text-muted-foreground">
                Across {analytics?.summary.uniqueSectors || 0} sector{analytics?.summary.uniqueSectors !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
              <p className="text-3xl font-bold">
                {analytics ? `$${(analytics.summary.totalInvested / 1000000).toFixed(2)}M` : "$0M"}
              </p>
              <p className="text-sm text-muted-foreground">
                Average: ${analytics ? (analytics.summary.averageInvestment / 1000000).toFixed(2) : "0"}M
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Unrealized Gains</p>
              <p className="text-3xl font-bold">
                {analytics ? `$${(analytics.summary.unrealizedGains / 1000000).toFixed(2)}M` : "$0M"}
              </p>
              <div className="flex items-center text-sm text-primary">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{analytics?.summary.roi || "0"}% ROI</span>
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
              {performanceData.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p className="text-sm">No portfolio data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              {sectorAllocation.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p className="text-sm">No sector data available</p>
                </div>
              )}
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
                <Input
                  placeholder="Search companies..."
                  className="pl-9 w-full sm:w-[200px] lg:w-[240px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground">Loading companies...</p>
              </div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "No companies match your filters"
                  : "No portfolio companies yet"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => setAddCompanyOpen(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Your First Company
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredCompanies.map((company) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
