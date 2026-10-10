"use client"

import { useEffect, useMemo, useState } from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"

const COHORT = "Trackify Finance 2026"

const STAGES = ["Pre-seed", "Seed", "Series A", "Growth"]
const LOCATIONS = ["Lagos", "Nairobi", "Cape Town", "Accra", "Remote"]

const fieldClass =
  "h-12 rounded-full border-neutral-200 bg-neutral-50 shadow-none dark:border-neutral-700 dark:bg-neutral-950"
const selectClass =
  "h-12 w-full rounded-full border-neutral-200 bg-neutral-50 px-4 shadow-none data-[size=default]:h-12 lg:w-40 dark:border-neutral-700 dark:bg-neutral-950"

const STEPS = ["details", "company", "notes"] as const
type Step = (typeof STEPS)[number]

export function AcceleratorApplyCard() {
  const { data: session } = authClient.useSession()
  const [step, setStep] = useState<Step>("details")
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
    company: "",
  })

  useEffect(() => {
    const name = session?.user?.name?.trim() ?? ""
    const email = session?.user?.email?.trim() ?? ""
    if (!name && !email) return
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || name,
      email: prev.email || email,
    }))
  }, [session])

  const isSubmitting = status === "submitting"
  const stepIndex = STEPS.indexOf(step)
  const isLastStep = step === "notes"

  const stepValid = useMemo(() => {
    if (step === "details") {
      return form.fullName.trim().length >= 2 && form.email.trim().length > 3
    }
    if (step === "company") {
      return (
        form.companyName.trim().length > 0 &&
        form.stage.trim().length > 0 &&
        form.location.trim().length > 0
      )
    }
    return true
  }, [form.companyName, form.email, form.fullName, form.location, form.stage, step])

  const buttonLabel = useMemo(() => {
    if (status === "submitting") return "Submitting…"
    if (isLastStep) return status === "success" ? "Submitted" : "Submit"
    return "Next"
  }, [isLastStep, status])

  const goBack = () => {
    const prev = STEPS[stepIndex - 1]
    if (!prev) return
    setError(null)
    setStep(prev)
  }

  async function submitApplication() {
    setStatus("submitting")
    setError(null)
    try {
      const res = await fetch("/api/accelerator/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          companyName: form.companyName.trim(),
          website: form.website.trim() ? form.website.trim() : null,
          stage: form.stage,
          location: form.location,
          notes: form.notes,
          company: form.company,
          cohort: COHORT,
        }),
      })

      const body = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) throw new Error(body?.error || "Failed to submit application")

      setStatus("success")
      setStep("details")
      setForm({
        fullName: session?.user?.name?.trim() ?? "",
        email: session?.user?.email?.trim() ?? "",
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stepValid || isSubmitting) return
    const next = STEPS[stepIndex + 1]
    if (next) {
      setStatus("idle")
      setError(null)
      setStep(next)
      return
    }
    await submitApplication()
  }

  return (
    <div
      id="apply"
      className="relative mx-auto mt-10 max-w-5xl rounded-[1.75rem] border border-black/[0.05] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-7 dark:border-white/10 dark:bg-[#171717]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
          {step === "details"
            ? "Your details"
            : step === "company"
              ? "Company details"
              : "Anything else to add?"}
        </p>
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            Back
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          name="company"
          value={form.company}
          onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
          className="hidden"
        />

        {step === "details" ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Full name"
              required
              className={`${fieldClass} min-w-0 flex-1`}
            />
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Work email"
              required
              className={`${fieldClass} min-w-0 flex-1`}
            />
            <Input
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="Website (optional)"
              className={`${fieldClass} min-w-0 flex-1`}
            />
            <StepButton disabled={!stepValid} label={buttonLabel} />
          </div>
        ) : null}

        {step === "company" ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              value={form.companyName}
              onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              placeholder="Company or what you’re building…"
              required
              className={`${fieldClass} min-w-0 flex-1`}
            />
            <Select
              value={form.stage || undefined}
              onValueChange={(value) => setForm((p) => ({ ...p, stage: value }))}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.location || undefined}
              onValueChange={(value) => setForm((p) => ({ ...p, location: value }))}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <StepButton disabled={!stepValid} label={buttonLabel} />
          </div>
        ) : null}

        {step === "notes" ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Tell us what you’re building and what you want from the cohort."
              className="min-h-[48px] flex-1 resize-none rounded-[1.5rem] border-neutral-200 bg-neutral-50 px-4 py-3 shadow-none dark:border-neutral-700 dark:bg-neutral-950"
            />
            <StepButton disabled={isSubmitting} label={buttonLabel} />
          </div>
        ) : null}

        {status === "success" ? (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <Sparkles className="h-4 w-4" />
            Submitted. Check your inbox for confirmation.
          </p>
        ) : null}
        {status === "error" ? <p className="text-sm text-red-500">{error}</p> : null}
      </form>
    </div>
  )
}

function StepButton({ disabled, label }: { disabled: boolean; label: string }) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      className="h-12 shrink-0 rounded-full bg-neutral-950 px-6 font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
    >
      {label}
    </Button>
  )
}
