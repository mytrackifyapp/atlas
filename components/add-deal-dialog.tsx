"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Sparkles, Upload, X } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

const statuses = ["New", "Under Review", "Due Diligence", "Declined"] as const

type Status = (typeof statuses)[number]

export type DealCreatePayload = {
  name: string
  tagline: string
  sector: string
  stage: string
  location: string
  website?: string | null
  onboarded?: boolean
  asking?: number | null
  valuation?: number | null
  status?: Status
  score?: number
  highlights?: string[]
  logo?: string | null
}

export function AddDealDialog({
  open,
  onOpenChange,
  onCreated,
  deal,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  deal?: (DealCreatePayload & { id: string }) | null
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    sector: "",
    stage: "",
    location: "",
    website: "",
    onboarded: false,
    asking: "",
    valuation: "",
    status: "New" as Status,
    score: "0",
    highlights: "",
    logo: null as string | null,
  })

  // When opening for edit, hydrate the form from the provided deal.
  useEffect(() => {
    if (!open || !deal) return
    setForm({
      name: deal.name ?? "",
      tagline: deal.tagline ?? "",
      sector: deal.sector ?? "",
      stage: deal.stage ?? "",
      location: deal.location ?? "",
      website: deal.website ?? "",
      onboarded: !!deal.onboarded,
      asking: typeof deal.asking === "number" ? String(deal.asking) : "",
      valuation: typeof deal.valuation === "number" ? String(deal.valuation) : "",
      status: (deal.status ?? "New") as Status,
      score: typeof deal.score === "number" ? String(deal.score) : "0",
      highlights: Array.isArray(deal.highlights) ? deal.highlights.join(", ") : "",
      logo: deal.logo ?? null,
    })
    setError(null)
    setLogoUploading(false)
  }, [open, deal])

  const payload: DealCreatePayload = useMemo(
    () => ({
      name: form.name,
      tagline: form.tagline,
      sector: form.sector,
      stage: form.stage,
      location: form.location,
      website: form.website.trim() ? form.website.trim() : null,
      onboarded: form.onboarded,
      asking: form.asking ? Number(form.asking) : null,
      valuation: form.valuation ? Number(form.valuation) : null,
      status: form.status,
      score: form.score ? Number(form.score) : 0,
      highlights: form.highlights
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      logo: form.logo,
    }),
    [form]
  )

  const canSubmit =
    payload.name.trim() &&
    payload.tagline.trim() &&
    payload.sector.trim() &&
    payload.stage.trim() &&
    payload.location.trim()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const isEdit = !!deal?.id
      const res = await fetch(isEdit ? `/api/deal-flow/deals/${deal!.id}` : "/api/deal-flow/deals", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || (isEdit ? "Failed to update deal" : "Failed to create deal"))
      }
      onCreated()
      onOpenChange(false)
      setForm({
        name: "",
        tagline: "",
        sector: "",
        stage: "",
        location: "",
        website: "",
        onboarded: false,
        asking: "",
        valuation: "",
        status: "New",
        score: "0",
        highlights: "",
        logo: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {deal?.id ? "Edit deal" : "Add deal"}
          </DialogTitle>
          <DialogDescription>
            {deal?.id
              ? "Update the opportunity details in your deal pipeline."
              : "Create a new opportunity in your deal pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-name">Company name</Label>
              <Input
                id="deal-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="AcmeAI"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-sector">Sector</Label>
              <Input
                id="deal-sector"
                value={form.sector}
                onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
                placeholder="FinTech"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-tagline">Tagline</Label>
            <Textarea
              id="deal-tagline"
              value={form.tagline}
              onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
              placeholder="One-liner describing what they do"
              className="min-h-[90px] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pipeline status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v as Status }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-stage">Stage</Label>
              <Input
                id="deal-stage"
                value={form.stage}
                onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
                placeholder="Seed / Series A"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-location">Location</Label>
              <Input
                id="deal-location"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Lagos, NG"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-score" className="flex items-center gap-2">
                Score <Sparkles className="h-4 w-4 text-muted-foreground" />
              </Label>
              <Input
                id="deal-score"
                inputMode="numeric"
                value={form.score}
                onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
                placeholder="0 - 100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-website">Website (optional)</Label>
              <Input
                id="deal-website"
                value={form.website}
                onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://startup.com"
              />
              <p className="text-xs text-muted-foreground">
                Used as an external link if the startup isn’t onboarded yet.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center justify-between gap-3">
                <span>Onboarded on Trackify?</span>
                <Switch
                  checked={form.onboarded}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, onboarded: checked }))}
                  aria-label="Onboarded on Trackify"
                />
              </Label>
              <p className="text-xs text-muted-foreground">
                If enabled, clicking the deal opens the Trackify startup profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-asking">Raising (USD)</Label>
              <Input
                id="deal-asking"
                inputMode="numeric"
                value={form.asking}
                onChange={(e) => setForm((p) => ({ ...p, asking: e.target.value }))}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-valuation">Valuation (USD)</Label>
              <Input
                id="deal-valuation"
                inputMode="numeric"
                value={form.valuation}
                onChange={(e) => setForm((p) => ({ ...p, valuation: e.target.value }))}
                placeholder="5000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-highlights">Highlights (comma-separated)</Label>
            <Input
              id="deal-highlights"
              value={form.highlights}
              onChange={(e) => setForm((p) => ({ ...p, highlights: e.target.value }))}
              placeholder="Strong team, Growing market, Traction"
            />
          </div>

          <div className="space-y-2">
            <Label>Company logo (optional)</Label>
            <div className="flex items-center gap-4">
              {form.logo ? (
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={form.logo}
                    alt="Company logo"
                    className="h-16 w-16 rounded-lg object-cover border border-border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logo uploaded</p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {form.logo}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setForm((p) => ({ ...p, logo: null }))}
                    disabled={logoUploading || loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1">
                  <UploadButton<OurFileRouter>
                    endpoint="companyLogo"
                    onClientUploadComplete={(res) => {
                      const url = res?.[0]?.url
                      if (url) setForm((p) => ({ ...p, logo: url }))
                      setLogoUploading(false)
                    }}
                    onUploadError={(e) => {
                      console.error("Logo upload error:", e)
                      setLogoUploading(false)
                      setError("Failed to upload logo. Please try again.")
                    }}
                    onUploadBegin={() => {
                      setError(null)
                      setLogoUploading(true)
                    }}
                    className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-lg ut-button:border-2 ut-button:border-dashed ut-button:border-border ut-button:hover:border-primary/50"
                    content={{
                      button: ({ ready }) => (
                        <div className="flex items-center justify-center gap-2 px-4 py-3">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {ready ? "Upload logo (optional)" : "Preparing..."}
                          </span>
                        </div>
                      ),
                      allowedContent: "Image (4MB max)",
                    }}
                  />
                </div>
              )}
            </div>
            {logoUploading ? (
              <p className="text-xs text-muted-foreground">Uploading logo...</p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !canSubmit}>
              {loading ? (deal?.id ? "Saving…" : "Creating…") : deal?.id ? "Save changes" : "Create deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

