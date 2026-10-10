"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { US_STATES, isUsStateCode, stateName, toPalmJurisdiction } from "@/lib/palm/jurisdictions"

type EntityType = "llc" | "corporation"

type FilingRow = {
  id: string
  businessId: string | null
  status: string
  entityType: string
  jurisdiction: string
  name: string
  mode: string | null
  createdAt: string
}

type NameCheck = {
  eligible: boolean
  compliant: boolean
  available: boolean
  violations?: { message: string; severity: string }[]
  alternatives?: string[]
}

const STEPS = ["Entity", "Company", "Address", "Organizer", "Review"] as const

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function formatMoney(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }
  if (value && typeof value === "object" && "amount" in value) {
    return formatMoney((value as { amount: unknown }).amount)
  }
  if (typeof value === "string" && value.trim()) return value
  return null
}

export function FormationWorkspace() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [filings, setFilings] = useState<FilingRow[]>([])
  const [configured, setConfigured] = useState(true)
  const [loadingList, setLoadingList] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [nameCheck, setNameCheck] = useState<NameCheck | null>(null)
  const [feeLabel, setFeeLabel] = useState<string | null>(null)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<string | null>(null)

  const [entityType, setEntityType] = useState<EntityType>("llc")
  const [stateCode, setStateCode] = useState("DE")
  const [entityName, setEntityName] = useState("")
  const [purpose, setPurpose] = useState("Any lawful purpose")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [contactName, setContactName] = useState("")
  const [street, setStreet] = useState("")
  const [street2, setStreet2] = useState("")
  const [city, setCity] = useState("")
  const [postal, setPostal] = useState("")
  const [organizerFirst, setOrganizerFirst] = useState("")
  const [organizerLast, setOrganizerLast] = useState("")
  const [organizerTitle, setOrganizerTitle] = useState("Authorized Person")

  const jurisdiction = toPalmJurisdiction(stateCode)

  const payload = useMemo(() => {
    const address = {
      street_line_1: street,
      ...(street2 ? { street_line_2: street2 } : {}),
      city,
      region: stateCode,
      postal_code: postal,
      country: "US",
    }
    return {
      entity_type: entityType,
      jurisdiction,
      entity_name: entityName.trim(),
      purpose: purpose.trim(),
      email: email.trim(),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(website.trim() ? { website: website.trim() } : {}),
      contact: {
        name: contactName.trim() || `${organizerFirst} ${organizerLast}`.trim(),
        email: email.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      },
      principal_address: address,
      organizers: [
        {
          name: {
            type: "person",
            first: organizerFirst.trim(),
            last: organizerLast.trim(),
          },
          address,
          title: organizerTitle.trim() || "Authorized Person",
          email: email.trim(),
        },
      ],
    }
  }, [
    city,
    contactName,
    email,
    entityName,
    entityType,
    jurisdiction,
    organizerFirst,
    organizerLast,
    organizerTitle,
    phone,
    postal,
    purpose,
    stateCode,
    street,
    street2,
    website,
  ])

  const loadFilings = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await fetch("/api/founder/formation")
      const data = await res.json()
      setConfigured(data.configured !== false)
      setFilings(data.filings ?? [])
    } catch {
      setError("Could not load filings")
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    void loadFilings()
  }, [loadFilings])

  useEffect(() => {
    const name = searchParams.get("name")?.trim()
    const state = searchParams.get("state")?.toUpperCase()
    const entity = searchParams.get("entity")
    if (name) setEntityName(name)
    if (state && isUsStateCode(state)) setStateCode(state)
    if (entity === "llc" || entity === "corporation") setEntityType(entity)
    if (name) setStep(1)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch(
          `/api/founder/formation/fee?entity_type=${entityType}&jurisdiction=${encodeURIComponent(jurisdiction)}`,
        )
        const data = await res.json()
        if (cancelled) return
        const total =
          formatMoney(data?.fee?.total) ||
          formatMoney(data?.total) ||
          formatMoney(data?.fee?.base) ||
          formatMoney(data?.estimate)
        setFeeLabel(total)
      } catch {
        if (!cancelled) setFeeLabel(null)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [entityType, jurisdiction])

  const checkName = async () => {
    if (!entityName.trim()) return
    setBusy(true)
    setError("")
    try {
      const params = new URLSearchParams({
        name: entityName.trim(),
        entity_type: entityType,
        jurisdiction,
      })
      const res = await fetch(`/api/founder/formation/name-eligibility?${params}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Name check failed")
        setNameCheck(null)
        return
      }
      setNameCheck(data)
    } catch {
      setError("Name check failed")
    } finally {
      setBusy(false)
    }
  }

  const submit = async () => {
    setBusy(true)
    setError("")
    try {
      const validateRes = await fetch("/api/founder/formation/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const validateData = await validateRes.json()
      if (!validateRes.ok) {
        setError(validateData.error || "Validation failed")
        return
      }

      const res = await fetch("/api/founder/formation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Could not submit formation")
        return
      }
      setSubmittedId(data.filing?.id ?? null)
      setLiveStatus(data.filing?.status ?? "queued")
      await loadFilings()
    } catch {
      setError("Could not submit formation")
    } finally {
      setBusy(false)
    }
  }

  const refreshFiling = async (id: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/founder/formation/${id}`)
      const data = await res.json()
      if (res.ok) {
        setLiveStatus(data.filing?.status ?? null)
        await loadFilings()
      }
    } finally {
      setBusy(false)
    }
  }

  const canNext = () => {
    if (step === 1) return Boolean(entityName.trim() && email.trim() && purpose.trim())
    if (step === 2) return Boolean(street.trim() && city.trim() && postal.trim())
    if (step === 3) return Boolean(organizerFirst.trim() && organizerLast.trim())
    return true
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="U.S. company formation"
        description="Form an LLC or C-Corp in any U.S. state from Trackify. Palm files with the state, acts as registered agent if you don’t name one, and can bundle an EIN after the entity exists."
        breadcrumbs={[
          { label: "Founder", href: "/founder" },
          { label: "U.S. company" },
        ]}
      />

      {!configured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Palm is not configured on this environment yet. Add <code>PALM_API_KEY</code> (test keys start
          with <code>sk_test_</code>) to enable live filings.
        </div>
      ) : null}

      {submittedId ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Filing submitted</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Palm created filing <span className="font-mono text-foreground">{submittedId}</span>.
                Status: <span className="font-medium text-foreground">{liveStatus ?? "queued"}</span>.
                It moves through queued → processing → filed → completed. We’ll store the state
                registration number here when the filing completes.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                disabled={busy}
                onClick={() => refreshFiling(submittedId)}
              >
                Refresh status
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <ol className="mb-6 flex flex-wrap gap-2 text-xs font-medium">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className={`rounded-full px-3 py-1 ${
                  i === step
                    ? "bg-neutral-950 text-white"
                    : i < step
                      ? "bg-lime-100 text-lime-900"
                      : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {i + 1}. {label}
              </li>
            ))}
          </ol>

          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Entity type">
                <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corporation">C-Corporation</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="State of formation">
                <Select value={stateCode} onValueChange={setStateCode}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {feeLabel ? (
                <p className="sm:col-span-2 text-sm text-muted-foreground">
                  Estimated filing fee for {stateName(stateCode)}:{" "}
                  <span className="font-medium text-foreground">{feeLabel}</span>. Final amount is
                  confirmed at submission.
                </p>
              ) : (
                <p className="sm:col-span-2 text-sm text-muted-foreground">
                  Fees vary by state. We’ll estimate after you pick a jurisdiction.
                </p>
              )}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Legal name">
                  <div className="flex gap-2">
                    <Input
                      value={entityName}
                      onChange={(e) => {
                        setEntityName(e.target.value)
                        setNameCheck(null)
                      }}
                      placeholder={entityType === "llc" ? "Acme Holdings LLC" : "Acme Holdings Inc."}
                    />
                    <Button type="button" variant="outline" disabled={busy} onClick={checkName}>
                      Check name
                    </Button>
                  </div>
                </Field>
                {nameCheck ? (
                  <p
                    className={`mt-2 text-sm ${nameCheck.eligible ? "text-emerald-700" : "text-red-600"}`}
                  >
                    {nameCheck.eligible
                      ? "This name looks eligible in the selected state."
                      : nameCheck.violations?.[0]?.message ||
                        "This name is not eligible. Try a designator such as LLC."}
                  </p>
                ) : null}
                {nameCheck?.alternatives?.length ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Suggestions: {nameCheck.alternatives.slice(0, 3).join(" · ")}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <Field label="Purpose">
                  <Textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                  />
                </Field>
              </div>
              <Field label="Business email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founders@company.com"
                />
              </Field>
              <Field label="Phone (optional)">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-123-4567" />
              </Field>
              <Field label="Website (optional)">
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                />
              </Field>
              <Field label="Filing contact name">
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Street">
                  <Input value={street} onChange={(e) => setStreet(e.target.value)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Apartment, suite (optional)">
                  <Input value={street2} onChange={(e) => setStreet2(e.target.value)} />
                </Field>
              </div>
              <Field label="City">
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="ZIP">
                <Input value={postal} onChange={(e) => setPostal(e.target.value)} />
              </Field>
              <p className="sm:col-span-2 text-sm text-muted-foreground">
                Region is set to {stateName(stateCode)} ({stateCode}). Omit a registered agent on
                this form and Palm provides registered-agent service with the filing.
              </p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <Input value={organizerFirst} onChange={(e) => setOrganizerFirst(e.target.value)} />
              </Field>
              <Field label="Last name">
                <Input value={organizerLast} onChange={(e) => setOrganizerLast(e.target.value)} />
              </Field>
              <Field label="Title">
                <Input
                  value={organizerTitle}
                  onChange={(e) => setOrganizerTitle(e.target.value)}
                  placeholder="Authorized Person"
                />
              </Field>
              <p className="sm:col-span-2 text-sm text-muted-foreground">
                This person executes the articles. Their address uses the principal office above.
                Additional members can be added later.
              </p>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Entity:</span>{" "}
                {entityType === "llc" ? "LLC" : "C-Corporation"} in {stateName(stateCode)}
              </p>
              <p>
                <span className="text-muted-foreground">Name:</span> {entityName}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {email}
              </p>
              <p>
                <span className="text-muted-foreground">Office:</span> {street}
                {street2 ? `, ${street2}` : ""}, {city}, {stateCode} {postal}
              </p>
              <p>
                <span className="text-muted-foreground">Organizer:</span> {organizerFirst}{" "}
                {organizerLast} ({organizerTitle})
              </p>
              {feeLabel ? (
                <p>
                  <span className="text-muted-foreground">Estimated fee:</span> {feeLabel}
                </p>
              ) : null}
              <p className="text-muted-foreground">
                Trackify does not provide legal or tax advice. Palm files with the state using your
                details.
              </p>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0 || busy}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            {step < 4 ? (
              <Button type="button" disabled={!canNext() || busy} onClick={() => setStep((s) => s + 1)}>
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" disabled={busy || !configured} onClick={submit}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                File with Palm
              </Button>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold tracking-tight">Your filings</h2>
        {loadingList ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : filings.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No formation filings yet.</p>
        ) : (
          <ul className="mt-3 divide-y rounded-2xl border border-neutral-200 bg-white">
            {filings.map((filing) => (
              <li key={filing.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="font-medium">{filing.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {filing.entityType} · {filing.jurisdiction} · {filing.status}
                    {filing.mode === "test" ? " · test" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => refreshFiling(filing.id)}
                >
                  Refresh
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
