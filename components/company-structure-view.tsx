"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Percent,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMember {
  id: string
  name: string
  email?: string
  phone?: string
  role: string
  department?: string
  startDate?: string | Date
  equity?: number
  isCoFounder: boolean
  notes?: string
}

interface Stakeholder {
  id: string
  name: string
  type: "investor" | "advisor" | "board_member" | "other"
  equity: number
  email?: string
  notes?: string
}

export function CompanyStructureView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [activeTab, setActiveTab] = useState("team")
  
  // Dialog states
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [stakeholderDialogOpen, setStakeholderDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null)
  
  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [department, setDepartment] = useState("")
  const [startDate, setStartDate] = useState("")
  const [equity, setEquity] = useState("")
  const [isCoFounder, setIsCoFounder] = useState(false)
  const [notes, setNotes] = useState("")
  
  // Stakeholder form
  const [stakeholderName, setStakeholderName] = useState("")
  const [stakeholderType, setStakeholderType] = useState<"investor" | "advisor" | "board_member" | "other">("investor")
  const [stakeholderEquity, setStakeholderEquity] = useState("")
  const [stakeholderEmail, setStakeholderEmail] = useState("")
  const [stakeholderNotes, setStakeholderNotes] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/founder/structure")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch company structure")
      }

      if (result.success) {
        setTeamMembers(result.teamMembers || [])
        setStakeholders(result.stakeholders || [])
      }
    } catch (err) {
      console.error("Error fetching structure:", err)
      setError(err instanceof Error ? err.message : "Failed to load company structure")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetTeamForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setRole("")
    setDepartment("")
    setStartDate("")
    setEquity("")
    setIsCoFounder(false)
    setNotes("")
    setEditingMember(null)
  }

  const resetStakeholderForm = () => {
    setStakeholderName("")
    setStakeholderType("investor")
    setStakeholderEquity("")
    setStakeholderEmail("")
    setStakeholderNotes("")
    setEditingStakeholder(null)
  }

  const handleOpenTeamDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member)
      setName(member.name)
      setEmail(member.email || "")
      setPhone(member.phone || "")
      setRole(member.role)
      setDepartment(member.department || "")
      setStartDate(member.startDate ? new Date(member.startDate).toISOString().split("T")[0] : "")
      setEquity(member.equity?.toString() || "")
      setIsCoFounder(member.isCoFounder)
      setNotes(member.notes || "")
    } else {
      resetTeamForm()
    }
    setTeamDialogOpen(true)
  }

  const handleOpenStakeholderDialog = (stakeholder?: Stakeholder) => {
    if (stakeholder) {
      setEditingStakeholder(stakeholder)
      setStakeholderName(stakeholder.name)
      setStakeholderType(stakeholder.type)
      setStakeholderEquity(stakeholder.equity.toString())
      setStakeholderEmail(stakeholder.email || "")
      setStakeholderNotes(stakeholder.notes || "")
    } else {
      resetStakeholderForm()
    }
    setStakeholderDialogOpen(true)
  }

  const handleSaveTeamMember = async () => {
    if (!name.trim() || !role.trim()) {
      setError("Name and role are required")
      return
    }

    try {
      setError(null)
      const url = editingMember
        ? `/api/founder/structure/team/${editingMember.id}`
        : "/api/founder/structure/team"
      
      const method = editingMember ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
          role,
          department: department || undefined,
          startDate: startDate || undefined,
          equity: equity ? parseFloat(equity) : undefined,
          isCoFounder,
          notes: notes || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save team member")
      }

      resetTeamForm()
      setTeamDialogOpen(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save team member")
    }
  }

  const handleSaveStakeholder = async () => {
    if (!stakeholderName.trim() || !stakeholderEquity.trim()) {
      setError("Name and equity percentage are required")
      return
    }

    try {
      setError(null)
      const url = editingStakeholder
        ? `/api/founder/structure/stakeholder/${editingStakeholder.id}`
        : "/api/founder/structure/stakeholder"
      
      const method = editingStakeholder ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stakeholderName,
          type: stakeholderType,
          equity: parseFloat(stakeholderEquity),
          email: stakeholderEmail || undefined,
          notes: stakeholderNotes || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save stakeholder")
      }

      resetStakeholderForm()
      setStakeholderDialogOpen(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save stakeholder")
    }
  }

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return

    try {
      const response = await fetch(`/api/founder/structure/team/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete team member")
      }

      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team member")
    }
  }

  const handleDeleteStakeholder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stakeholder?")) return

    try {
      const response = await fetch(`/api/founder/structure/stakeholder/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete stakeholder")
      }

      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete stakeholder")
    }
  }

  const coFounders = teamMembers.filter((m) => m.isCoFounder)
  const totalEquityDistributed =
    teamMembers.reduce((sum, m) => sum + (m.equity || 0), 0) +
    stakeholders.reduce((sum, s) => sum + s.equity, 0)

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "—"
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString()
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Company Structure"
        description="Manage your team, co-founders, equity distribution, and stakeholders"
      />

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Equity Distribution Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Team Equity</p>
              <p className="text-2xl font-bold">{teamMembers.reduce((sum, m) => sum + (m.equity || 0), 0).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Stakeholder Equity</p>
              <p className="text-2xl font-bold">{stakeholders.reduce((sum, s) => sum + s.equity, 0).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Distributed</p>
              <p className="text-2xl font-bold">{totalEquityDistributed.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalEquityDistributed > 100 ? (
                  <span className="text-destructive">Over 100% - Please adjust</span>
                ) : (
                  `${(100 - totalEquityDistributed).toFixed(2)}% remaining`
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">Loading company structure...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="cofounders">Co-Founders</TabsTrigger>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your team roster and roles</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenTeamDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2">No team members yet</p>
                    <Button onClick={() => handleOpenTeamDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Member
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Equity</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.department || "—"}</TableCell>
                            <TableCell>{member.equity ? `${member.equity}%` : "—"}</TableCell>
                            <TableCell>{formatDate(member.startDate)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenTeamDialog(member)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTeamMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Co-Founders Tab */}
          <TabsContent value="cofounders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Co-Founders</CardTitle>
                    <CardDescription>Your founding team members</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenTeamDialog()} variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Co-Founder
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {coFounders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <UserPlus className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2">No co-founders added yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add team members and mark them as co-founders
                    </p>
                    <Button onClick={() => { handleOpenTeamDialog(); setIsCoFounder(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Co-Founder
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coFounders.map((founder) => (
                      <Card key={founder.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{founder.name}</CardTitle>
                              <CardDescription>{founder.role}</CardDescription>
                            </div>
                            <Badge variant="default">Co-Founder</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {founder.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{founder.email}</span>
                            </div>
                          )}
                          {founder.equity && (
                            <div className="flex items-center gap-2 text-sm">
                              <Percent className="h-4 w-4 text-muted-foreground" />
                              <span>{founder.equity}% equity</span>
                            </div>
                          )}
                          {founder.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{founder.notes}</p>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenTeamDialog(founder)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTeamMember(founder.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stakeholders Tab */}
          <TabsContent value="stakeholders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Stakeholders</CardTitle>
                    <CardDescription>Investors, advisors, board members, and other stakeholders</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenStakeholderDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stakeholder
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stakeholders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2">No stakeholders added yet</p>
                    <Button onClick={() => handleOpenStakeholderDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Stakeholder
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Equity</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stakeholders.map((stakeholder) => (
                          <TableRow key={stakeholder.id}>
                            <TableCell className="font-medium">{stakeholder.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {stakeholder.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            </TableCell>
                            <TableCell>{stakeholder.equity}%</TableCell>
                            <TableCell>{stakeholder.email || "—"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenStakeholderDialog(stakeholder)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteStakeholder(stakeholder.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Add/Edit Team Member Dialog */}
      <Dialog open={teamDialogOpen} onOpenChange={(open) => { setTeamDialogOpen(open); if (!open) resetTeamForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            <DialogDescription>
              {editingMember ? "Update team member information" : "Add a new team member to your company"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equity">Equity %</Label>
                <Input
                  id="equity"
                  type="number"
                  step="0.01"
                  value={equity}
                  onChange={(e) => setEquity(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isCoFounder"
                    checked={isCoFounder}
                    onChange={(e) => setIsCoFounder(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isCoFounder" className="cursor-pointer">
                    Co-Founder
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setTeamDialogOpen(false); resetTeamForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveTeamMember} disabled={!name.trim() || !role.trim()}>
              {editingMember ? "Update" : "Add"} Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Stakeholder Dialog */}
      <Dialog open={stakeholderDialogOpen} onOpenChange={(open) => { setStakeholderDialogOpen(open); if (!open) resetStakeholderForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStakeholder ? "Edit Stakeholder" : "Add Stakeholder"}</DialogTitle>
            <DialogDescription>
              {editingStakeholder ? "Update stakeholder information" : "Add a new stakeholder to your company"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stakeholderName">Name *</Label>
              <Input
                id="stakeholderName"
                value={stakeholderName}
                onChange={(e) => setStakeholderName(e.target.value)}
                placeholder="Jane Investor"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stakeholderType">Type *</Label>
                <select
                  id="stakeholderType"
                  value={stakeholderType}
                  onChange={(e) => setStakeholderType(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="investor">Investor</option>
                  <option value="advisor">Advisor</option>
                  <option value="board_member">Board Member</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stakeholderEquity">Equity % *</Label>
                <Input
                  id="stakeholderEquity"
                  type="number"
                  step="0.01"
                  value={stakeholderEquity}
                  onChange={(e) => setStakeholderEquity(e.target.value)}
                  placeholder="5.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stakeholderEmail">Email</Label>
              <Input
                id="stakeholderEmail"
                type="email"
                value={stakeholderEmail}
                onChange={(e) => setStakeholderEmail(e.target.value)}
                placeholder="jane@investor.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stakeholderNotes">Notes</Label>
              <Textarea
                id="stakeholderNotes"
                value={stakeholderNotes}
                onChange={(e) => setStakeholderNotes(e.target.value)}
                placeholder="Additional information..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setStakeholderDialogOpen(false); resetStakeholderForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveStakeholder} disabled={!stakeholderName.trim() || !stakeholderEquity.trim()}>
              {editingStakeholder ? "Update" : "Add"} Stakeholder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
