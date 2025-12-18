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
    <div className="space-y-8">
      <PageHeader
        title="Deal Flow"
        description="Review and manage incoming investment opportunities"
        actions={<Button size="sm">Add Deal</Button>}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <div className="flex items-center justify-between">
            <CardTitle>Deal Pipeline</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search deals..." className="pl-9 w-[240px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deals.map((deal) => (
              <div key={deal.id} className="p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <img src={deal.logo || "/placeholder.svg"} alt={deal.name} className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/deal-room/${deal.id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {deal.name}
                        </Link>
                        <Badge variant={statusColors[deal.status] as any}>{deal.status}</Badge>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {deal.score}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{deal.tagline}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {deal.sector}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {deal.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {deal.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/deal-room/${deal.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Raising</p>
                      <p className="font-semibold">${(deal.asking / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Valuation</p>
                      <p className="font-semibold">${(deal.valuation / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                      <p className="font-semibold">{new Date(deal.submittedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {deal.highlights.map((highlight, idx) => (
                      <Badge key={idx} variant="secondary">
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
