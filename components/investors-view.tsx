"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, Calendar, Mail, Phone, MessageSquare, Search, Filter, UserPlus } from "lucide-react"

const currentInvestors = [
  {
    id: 1,
    name: "Sarah Chen",
    firm: "Atlas Ventures",
    avatar: "/diverse-group-smiling.png",
    role: "Lead Investor",
    ownership: 15.2,
    investment: 2500000,
    boardSeat: true,
    joinedDate: "2023-06-15",
    email: "sarah@atlasventures.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: 2,
    name: "Michael Torres",
    firm: "Sequoia Capital",
    avatar: "/portrait-contemplative-man.png",
    role: "Co-Investor",
    ownership: 10.5,
    investment: 1800000,
    boardSeat: false,
    joinedDate: "2023-06-15",
    email: "michael@sequoia.com",
    phone: "+1 (555) 234-5678",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    firm: "Accel Partners",
    avatar: "/portrait-emily.png",
    role: "Strategic Investor",
    ownership: 8.3,
    investment: 1500000,
    boardSeat: false,
    joinedDate: "2024-01-10",
    email: "emily@accel.com",
    phone: "+1 (555) 345-6789",
  },
  {
    id: 4,
    name: "David Kim",
    firm: "Individual Angel",
    avatar: "/thoughtful-person.png",
    role: "Angel Investor",
    ownership: 3.5,
    investment: 500000,
    boardSeat: false,
    joinedDate: "2022-11-20",
    email: "david@example.com",
    phone: "+1 (555) 456-7890",
  },
]

export function InvestorsView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Investors"
        description="Manage relationships with your investors"
        actions={
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Investor
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Investors</p>
              <p className="text-3xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">Across all rounds</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
              <p className="text-3xl font-bold">$6.3M</p>
              <p className="text-sm text-muted-foreground">All rounds combined</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Board Members</p>
              <p className="text-3xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Active board seats</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Next Update</p>
              <p className="text-3xl font-bold">Jun 30</p>
              <p className="text-sm text-muted-foreground">Quarterly report due</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investors List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Investors</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search investors..." className="pl-9 w-[240px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentInvestors.map((investor) => (
              <div
                key={investor.id}
                className="p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={investor.avatar || "/placeholder.svg"} alt={investor.name} />
                      <AvatarFallback>
                        {investor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{investor.name}</h3>
                        <Badge variant="secondary">{investor.role}</Badge>
                        {investor.boardSeat && <Badge>Board Member</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {investor.firm}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Joined {new Date(investor.joinedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <a
                          href={`mailto:${investor.email}`}
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {investor.email}
                        </a>
                        <a
                          href={`tel:${investor.phone}`}
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {investor.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-8 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Investment</p>
                    <p className="text-lg font-semibold">${(investor.investment / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ownership</p>
                    <p className="text-lg font-semibold">{investor.ownership}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                    <p className="text-lg font-semibold">${((investor.investment * 1.5) / 1000000).toFixed(1)}M</p>
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
