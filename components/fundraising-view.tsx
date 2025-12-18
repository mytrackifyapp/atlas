"use client"

import { useState } from "react"
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
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AddInvestorDialog } from "@/components/add-investor-dialog"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

const fundraisingData = [
  { month: "Jan", raised: 500000 },
  { month: "Feb", raised: 1200000 },
  { month: "Mar", raised: 2100000 },
  { month: "Apr", raised: 2800000 },
  { month: "May", raised: 3500000 },
  { month: "Jun", raised: 4200000 },
]

const investors = [
  {
    id: 1,
    name: "Sarah Chen",
    firm: "Atlas Ventures",
    avatar: "/diverse-group-smiling.png",
    status: "Committed",
    amount: 1500000,
    lastContact: "2024-06-12",
    stage: "Term Sheet",
  },
  {
    id: 2,
    name: "Michael Torres",
    firm: "Sequoia Capital",
    avatar: "/portrait-contemplative-man.png",
    status: "Interested",
    amount: 2000000,
    lastContact: "2024-06-10",
    stage: "Due Diligence",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    firm: "Accel Partners",
    avatar: "/portrait-emily.png",
    status: "In Discussion",
    amount: 1000000,
    lastContact: "2024-06-08",
    stage: "Initial Meeting",
  },
  {
    id: 4,
    name: "David Kim",
    firm: "Andreessen Horowitz",
    avatar: "/thoughtful-person.png",
    status: "Committed",
    amount: 1200000,
    lastContact: "2024-06-14",
    stage: "Term Sheet",
  },
]

const statusColors = {
  Committed: "default",
  Interested: "secondary",
  "In Discussion": "outline",
  Passed: "destructive",
}

const milestones = [
  { id: 1, title: "Pitch Deck Complete", status: "completed", date: "2024-05-01" },
  { id: 2, title: "First Investor Meeting", status: "completed", date: "2024-05-15" },
  { id: 3, title: "Term Sheet Received", status: "in-progress", date: "2024-06-20" },
  { id: 4, title: "Due Diligence Complete", status: "pending", date: "2024-07-15" },
  { id: 5, title: "Round Closed", status: "pending", date: "2024-08-15" },
]

const documents = [
  { id: 1, name: "Pitch Deck - Series A", type: "PDF", size: "12.4 MB", uploaded: "2024-05-01", version: "v2.1" },
  { id: 2, name: "Financial Model", type: "Excel", size: "2.8 MB", uploaded: "2024-05-10", version: "v1.3" },
  { id: 3, name: "Cap Table", type: "PDF", size: "486 KB", uploaded: "2024-05-15", version: "v1.0" },
  { id: 4, name: "Product Roadmap", type: "PDF", size: "1.2 MB", uploaded: "2024-06-01", version: "v2.0" },
]

const updates = [
  {
    id: 1,
    title: "Monthly Update - June 2024",
    sentTo: 12,
    opened: 10,
    date: "2024-06-15",
    status: "sent",
  },
  {
    id: 2,
    title: "Product Launch Announcement",
    sentTo: 12,
    opened: 8,
    date: "2024-06-10",
    status: "sent",
  },
  {
    id: 3,
    title: "Q2 Financial Update",
    sentTo: 12,
    opened: 11,
    date: "2024-05-30",
    status: "sent",
  },
]

export function FundraisingView() {
  const [addInvestorOpen, setAddInvestorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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
        onSuccess={() => {
          // Refresh investor list
          console.log("Investor added successfully")
        }}
      />

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
              <p className="text-3xl font-bold">$5.0M</p>
              <p className="text-sm text-muted-foreground">Series A Round</p>
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
              <p className="text-3xl font-bold">$4.2M</p>
              <div className="flex items-center text-sm text-primary">
                <span>84% of target</span>
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
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">4 committed</p>
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
              <p className="text-3xl font-bold">Aug 15</p>
              <p className="text-sm text-muted-foreground">45 days remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fundraising Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Fundraising Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">$4.2M of $5.0M goal</span>
              <span className="text-muted-foreground">84%</span>
            </div>
            <Progress value={84} className="h-3" />
          </div>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={250} minHeight={200}>
            <LineChart data={fundraisingData}>
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
                        {new Date(investor.lastContact).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Commitment</p>
                      <p className="font-semibold text-sm sm:text-base">${(investor.amount / 1000000).toFixed(1)}M</p>
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
                    <p className="text-lg font-semibold">Series A</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Valuation</p>
                    <p className="text-lg font-semibold">$25M Pre-Money</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Use of Funds</p>
                    <p className="text-sm">Product development (40%), Team expansion (35%), Marketing (25%)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Timeline</p>
                    <p className="text-sm">Started: May 1, 2024 | Target Close: Aug 15, 2024</p>
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
                  <p className="text-3xl font-bold">12</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Committed</p>
                  <p className="text-3xl font-bold text-emerald-600">4</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">In Discussion</p>
                  <p className="text-3xl font-bold text-blue-600">5</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Interested</p>
                  <p className="text-3xl font-bold text-yellow-600">3</p>
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
                            {new Date(investor.lastContact).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 flex-shrink-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                        <div className="text-left sm:text-right space-y-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Commitment</p>
                          <p className="font-semibold text-sm sm:text-base">${(investor.amount / 1000000).toFixed(1)}M</p>
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
                {documents.find((d) => d.name.includes("Pitch Deck")) ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">Pitch Deck - Series A</p>
                          <p className="text-sm text-muted-foreground">v2.1 • 12.4 MB</p>
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
                {documents
                  .filter((d) => d.name.includes("Financial") || d.name.includes("Cap Table"))
                  .map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.version} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {doc.size} • Uploaded {new Date(doc.uploaded).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs hidden sm:inline-flex">{doc.version}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      {milestone.status === "completed" ? (
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                      ) : milestone.status === "in-progress" ? (
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full border-2 border-muted flex items-center justify-center">
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      {index < milestones.length - 1 && (
                        <div
                          className={`w-0.5 h-16 mt-2 ${
                            milestone.status === "completed" ? "bg-emerald-600" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Target: {new Date(milestone.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            milestone.status === "completed"
                              ? "default"
                              : milestone.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {milestone.status === "completed"
                            ? "Completed"
                            : milestone.status === "in-progress"
                              ? "In Progress"
                              : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Updates</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg. Open Rate</p>
                  <p className="text-3xl font-bold">83%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Last Sent</p>
                  <p className="text-3xl font-bold">2 days ago</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-semibold">{update.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Sent to {update.sentTo} investors • {update.opened} opened ({Math.round((update.opened / update.sentTo) * 100)}%)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(update.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="default" className="text-xs">{update.status}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
