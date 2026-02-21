"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Send,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Mail,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Investor {
  id: string
  name: string
  email?: string
  firm?: string
  status: string
}

interface InvestorUpdate {
  id: string
  title: string
  content: string
  recipients: string[]
  sentAt: string | Date
  status: "draft" | "sent"
  metrics?: {
    revenue?: number
    users?: number
    growth?: number
  }
}

export function InvestorUpdatesView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [investors, setInvestors] = useState<Investor[]>([])
  const [updates, setUpdates] = useState<InvestorUpdate[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([])
  const [revenue, setRevenue] = useState("")
  const [users, setUsers] = useState("")
  const [growth, setGrowth] = useState("")

  const fetchInvestors = useCallback(async () => {
    try {
      const response = await fetch("/api/founder/investors")
      const result = await response.json()

      if (result.success) {
        setInvestors(result.investors || [])
      }
    } catch (err) {
      console.error("Error fetching investors:", err)
    }
  }, [])

  const fetchUpdates = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/founder/updates")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch updates")
      }

      if (result.success) {
        setUpdates(result.updates || [])
      }
    } catch (err) {
      console.error("Error fetching updates:", err)
      setError(err instanceof Error ? err.message : "Failed to load updates")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchInvestors(), fetchUpdates()])
    }
    loadData()
  }, [fetchInvestors, fetchUpdates])

  const handleCreateUpdate = async () => {
    if (!title.trim() || !content.trim() || selectedInvestors.length === 0) {
      setError("Please fill in all required fields and select at least one investor")
      return
    }

    setSending(true)
    setError(null)

    try {
      const response = await fetch("/api/founder/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          recipients: selectedInvestors,
          metrics: {
            revenue: revenue ? parseFloat(revenue) : undefined,
            users: users ? parseInt(users) : undefined,
            growth: growth ? parseFloat(growth) : undefined,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send update")
      }

      // Reset form
      setTitle("")
      setContent("")
      setSelectedInvestors([])
      setRevenue("")
      setUsers("")
      setGrowth("")
      setCreateDialogOpen(false)
      
      // Refresh updates
      fetchUpdates()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send update")
    } finally {
      setSending(false)
    }
  }

  const toggleInvestor = (investorId: string) => {
    setSelectedInvestors((prev) =>
      prev.includes(investorId)
        ? prev.filter((id) => id !== investorId)
        : [...prev, investorId]
    )
  }

  const selectAllInvestors = () => {
    const committedInvestors = investors.filter((inv) => inv.status === "Committed")
    setSelectedInvestors(committedInvestors.map((inv) => inv.id))
  }

  const formatDate = (date: string | Date) => {
    if (!date) return "—"
    const d = date instanceof Date ? date : new Date(date)
    return format(d, "MMM d, yyyy 'at' h:mm a")
  }

  const committedInvestors = investors.filter((inv) => inv.status === "Committed")

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Investor Updates"
        description="Keep your investors informed with regular updates on company progress, metrics, and milestones"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)} disabled={committedInvestors.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            New Update
          </Button>
        }
      />

      {committedInvestors.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No committed investors yet</p>
              <p className="text-sm text-muted-foreground">Add committed investors in your fundraising page to send updates.</p>
              <Button asChild className="mt-4">
                <a href="/founder/fundraising">Go to Fundraising</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">Loading updates...</p>
        </div>
      ) : error && updates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-3" />
              <p className="text-destructive mb-4">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : updates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No updates sent yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first investor update to keep your investors informed.</p>
              <Button onClick={() => setCreateDialogOpen(true)} disabled={committedInvestors.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Create Update
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{update.title}</CardTitle>
                      <Badge variant={update.status === "sent" ? "default" : "secondary"}>
                        {update.status === "sent" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sent
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Draft
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(update.sentAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {update.recipients.length} recipient{update.recipients.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {update.metrics && (update.metrics.revenue || update.metrics.users || update.metrics.growth) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      {update.metrics.revenue && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Revenue</p>
                          <p className="text-xl font-bold">${update.metrics.revenue.toLocaleString()}</p>
                        </div>
                      )}
                      {update.metrics.users && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Users</p>
                          <p className="text-xl font-bold">{update.metrics.users.toLocaleString()}</p>
                        </div>
                      )}
                      {update.metrics.growth && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Growth</p>
                          <p className="text-xl font-bold">+{update.metrics.growth}%</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm">{update.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Update Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Investor Update</DialogTitle>
            <DialogDescription>
              Share company progress, metrics, and milestones with your investors
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Update Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q1 2025 Progress Update"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Update Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share key highlights, achievements, challenges, and next steps..."
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Key Metrics (Optional)</Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenue" className="text-xs">Revenue</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
                      placeholder="$0"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="users" className="text-xs">Users</Label>
                    <Input
                      id="users"
                      type="number"
                      value={users}
                      onChange={(e) => setUsers(e.target.value)}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="growth" className="text-xs">Growth %</Label>
                    <Input
                      id="growth"
                      type="number"
                      value={growth}
                      onChange={(e) => setGrowth(e.target.value)}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Recipients *</Label>
                  {committedInvestors.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllInvestors}
                      className="text-xs"
                    >
                      Select All ({committedInvestors.length})
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[200px] border rounded-lg p-4">
                  {committedInvestors.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No committed investors. Add investors in your fundraising page.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {committedInvestors.map((investor) => (
                        <div
                          key={investor.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`investor-${investor.id}`}
                            checked={selectedInvestors.includes(investor.id)}
                            onCheckedChange={() => toggleInvestor(investor.id)}
                          />
                          <Label
                            htmlFor={`investor-${investor.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div>
                              <p className="font-medium text-sm">{investor.name}</p>
                              {investor.firm && (
                                <p className="text-xs text-muted-foreground">{investor.firm}</p>
                              )}
                              {investor.email && (
                                <p className="text-xs text-muted-foreground">{investor.email}</p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleCreateUpdate} disabled={sending || !title.trim() || !content.trim() || selectedInvestors.length === 0}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
