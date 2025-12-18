"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  MapPin,
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"

const deals = [
  {
    id: 1,
    name: "QuantumAI",
    logo: "/quantum-logo.jpg",
    tagline: "Next-gen quantum computing for AI workloads",
    sector: "AI/ML",
    stage: "Series A",
    asking: 5000000,
    valuation: 25000000,
    location: "Palo Alto, CA",
    submittedDate: "2024-06-10",
    status: "New",
    score: 92,
    highlights: ["Strong team", "Growing market", "Proven traction"],
  },
  {
    id: 2,
    name: "BioSense",
    logo: "/bio-logo.jpg",
    tagline: "Wearable biosensors for continuous health monitoring",
    sector: "HealthTech",
    stage: "Seed",
    asking: 2000000,
    valuation: 10000000,
    location: "Cambridge, MA",
    submittedDate: "2024-06-08",
    status: "Under Review",
    score: 88,
    highlights: ["FDA approved", "Clinical validation", "Strategic partnerships"],
  },
  {
    id: 3,
    name: "GreenGrid",
    logo: "/green-grid-logo.jpg",
    tagline: "Smart energy management for commercial buildings",
    sector: "CleanTech",
    stage: "Series A",
    asking: 4000000,
    valuation: 20000000,
    location: "Denver, CO",
    submittedDate: "2024-06-05",
    status: "Due Diligence",
    score: 85,
    highlights: ["Revenue positive", "50+ customers", "ESG focus"],
  },
  {
    id: 4,
    name: "ChainSecure",
    logo: "/abstract-chain-logo.png",
    tagline: "Blockchain security and auditing platform",
    sector: "Web3",
    stage: "Seed",
    asking: 1500000,
    valuation: 8000000,
    location: "San Francisco, CA",
    submittedDate: "2024-06-01",
    status: "Declined",
    score: 68,
    highlights: ["Early stage", "Competitive market"],
  },
]

const statusColors = {
  New: "default",
  "Under Review": "secondary",
  "Due Diligence": "outline",
  Declined: "destructive",
}

export function DealFlowView() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Deal Flow"
        description="Review and manage incoming investment opportunities"
        actions={
          <Button size="sm" className="w-full sm:w-auto">
            Add Deal
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">New Deals</p>
              </div>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
              </div>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Active pipeline</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Due Diligence</p>
              </div>
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">In progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              </div>
              <p className="text-3xl font-bold">18%</p>
              <p className="text-sm text-muted-foreground">Last 12 months</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Pipeline */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">Deal Pipeline</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search deals..." className="pl-9 w-full sm:w-[200px] lg:w-[240px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="dd">Due Diligence</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
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
            {deals.map((deal) => (
              <div key={deal.id} className="p-4 sm:p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <img src={deal.logo || "/placeholder.svg"} alt={deal.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <Link
                          href={`/deal-room/${deal.id}`}
                          className="text-base sm:text-lg font-semibold hover:text-primary transition-colors truncate"
                        >
                          {deal.name}
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={statusColors[deal.status] as any} className="text-xs">{deal.status}</Badge>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                            {deal.score}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{deal.tagline}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                          {deal.sector}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{deal.location}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          {deal.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" asChild>
                    <Link href={`/deal-room/${deal.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Raising</p>
                      <p className="font-semibold text-sm sm:text-base">${(deal.asking / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Valuation</p>
                      <p className="font-semibold text-sm sm:text-base">${(deal.valuation / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Submitted</p>
                      <p className="font-semibold text-sm sm:text-base">{new Date(deal.submittedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {deal.highlights.map((highlight, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
