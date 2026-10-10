"use client"

import { useState, type FormEvent } from "react"
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react"
import Link from "next/link"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { US_STATES, stateName } from "@/lib/palm/jurisdictions"

type EntityType = "llc" | "corporation"

type NameCheckResult = {
  eligible?: boolean
  compliant?: boolean
  available?: boolean
  violations?: { message: string; severity?: string }[]
  alternatives?: string[]
}

function registerHref(name: string, state: string, entity: EntityType) {
  const params = new URLSearchParams({
    name: name.trim(),
    state,
    entity,
  })
  return `/founder/incorporate?${params.toString()}`
}

function resultStatus(result: NameCheckResult) {
  if (result.eligible) return "ok" as const
  if (result.available) return "warn" as const
  return "bad" as const
}

const STATUS_STYLES = {
  ok: {
    wrap: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
    label: "Available",
  },
  warn: {
    wrap: "bg-amber-50 text-amber-800",
    icon: AlertCircle,
    label: "Almost",
  },
  bad: {
    wrap: "bg-red-50 text-red-700",
    icon: XCircle,
    label: "Unavailable",
  },
}

export function IncorporateHero() {
  const [name, setName] = useState("")
  const [state, setState] = useState("DE")
  const [entityType, setEntityType] = useState<EntityType>("llc")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<NameCheckResult | null>(null)
  const [searchedName, setSearchedName] = useState("")

  const entityLabel = entityType === "corporation" ? "C-Corp" : "LLC"

  const runSearch = async (query: string) => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setError("Enter a company name to search.")
      setResult(null)
      return
    }

    setBusy(true)
    setError("")
    try {
      const params = new URLSearchParams({
        name: trimmed,
        state,
        entity_type: entityType,
      })
      const res = await fetch(`/api/incorporate/name-check?${params}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Name search failed. Try again.")
        setResult(null)
        return
      }
      setSearchedName(trimmed)
      setResult(data)
    } catch {
      setError("Name search failed. Try again.")
      setResult(null)
    } finally {
      setBusy(false)
    }
  }

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    void runSearch(name)
  }

  const status = result ? resultStatus(result) : null
  const StatusIcon = status ? STATUS_STYLES[status].icon : null

  const headline = !result
    ? ""
    : status === "ok"
      ? `${searchedName} is available in ${stateName(state)}.`
      : status === "warn"
        ? result.violations?.[0]?.message ||
          `Add an ${entityLabel} designator to file in ${stateName(state)}.`
        : result.violations?.[0]?.message ||
          `${searchedName} isn’t available as a ${entityLabel} in ${stateName(state)}.`

  return (
    <section className="relative isolate overflow-hidden bg-[#d9cfc4]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/inc-hero3.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-black"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-[6.5rem] text-center sm:px-8 sm:pb-20 sm:pt-28 lg:min-h-dvh lg:justify-center lg:pb-24 lg:pt-32">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/35 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md">
          Powered by
          <span className="font-semibold tracking-tight">Palm</span>
        </p>
        <h1 className="mt-5 max-w-4xl text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl sm:leading-[1.08] lg:text-[3.35rem]">
          Expand your business into the USA with Trackify
        </h1>

        <div className="mt-8 w-full rounded-[1.75rem] border border-white/70 bg-white/40 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:mt-10 sm:rounded-[2rem] sm:p-2.5">
          <div className="rounded-[1.35rem] bg-white text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:rounded-[1.6rem]">
            <form
              onSubmit={onSearch}
              className="flex flex-col gap-2 p-2 sm:flex-row sm:items-end sm:gap-0 sm:p-2"
            >
              <label className="min-w-0 flex-1 rounded-2xl px-3 py-2 transition-colors hover:bg-neutral-50 has-[:focus]:bg-neutral-50 sm:px-4">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Company name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Trackify Ventures LLC"
                  autoComplete="organization"
                  className="mt-0.5 h-8 w-full bg-transparent text-[15px] font-medium text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400"
                />
              </label>

              <div className="hidden h-12 w-px self-center bg-neutral-200 sm:block" />

              <div className="grid grid-cols-2 gap-1 sm:contents">
                <div className="rounded-2xl px-3 py-2 transition-colors hover:bg-neutral-50 has-[:focus-visible]:bg-neutral-50 sm:w-[10.5rem] sm:px-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    State
                  </span>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger
                      size="sm"
                      className="mt-0.5 h-8 w-full border-0 bg-transparent p-0 text-[15px] font-medium text-neutral-900 shadow-none focus-visible:ring-0 data-[size=sm]:h-8"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[80] max-h-72 rounded-xl">
                      {US_STATES.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden h-12 w-px self-center bg-neutral-200 sm:block" />

                <div className="rounded-2xl px-3 py-2 transition-colors hover:bg-neutral-50 has-[:focus-visible]:bg-neutral-50 sm:w-[7.25rem] sm:px-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Entity
                  </span>
                  <Select
                    value={entityType}
                    onValueChange={(value) => setEntityType(value as EntityType)}
                  >
                    <SelectTrigger
                      size="sm"
                      className="mt-0.5 h-8 w-full border-0 bg-transparent p-0 text-[15px] font-medium text-neutral-900 shadow-none focus-visible:ring-0 data-[size=sm]:h-8"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[80] rounded-xl">
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corporation">C-Corp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-sky-400 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-500 disabled:opacity-70 sm:ml-1.5 sm:px-6"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </button>
            </form>

            {error ? (
              <p className="border-t border-neutral-100 px-5 py-3 text-sm text-red-600">{error}</p>
            ) : null}

            {result && status && StatusIcon ? (
              <div className="animate-in fade-in slide-in-from-top-1 border-t border-neutral-100 px-4 py-4 duration-200 sm:px-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status].wrap}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
                      {STATUS_STYLES[status].label}
                    </span>
                    <p className="mt-2 text-[0.95rem] font-medium leading-snug text-neutral-900">
                      {headline}
                    </p>
                    {result.alternatives?.length ? (
                      <div className="mt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          Try instead
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {result.alternatives.slice(0, 4).map((alt) => (
                            <button
                              key={alt}
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                setName(alt)
                                void runSearch(alt)
                              }}
                              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 disabled:opacity-60"
                            >
                              {alt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <Link
                    href={registerHref(searchedName || name, state, entityType)}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 self-end rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 sm:self-start"
                  >
                    {status === "ok" ? "Register this name" : "Continue"}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
