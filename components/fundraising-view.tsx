"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign, TrendingUp, Users, Calendar, Building2, Mail, Phone, MessageSquare } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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

export function FundraisingView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Fundraising"
        description="Manage your fundraising round and investor relationships"
        actions={<Button size="sm">Add Investor</Button>}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">$4.2M of $5.0M goal</span>
              <span className="text-muted-foreground">84%</span>
            </div>
            <Progress value={84} className="h-3" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
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
        </CardContent>
      </Card>

      {/* Investor Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Investor Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investors.map((investor) => (
              <div
                key={investor.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={investor.avatar || "/placeholder.svg"} alt={investor.name} />
                    <AvatarFallback>
                      {investor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{investor.name}</p>
                      <Badge variant={statusColors[investor.status] as any}>{investor.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {investor.firm}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Last contact: {new Date(investor.lastContact).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Commitment</p>
                    <p className="font-semibold">${(investor.amount / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Stage</p>
                    <p className="font-semibold">{investor.stage}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
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
