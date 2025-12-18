"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Users, Rocket, TrendingUp } from "lucide-react"

const cohortData = [
  {
    id: "1",
    name: "PayStack Clone",
    logo: "PS",
    stage: "Week 8",
    mrr: "$125K",
    growth: "+45%",
    status: "On Track",
  },
  {
    id: "2",
    name: "AgriTech Solutions",
    logo: "AS",
    stage: "Week 8",
    mrr: "$65K",
    growth: "+32%",
    status: "On Track",
  },
  {
    id: "3",
    name: "HealthConnect",
    logo: "HC",
    stage: "Week 8",
    mrr: "$48K",
    growth: "+28%",
    status: "Needs Support",
  },
  {
    id: "4",
    name: "EduPlatform",
    logo: "EP",
    stage: "Week 8",
    mrr: "$52K",
    growth: "+38%",
    status: "On Track",
  },
]

const mentors = [
  { name: "Sarah Johnson", expertise: "GTM Strategy", sessions: 12 },
  { name: "Michael Chen", expertise: "Product", sessions: 10 },
  { name: "Amina Okafor", expertise: "Fundraising", sessions: 15 },
  { name: "David Kim", expertise: "Engineering", sessions: 8 },
]

export function AcceleratorDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Accelerator</span>
        <span>/</span>
        <span className="text-foreground">Africa 2025 Cohort</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Africa 2025 Cohort</h1>
          <p className="text-muted-foreground mt-1">12-week program • 8 startups • Demo Day on March 15, 2025</p>
        </div>
        <Button>
          <Rocket className="h-4 w-4 mr-2" />
          View Demo Day
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Startups</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-muted-foreground mt-1">Active companies</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Combined MRR</CardDescription>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$580K</div>
            <div className="text-sm text-emerald-600 mt-1">+42% avg growth</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Mentor Sessions</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <div className="text-sm text-muted-foreground mt-1">This week</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Weeks Remaining</CardDescription>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <div className="text-sm text-muted-foreground mt-1">Until Demo Day</div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Companies</CardTitle>
          <CardDescription>Performance overview of all startups in the program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cohortData.map((startup) => (
              <div
                key={startup.id}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">{startup.logo}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{startup.name}</h4>
                      <p className="text-sm text-muted-foreground">{startup.stage}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">MRR:</span>{" "}
                          <span className="font-medium">{startup.mrr}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Growth:</span>{" "}
                          <span className="font-medium text-emerald-600">{startup.growth}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      startup.status === "On Track"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }
                  >
                    {startup.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mentors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mentor Network</CardTitle>
            <CardDescription>Expert mentors supporting the cohort</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mentors.map((mentor) => (
                <div
                  key={mentor.name}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{mentor.name}</div>
                    <div className="text-sm text-muted-foreground">{mentor.expertise}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{mentor.sessions} sessions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Day Preview</CardTitle>
            <CardDescription>Upcoming showcase event for investors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-semibold mb-1">Africa 2025 Demo Day</div>
                <div className="text-sm text-muted-foreground">March 15, 2025 • 2:00 PM WAT</div>
                <div className="text-sm text-muted-foreground mt-2">Hybrid event: Lagos Hub + Virtual</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Confirmed Investors</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Africa Ventures</Badge>
                  <Badge variant="outline">TechStars</Badge>
                  <Badge variant="outline">Seedcamp</Badge>
                  <Badge variant="outline">+12 more</Badge>
                </div>
              </div>
              <Button className="w-full">View Full Schedule</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
