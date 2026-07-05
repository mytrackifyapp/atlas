"use client"

import { useEffect, useState } from "react"
import {
  Building2,
  Check,
  FileText,
  Loader2,
  Rocket,
  Target,
  TrendingUp,
  X,
} from "lucide-react"
import { UploadButton } from "@uploadthing/react"
import { toast } from "sonner"

import { FundraiseImageUpload } from "@/components/fundraising/fundraise-image-upload"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  detailsFormToPayload,
  emptyFundraiseDetailsForm,
  FUNDRAISE_ROUND_TYPES,
  FUNDRAISE_USE_OF_FUNDS_CATEGORIES,
  fundraiseToDetailsForm,
  type FundraiseDetailsFields,
} from "@/lib/fundraising/details"

type FundraiseSource = Parameters<typeof fundraiseToDetailsForm>[0]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundraise: FundraiseSource | null
  onSuccess?: () => void
}

export function EditFundraiseDetailsDialog({ open, onOpenChange, fundraise, onSuccess }: Props) {
  const [form, setForm] = useState<FundraiseDetailsFields>(emptyFundraiseDetailsForm())
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState("company")

  useEffect(() => {
    if (open && fundraise) {
      setForm(fundraiseToDetailsForm(fundraise))
      setTab("company")
    }
  }, [open, fundraise])

  function updateField<K extends keyof FundraiseDetailsFields>(field: K, value: FundraiseDetailsFields[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleUseOfFunds(category: string) {
    setForm((prev) => {
      const next = prev.useOfFunds.includes(category)
        ? prev.useOfFunds.filter((c) => c !== category)
        : [...prev.useOfFunds, category]
      return { ...prev, useOfFunds: next }
    })
  }

  async function handleSave() {
    if (!form.roundType || !form.targetAmount || !form.targetCloseDate) {
      toast.error("Round type, target amount, and close date are required")
      setTab("round")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/founder/fundraise", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailsFormToPayload(form)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save details")
      toast.success("Fundraise details updated")
      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save details")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Edit fundraise details</DialogTitle>
          <DialogDescription>
            Company profile, pitch narrative, round terms, and investor materials.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="company" className="text-xs sm:text-sm">Company</TabsTrigger>
            <TabsTrigger value="story" className="text-xs sm:text-sm">Story</TabsTrigger>
            <TabsTrigger value="round" className="text-xs sm:text-sm">Round</TabsTrigger>
            <TabsTrigger value="materials" className="text-xs sm:text-sm">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4 mt-0">
            <h3 className="flex items-center gap-2 font-semibold">
              <Building2 className="h-4 w-4 text-primary" />
              Company profile
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <FundraiseImageUpload
                label="Company logo"
                description="Square logo shown on your investor page."
                value={form.companyLogo}
                onChange={(url) => updateField("companyLogo", url)}
                variant="logo"
              />
              <FundraiseImageUpload
                label="Startup image"
                description="Product screenshot, team photo, or hero image."
                value={form.coverImage}
                onChange={(url) => updateField("coverImage", url)}
                variant="cover"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Inc."
                  value={form.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tagline">One-line tagline</Label>
                <Input
                  id="tagline"
                  placeholder="AI-powered logistics for emerging markets"
                  value={form.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://acme.com"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  placeholder="San Francisco, CA"
                  value={form.headquarters}
                  onChange={(e) => updateField("headquarters", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team size</Label>
                <Input
                  id="teamSize"
                  placeholder="12"
                  value={form.teamSize}
                  onChange={(e) => updateField("teamSize", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company bio</Label>
              <Textarea
                id="companyDescription"
                rows={4}
                placeholder="What you do, who you serve, and your mission..."
                value={form.companyDescription}
                onChange={(e) => updateField("companyDescription", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="executiveSummary">Executive summary</Label>
              <Textarea
                id="executiveSummary"
                rows={3}
                placeholder="Short investor-facing overview of the opportunity..."
                value={form.executiveSummary}
                onChange={(e) => updateField("executiveSummary", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="story" className="space-y-4 mt-0">
            <h3 className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Traction & market
            </h3>
            <div className="space-y-2">
              <Label htmlFor="traction">Traction & key metrics</Label>
              <Textarea
                id="traction"
                rows={4}
                placeholder="Revenue, growth rate, customers, partnerships, product milestones..."
                value={form.traction}
                onChange={(e) => updateField("traction", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketOpportunity">Market opportunity</Label>
              <Textarea
                id="marketOpportunity"
                rows={3}
                placeholder="TAM, trends, timing, and why now..."
                value={form.marketOpportunity}
                onChange={(e) => updateField("marketOpportunity", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitiveAdvantage">Competitive advantage</Label>
              <Textarea
                id="competitiveAdvantage"
                rows={3}
                placeholder="Moat, technology, distribution, team edge..."
                value={form.competitiveAdvantage}
                onChange={(e) => updateField("competitiveAdvantage", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="round" className="space-y-4 mt-0">
            <h3 className="flex items-center gap-2 font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Round terms
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Round type *</Label>
                <Select value={form.roundType} onValueChange={(v) => updateField("roundType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNDRAISE_ROUND_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target amount (USD) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={form.targetAmount}
                  onChange={(e) => updateField("targetAmount", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preMoneyValuation">Pre-money valuation</Label>
                <Input
                  id="preMoneyValuation"
                  type="number"
                  value={form.preMoneyValuation}
                  onChange={(e) => updateField("preMoneyValuation", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minInvestment">Minimum investment</Label>
                <Input
                  id="minInvestment"
                  type="number"
                  value={form.minInvestment}
                  onChange={(e) => updateField("minInvestment", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxInvestment">Maximum investment</Label>
                <Input
                  id="maxInvestment"
                  type="number"
                  value={form.maxInvestment}
                  onChange={(e) => updateField("maxInvestment", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetCloseDate">Target close date *</Label>
                <Input
                  id="targetCloseDate"
                  type="date"
                  value={form.targetCloseDate}
                  onChange={(e) => updateField("targetCloseDate", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Use of funds categories</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FUNDRAISE_USE_OF_FUNDS_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleUseOfFunds(category)}
                    className={`rounded-lg border p-2.5 text-left text-sm transition-colors ${
                      form.useOfFunds.includes(category)
                        ? "border-primary bg-primary/10"
                        : "hover:border-primary/40"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      {category}
                      {form.useOfFunds.includes(category) ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="useOfFundsBreakdown">Use of funds breakdown</Label>
              <Textarea
                id="useOfFundsBreakdown"
                rows={4}
                placeholder="How capital will be allocated across hiring, product, GTM..."
                value={form.useOfFundsBreakdown}
                onChange={(e) => updateField("useOfFundsBreakdown", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 mt-0">
            <h3 className="flex items-center gap-2 font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              Investor materials
            </h3>

            <div className="space-y-2">
              <Label>Pitch deck</Label>
              {form.pitchDeck ? (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">Pitch deck uploaded</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => updateField("pitchDeck", null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <UploadButton<OurFileRouter, "pitchDeck">
                  endpoint="pitchDeck"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) updateField("pitchDeck", res[0].url)
                  }}
                  onUploadError={(error) => {
                    const message =
                      error.message?.toLowerCase().includes("size")
                        ? "File is too large. Max 16MB."
                        : error.message || "Failed to upload pitch deck"
                    toast.error(message)
                  }}
                  className="ut-button:w-full"
                  content={{
                    button: ({ ready }) => (
                      <span>{ready ? "Upload pitch deck (PDF)" : "Preparing..."}</span>
                    ),
                  }}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Financial model</Label>
              {form.financialModel ? (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">Financial model uploaded</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => updateField("financialModel", null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <UploadButton<OurFileRouter, "financialModel">
                  endpoint="financialModel"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) updateField("financialModel", res[0].url)
                  }}
                  onUploadError={(error) => {
                    const message =
                      error.message?.toLowerCase().includes("size")
                        ? "File is too large. Max 16MB."
                        : error.message || "Failed to upload financial model"
                    toast.error(message)
                  }}
                  className="ut-button:w-full"
                  content={{
                    button: ({ ready }) => (
                      <span>{ready ? "Upload financial model (PDF)" : "Preparing..."}</span>
                    ),
                  }}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demoVideoUrl">Demo video URL</Label>
              <Input
                id="demoVideoUrl"
                placeholder="https://loom.com/share/..."
                value={form.demoVideoUrl}
                onChange={(e) => updateField("demoVideoUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataRoomUrl">Data room URL</Label>
              <Input
                id="dataRoomUrl"
                placeholder="https://docsend.com/view/..."
                value={form.dataRoomUrl}
                onChange={(e) => updateField("dataRoomUrl", e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save details
                <Rocket className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
