"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Share2,
  Download,
  Edit,
  Plus,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AddInvestorDialog } from "@/components/add-investor-dialog"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { cn } from "@/lib/utils"

const statusColors = {
  Committed: "default",
  Interested: "secondary",
  "In Discussion": "outline",
  Passed: "destructive",
}

interface Fundraise {
  id: string
  roundType: string
  targetAmount: number
  committedAmount: number
  percentage: number
  preMoneyValuation: number | null
  minInvestment: number | null
  maxInvestment: number | null
  startDate: string | Date
  targetCloseDate: string | Date
  useOfFunds: string[]
  useOfFundsBreakdown: string
  companyDescription: string
  traction: string
  marketOpportunity: string
  competitiveAdvantage: string
  pitchDeck: string | null
  financialModel: string | null
  status: string
  daysRemaining: number
  fundraisingData: Array<{ month: string; raised: number }>
}

interface Investor {
  id: string
  name: string
  email?: string
  phone?: string
  firm?: string
  title?: string
  amount: number
  status: string
  stage: string
  notes?: string
  lastContact: string | Date
  avatar?: string
}

interface InvestorStats {
  total: number
  committed: number
  inDiscussion: number
  interested: number
}

export function FundraisingView() {
  const [addInvestorOpen, setAddInvestorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fundraise, setFundraise] = useState<Fundraise | null>(null)
  const [investors, setInvestors] = useState<Investor[]>([])
  const [investorStats, setInvestorStats] = useState<InvestorStats>({
    total: 0,
    committed: 0,
    inDiscussion: 0,
    interested: 0,
  })

  const fetchFundraise = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/founder/fundraise")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch fundraise")
      }

      if (result.success) {
        setFundraise(result.fundraise)
      }
    } catch (err) {
      console.error("Error fetching fundraise:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }, [])

  const fetchInvestors = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/founder/investors")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch investors")
      }

      if (result.success) {
        setInvestors(result.investors || [])
        setInvestorStats(result.stats || { total: 0, committed: 0, inDiscussion: 0, interested: 0 })
      }
    } catch (err) {
      console.error("Error fetching investors:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchFundraise(), fetchInvestors()])
      setLoading(false)
    }
    loadData()
  }, [fetchFundraise, fetchInvestors])

  const handleInvestorAdded = () => {
    fetchInvestors()
    fetchFundraise() // Refresh to update committed amount
  }

  const formatDate = (date: string | Date) => {
    if (!date) return "—"
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Fundraising"
        description="Manage your fundraising round, investor relationships, and documents"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Share Data Room</span>
              <span className="sm:hidden">Share</span>
            </Button>
            <Button size="sm" onClick={() => setAddInvestorOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
          </div>
        }
      />

      <AddInvestorDialog
        open={addInvestorOpen}
        onOpenChange={setAddInvestorOpen}
        onSuccess={handleInvestorAdded}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">Loading fundraising data...</p>
        </div>
      ) : error && !fundraise ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-3" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => { fetchFundraise(); fetchInvestors(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : !fundraise ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No active fundraise found.</p>
          <Button asChild>
            <a href="/founder">Start a Fundraise</a>
          </Button>
        </div>
      ) : (

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 sm:py-1.5">Overview</TabsTrigger>
          <TabsTrigger value="investors" className="text-xs sm:text-sm py-2 sm:py-1.5">Investors</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm py-2 sm:py-1.5">Documents</TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs sm:text-sm py-2 sm:py-1.5">Milestones</TabsTrigger>
          <TabsTrigger value="updates" className="text-xs sm:text-sm py-2 sm:py-1.5">Updates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Target Raise</p>
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(fundraise.targetAmount)}</p>
                  <p className="text-sm text-muted-foreground">{fundraise.roundType} Round</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Raised to Date</p>
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(fundraise.committedAmount)}</p>
                  <div className="flex items-center text-sm text-primary">
                    <span>{fundraise.percentage}% of target</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Active Investors</p>
                  </div>
                  <p className="text-3xl font-bold">{investorStats.total}</p>
                  <p className="text-sm text-muted-foreground">{investorStats.committed} committed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Target Close</p>
                  </div>
                  <p className="text-3xl font-bold">{formatDate(fundraise.targetCloseDate).split(",")[0]}</p>
                  <p className="text-sm text-muted-foreground">{fundraise.daysRemaining} days remaining</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fundraising Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fundraising Progress</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { fetchFundraise(); fetchInvestors(); }} disabled={loading}>
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {formatCurrency(fundraise.committedAmount)} of {formatCurrency(fundraise.targetAmount)} goal
                  </span>
                  <span className="text-muted-foreground">{fundraise.percentage}%</span>
                </div>
                <Progress value={fundraise.percentage} className="h-3" />
              </div>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minHeight={200}>
                  <LineChart data={fundraise.fundraisingData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Raised"]}
                    />
                    <Line type="monotone" dataKey="raised" stroke="#c1ff72" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Investor Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Investor Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              {investors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No investors yet.</p>
                  <Button onClick={() => setAddInvestorOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Investor
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {investors.map((investor) => (
              <div
                key={investor.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={investor.avatar || "/placeholder.svg"} alt={investor.name} />
                    <AvatarFallback>
                      {investor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <p className="font-semibold truncate">{investor.name}</p>
                      <Badge variant={statusColors[investor.status] as any} className="w-fit">{investor.status}</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 truncate">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{investor.firm}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="hidden sm:inline">Last contact: </span>
                        {formatDate(investor.lastContact)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Commitment</p>
                      <p className="font-semibold text-sm sm:text-base">{formatCurrency(investor.amount)}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Stage</p>
                      <p className="font-semibold text-sm sm:text-base">{investor.stage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fundraising Setup */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Fundraising Round Details</CardTitle>
                  <CardDescription>Configure your fundraising round settings</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Round Type</p>
                    <p className="text-lg font-semibold">{fundraise.roundType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Valuation</p>
                    <p className="text-lg font-semibold">
                      {fundraise.preMoneyValuation ? `${formatCurrency(fundraise.preMoneyValuation)} Pre-Money` : "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Use of Funds</p>
                    <p className="text-sm">
                      {fundraise.useOfFunds.length > 0
                        ? fundraise.useOfFunds.join(", ")
                        : fundraise.useOfFundsBreakdown || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Timeline</p>
                    <p className="text-sm">
                      Started: {formatDate(fundraise.startDate)} | Target Close: {formatDate(fundraise.targetCloseDate)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investors Tab */}
        <TabsContent value="investors" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Investor Pipeline</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Track and manage your investor relationships</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <BarChart3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </div>
          </div>

          {/* Investor Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Investors</p>
                  <p className="text-3xl font-bold">{investorStats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Committed</p>
                  <p className="text-3xl font-bold text-emerald-600">{investorStats.committed}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">In Discussion</p>
                  <p className="text-3xl font-bold text-blue-600">{investorStats.inDiscussion}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Interested</p>
                  <p className="text-3xl font-bold text-yellow-600">{investorStats.interested}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investor List */}
          <Card>
            <CardHeader>
              <CardTitle>All Investors</CardTitle>
            </CardHeader>
            <CardContent>
              {investors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No investors yet.</p>
                  <Button onClick={() => setAddInvestorOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Investor
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {investors.map((investor) => (
                  <div
                    key={investor.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                        <AvatarImage src={investor.avatar || "/placeholder.svg"} alt={investor.name} />
                        <AvatarFallback>
                          {investor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <p className="font-semibold truncate">{investor.name}</p>
                          <Badge variant={statusColors[investor.status] as any} className="w-fit">{investor.status}</Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5 truncate">
                            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{investor.firm}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Last contact: </span>
                            {formatDate(investor.lastContact)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 flex-shrink-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                        <div className="text-left sm:text-right space-y-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Commitment</p>
                          <p className="font-semibold text-sm sm:text-base">{formatCurrency(investor.amount)}</p>
                        </div>
                        <div className="text-left sm:text-right space-y-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Stage</p>
                          <p className="font-semibold text-sm sm:text-base">{investor.stage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" title="Send Email">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" title="Call">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" title="Message">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Fundraising Documents</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your pitch deck, financials, and data room</p>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Share2 className="h-4 w-4 mr-2" />
              Share Data Room
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pitch Deck</CardTitle>
                <CardDescription>Your main fundraising presentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fundraise.pitchDeck ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">Pitch Deck - {fundraise.roundType}</p>
                          <p className="text-sm text-muted-foreground">PDF</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <UploadButton<OurFileRouter>
                      endpoint="companyLogo"
                      onClientUploadComplete={(res) => {
                        console.log("Upload complete:", res)
                      }}
                      className="ut-button:w-full"
                      content={{
                        button: ({ ready }) => (
                          <div className="flex items-center justify-center gap-2 w-full">
                            <Upload className="h-4 w-4" />
                            <span>{ready ? "Upload New Version" : "Preparing..."}</span>
                          </div>
                        ),
                      }}
                    />
                  </div>
                ) : (
                  <UploadButton<OurFileRouter>
                    endpoint="companyLogo"
                    onClientUploadComplete={(res) => {
                      console.log("Upload complete:", res)
                    }}
                    className="ut-button:w-full"
                    content={{
                      button: ({ ready }) => (
                        <div className="flex items-center justify-center gap-2 w-full">
                          <Upload className="h-4 w-4" />
                          <span>{ready ? "Upload Pitch Deck" : "Preparing..."}</span>
                        </div>
                      ),
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Documents</CardTitle>
                <CardDescription>Financial models, projections, and statements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {fundraise.financialModel ? (
                  <div className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">Financial Model</p>
                        <p className="text-sm text-muted-foreground">PDF</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" asChild>
                        <a href={fundraise.financialModel} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No financial model uploaded yet.</p>
                )}
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Financial Document
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>Complete list of fundraising documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fundraise.pitchDeck && (
                  <div className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">Pitch Deck - {fundraise.roundType}</p>
                        <p className="text-sm text-muted-foreground">
                          PDF • Uploaded {formatDate(fundraise.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" asChild>
                        <a href={fundraise.pitchDeck} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {fundraise.financialModel && (
                  <div className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">Financial Model</p>
                        <p className="text-sm text-muted-foreground">
                          PDF • Uploaded {formatDate(fundraise.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" asChild>
                        <a href={fundraise.financialModel} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {!fundraise.pitchDeck && !fundraise.financialModel && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Fundraising Milestones</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Track your progress through the fundraising process</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Milestones tracking coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Investor Updates</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Send updates and track engagement with your investors</p>
            </div>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Update
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Investor updates feature coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  )
}
