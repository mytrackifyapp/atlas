"use client"

import { useState } from "react"
import { ArrowLeft, Building2, MapPin, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DealRoomProps {
  startupId: string
}

const startupData: Record<string, any> = {
  "1": {
    name: "PayStack Clone",
    logo: "PS",
    location: "Lagos, Nigeria",
    stage: "Series A",
    sector: "Fintech",
    description: "Digital payment infrastructure for African businesses",
    mrr: "$125K",
    growth: "+45%",
    burn: "$85K/mo",
    runway: 18,
    customers: 1250,
    team: 24,
  },
  "6": {
    name: "MobileBank",
    logo: "MB",
    location: "Lagos, Nigeria",
    stage: "Seed",
    sector: "Fintech",
    description: "Mobile-first banking for the unbanked in West Africa",
    mrr: "$45K",
    growth: "+120%",
    burn: "$35K/mo",
    runway: 12,
    customers: 850,
    team: 12,
  },
}

export function DealRoom({ startupId }: DealRoomProps) {
  const startup = startupData[startupId] || startupData["1"]
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Startup Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">{startup.logo}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{startup.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{startup.location}</span>
              </div>
              <Badge variant="secondary">{startup.stage}</Badge>
              <Badge variant="outline">{startup.sector}</Badge>
            </div>
            <p className="mt-2 text-muted-foreground">{startup.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Add Note</Button>
          <Button variant="outline">Request Intro</Button>
          <Button>Express Interest</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startup.mrr}</div>
            <div className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {startup.growth}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Growth Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startup.growth}</div>
            <div className="text-sm text-muted-foreground mt-1">MoM</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Burn Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startup.burn}</div>
            <div className="text-sm text-muted-foreground mt-1">Monthly</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Runway</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startup.runway}</div>
            <div className="text-sm text-muted-foreground mt-1">months</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startup.customers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">{startup.team} team</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traction">Traction & Metrics</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="diligence">Due Diligence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Mission</h4>
                <p className="text-muted-foreground">
                  To provide accessible and affordable digital payment solutions for every business in Africa, enabling
                  seamless transactions and financial inclusion.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Market Opportunity</h4>
                <p className="text-muted-foreground">
                  The African fintech market is projected to reach $150B by 2025, with payment infrastructure being a
                  critical enabler for the digital economy.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Competitive Advantage</h4>
                <p className="text-muted-foreground">
                  Proprietary technology stack, deep partnerships with local banks, and unmatched understanding of local
                  payment behaviors and preferences.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traction" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Traction Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Transaction Volume</div>
                  <div className="text-2xl font-bold">$2.4M</div>
                  <div className="text-sm text-emerald-600">+145% YoY</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Active Merchants</div>
                  <div className="text-2xl font-bold">1,250</div>
                  <div className="text-sm text-emerald-600">+85% YoY</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Avg. Transaction Size</div>
                  <div className="text-2xl font-bold">$45</div>
                  <div className="text-sm text-muted-foreground">Stable</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Retention Rate</div>
                  <div className="text-2xl font-bold">94%</div>
                  <div className="text-sm text-emerald-600">+3% QoQ</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pitch" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pitch Deck</CardTitle>
              <CardDescription>Company presentation and investment opportunity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Pitch deck viewer would appear here</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed financial statements and projections available under NDA</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team profiles and backgrounds</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diligence" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Due Diligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Legal, technical, and commercial diligence materials</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
