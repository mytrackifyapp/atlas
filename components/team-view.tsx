"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, Calendar, Briefcase, Search, Filter, UserPlus } from "lucide-react"

const teamMembers = [
  {
    id: 1,
    name: "John Doe",
    avatar: "/thoughtful-man-in-library.png",
    role: "CEO & Co-founder",
    department: "Leadership",
    email: "john@company.com",
    phone: "+1 (555) 111-2222",
    location: "San Francisco, CA",
    joinedDate: "2022-01-15",
    skills: ["Strategy", "Fundraising", "Leadership"],
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "/jane-portrait.png",
    role: "CTO & Co-founder",
    department: "Engineering",
    email: "jane@company.com",
    phone: "+1 (555) 222-3333",
    location: "San Francisco, CA",
    joinedDate: "2022-01-15",
    skills: ["Full-Stack", "Architecture", "AI/ML"],
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "/person-named-mike.png",
    role: "VP of Product",
    department: "Product",
    email: "mike@company.com",
    phone: "+1 (555) 333-4444",
    location: "Austin, TX",
    joinedDate: "2022-06-01",
    skills: ["Product Strategy", "UX Design", "Analytics"],
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    avatar: "/portrait-emily.png",
    role: "Head of Marketing",
    department: "Marketing",
    email: "emily@company.com",
    phone: "+1 (555) 444-5555",
    location: "New York, NY",
    joinedDate: "2022-09-15",
    skills: ["Growth Marketing", "Content", "SEO"],
  },
  {
    id: 5,
    name: "David Kim",
    avatar: "/thoughtful-person.png",
    role: "Lead Engineer",
    department: "Engineering",
    email: "david@company.com",
    phone: "+1 (555) 555-6666",
    location: "Seattle, WA",
    joinedDate: "2023-02-01",
    skills: ["React", "Node.js", "AWS"],
  },
  {
    id: 6,
    name: "Sarah Wilson",
    avatar: "/diverse-group-smiling.png",
    role: "Sales Director",
    department: "Sales",
    email: "sarah@company.com",
    phone: "+1 (555) 666-7777",
    location: "Boston, MA",
    joinedDate: "2023-04-10",
    skills: ["Enterprise Sales", "Negotiation", "CRM"],
  },
]

const departments = [
  { name: "Leadership", count: 2, color: "text-primary" },
  { name: "Engineering", count: 8, color: "text-blue-500" },
  { name: "Product", count: 4, color: "text-purple-500" },
  { name: "Marketing", count: 5, color: "text-pink-500" },
  { name: "Sales", count: 6, color: "text-orange-500" },
]

export function TeamView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Manage your company team and organization"
        actions={
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        }
      />

      {/* Department Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {departments.map((dept) => (
          <Card key={dept.name}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Briefcase className={`h-6 w-6 ${dept.color} mb-2`} />
                <p className="text-sm font-medium text-muted-foreground">{dept.name}</p>
                <p className="text-2xl font-bold">{dept.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search team..." className="pl-9 w-[240px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-sm text-primary">{member.role}</p>
                    </div>
                    <Badge variant="secondary">{member.department}</Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <a href={`mailto:${member.email}`} className="hover:text-primary transition-colors">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${member.phone}`} className="hover:text-primary transition-colors">
                      {member.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {member.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {new Date(member.joinedDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {member.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
