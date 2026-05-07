"use client"

import { useMemo, useState } from "react"
import { Rocket, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const COHORT = "Trackify Finance 2026"
const COHORT_MONTH = "November"

export function AcceleratorApplyCard() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    companyName: "",
    website: "",
    stage: "",
    location: "",
    notes: "",
    company: "", // honeypot
  })

  const isSubmitting = status === "submitting"
  const buttonLabel = useMemo(() => {
    if (status === "submitting") return "Submitting…"
    if (status === "success") return "Submitted"
    return "Apply / Join waitlist"
  }, [status])

  const canSubmit =
    form.fullName.trim().length >= 2 &&
    form.email.trim().length > 3 &&
    form.companyName.trim().length > 0 &&
    form.stage.trim().length > 0 &&
    form.location.trim().length > 0

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus("submitting")
    setError(null)
    try {
      const res = await fetch("/api/accelerator/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cohort: COHORT,
          website: form.website.trim() ? form.website.trim() : null,
        }),
      })

      const body = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) throw new Error(body?.error || "Failed to submit application")

      setStatus("success")
      setForm({
        fullName: "",
        email: "",
        companyName: "",
        website: "",
        stage: "",
        location: "",
        notes: "",
        company: "",
      })
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Failed to submit application")
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Apply to {COHORT}
        </CardTitle>
        <CardDescription>
          Cohort launches in <strong>{COHORT_MONTH}</strong>. Submit your details and we’ll email next steps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            name="company"
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full name*</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email*</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="jane@startup.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company name*</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                placeholder="Trackify Finance"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://startup.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stage*</Label>
              <Input
                value={form.stage}
                onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
                placeholder="Pre-seed / Seed / Series A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Location*</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Lagos, NG"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Tell us what you’re building and what you want from the cohort."
              className="min-h-[110px] resize-none"
            />
          </div>

          {status === "success" ? (
            <p className="text-sm text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Submitted. Check your inbox for confirmation.
            </p>
          ) : null}
          {status === "error" ? <p className="text-sm text-red-400">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting || !canSubmit}>
            {buttonLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

