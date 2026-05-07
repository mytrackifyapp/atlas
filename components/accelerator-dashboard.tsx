"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Users, Rocket, TrendingUp } from "lucide-react"
import { AcceleratorApplyCard } from "@/components/accelerator-apply-card"

const COHORT_NAME = "Trackify Finance 2026"
const COHORT_LAUNCH_MONTH = "November"

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
        <span className="text-foreground">{COHORT_NAME}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{COHORT_NAME}</h1>
          <p className="text-muted-foreground mt-1">
            Cohort launching in {COHORT_LAUNCH_MONTH} • Apply / join the waitlist to get early access
          </p>
        </div>
        <Button asChild>
          <a href="#apply" className="inline-flex items-center">
            <Rocket className="h-4 w-4 mr-2" />
            Apply now
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Program length</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 weeks</div>
            <div className="text-sm text-muted-foreground mt-1">Hands-on support</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Focus</CardDescription>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Finance</div>
            <div className="text-sm text-muted-foreground mt-1">Builders & operators</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Mentor sessions</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Weekly</div>
            <div className="text-sm text-muted-foreground mt-1">1:1 + office hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Launch</CardDescription>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{COHORT_LAUNCH_MONTH}</div>
            <div className="text-sm text-muted-foreground mt-1">2026</div>
          </CardContent>
        </Card>
      </div>

      {/* Program overview + Apply */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>What you’ll get</CardTitle>
            <CardDescription>Designed for finance startups preparing for growth and fundraising</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="font-semibold">Weekly support</div>
              <div className="text-sm text-muted-foreground mt-1">
                1:1 mentor sessions, office hours, and tactical reviews.
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="font-semibold">Fundraising readiness</div>
              <div className="text-sm text-muted-foreground mt-1">
                Narrative, deck, metrics, diligence prep, and investor pipeline strategy.
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="font-semibold">Operator community</div>
              <div className="text-sm text-muted-foreground mt-1">
                Join a peer group of founders shipping toward the same launch window.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Finance</Badge>
              <Badge variant="outline">12 weeks</Badge>
              <Badge variant="outline">November 2026 launch</Badge>
            </div>
          </CardContent>
        </Card>

        <div id="apply">
          <AcceleratorApplyCard />
        </div>
      </div>

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
            <CardTitle>Cohort timeline</CardTitle>
            <CardDescription>Trackify Finance 2026 cohort launch window</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-semibold mb-1">{COHORT_NAME}</div>
                <div className="text-sm text-muted-foreground">
                  Launching {COHORT_LAUNCH_MONTH} 2026 • Remote-first
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Apply now to get early access and onboarding instructions.
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Focus areas</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">GTM</Badge>
                  <Badge variant="outline">Unit economics</Badge>
                  <Badge variant="outline">Risk & compliance</Badge>
                  <Badge variant="outline">Fundraising</Badge>
                </div>
              </div>
              <Button className="w-full" asChild>
                <a href="#apply" className="inline-flex items-center justify-center">
                  Apply / Join waitlist
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
