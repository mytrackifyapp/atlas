"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Building2, Check, Heart, Landmark, Loader2, MessageSquare, ThumbsUp } from "lucide-react"

import { FinanceSubnav } from "@/components/finance/finance-subnav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const FOUNDER_STATS = [
  { value: "USD", label: "Raise currency" },
  { value: "ACH", label: "Investor deposits" },
  { value: "Wire", label: "Capital in" },
]

const INVESTOR_STATS = [
  { value: "USD", label: "Investment currency" },
  { value: "ACH", label: "Capital to founders" },
  { value: "Wire", label: "Into the round" },
]

const FOUNDER_CHIPS = [
  { label: "Fundraising account", icon: Landmark },
  { label: "Investor ACH", icon: Building2 },
  { label: "Investor wires", icon: Check },
]

const INVESTOR_CHIPS = [
  { label: "Investment account", icon: Landmark },
  { label: "ACH to founders", icon: Building2 },
  { label: "Wires into rounds", icon: Check },
]

export function UsBankAccountView() {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()
  const isInvestor = session?.user.role === "investor" || pathname.startsWith("/dashboard/finance")
  const stats = isInvestor ? INVESTOR_STATS : FOUNDER_STATS
  const chips = isInvestor ? INVESTOR_CHIPS : FOUNDER_CHIPS
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [joined, setJoined] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/finance/us-account/waitlist")
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Failed to load")
        return data as { joined: boolean; email: string | null }
      })
      .then((data) => {
        if (cancelled) return
        setJoined(data.joined)
        if (data.email) setEmail(data.email)
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (session?.user.email) setEmail((current) => current || session.user.email)
  }, [session?.user.email])

  async function join() {
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/finance/us-account/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not join the waitlist")
      setJoined(true)
      if (data.email) setEmail(data.email)
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Could not join the waitlist")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold tracking-tight">US bank account</p>
        <FinanceSubnav />
      </div>

      <section className="overflow-hidden rounded-[28px] bg-white px-4 py-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-black/[0.04] dark:bg-[#141414] dark:ring-white/10 sm:px-8 sm:py-10">
        <Arc investing={isInvestor} />

        <div className="mt-2 flex items-end justify-center gap-8 sm:gap-14">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-[#1d4a38] sm:text-5xl dark:text-[#8fbfa4]">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-neutral-400 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <h1 className="mx-auto mt-8 max-w-md text-center text-2xl font-semibold tracking-tight text-[#1a1a1a] sm:text-[2rem] sm:leading-tight dark:text-white">
          {isInvestor ? "A US account for funding a raise" : "A US account for receiving your raise"}
        </h1>

        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          ) : joined ? (
            <div className="flex items-center gap-2 rounded-full border border-[#d7eadf] bg-[#f3faf6] px-4 py-2 text-sm text-[#1d4a38] dark:border-white/10 dark:bg-white/5 dark:text-[#8fbfa4]">
              <Check className="h-4 w-4" />
              You&apos;re on the waitlist. We&apos;ll email {email} when it opens.
            </div>
          ) : (
            <form
              className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center"
              onSubmit={(event) => {
                event.preventDefault()
                void join()
              }}
            >
              <Input
                type="email"
                required
                autoComplete="email"
                aria-label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="h-11 max-w-xs rounded-full bg-white px-4 dark:bg-[#171717]"
              />
              <Button type="submit" className="h-11 rounded-full px-5" disabled={submitting || !email.trim()}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join the waitlist"}
              </Button>
            </form>
          )}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {chips.map((chip) => (
              <li
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 dark:border-white/10 dark:bg-transparent dark:text-neutral-300"
              >
                <chip.icon className="h-3.5 w-3.5" />
                {chip.label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function Arc({ investing }: { investing?: boolean }) {
  return (
    <div className="relative mx-auto h-[260px] w-full max-w-3xl sm:h-[300px]">
      <svg viewBox="0 0 800 340" className="absolute inset-0 h-full w-full" aria-hidden>
        <ellipse cx="400" cy="430" rx="210" ry="200" fill="none" className="stroke-neutral-200 dark:stroke-white/10" strokeWidth="1.25" />
        <ellipse cx="400" cy="470" rx="310" ry="290" fill="none" className="stroke-neutral-200 dark:stroke-white/10" strokeWidth="1.25" />
        <ellipse cx="400" cy="520" rx="420" ry="390" fill="none" className="stroke-neutral-200 dark:stroke-white/10" strokeWidth="1.25" />
      </svg>

      <Pill className="left-[6%] top-[58%] hidden sm:inline-flex" tone="green">
        <Check className="h-3.5 w-3.5" />
        Coming soon
      </Pill>
      <Face src="/marketer.png" className="left-[16%] top-[74%]" />
      <Pill className="left-[30%] top-[46%]">
        <ThumbsUp className="h-3.5 w-3.5 text-amber-500" />
        ACH
      </Pill>
      <Pill className="left-[34%] top-[8%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cfo.png" alt="" className="h-6 w-6 rounded-full object-cover object-top" />
        {investing ? "Investing" : "Fundraising"}
      </Pill>
      <Face src="/lawyer.png" className="left-[46%] top-[24%] h-12 w-12" />
      <Pill className="left-[60%] top-[40%]">
        <Building2 className="h-3.5 w-3.5 text-neutral-500" />
      </Pill>
      <Pill className="right-[18%] top-[10%]">
        <Heart className="h-3.5 w-3.5 text-rose-500" />
        Wire
      </Pill>
      <Face src="/ops.png" className="right-[8%] top-[28%]" />
      <span className="absolute bottom-[18%] right-[22%] flex h-8 w-8 items-center justify-center rounded-full bg-[#d8f3e4] text-[#1d4a38]">
        <Check className="h-4 w-4" />
      </span>
      <Pill className="bottom-[8%] right-[4%] hidden sm:inline-flex">
        <MessageSquare className="h-3.5 w-3.5 text-neutral-500" />
        Notify
      </Pill>
    </div>
  )
}

function Face({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn(
        "absolute h-11 w-11 rounded-full object-cover object-top ring-2 ring-white dark:ring-[#141414]",
        className,
      )}
    />
  )
}

function Pill({
  children,
  className,
  tone = "white",
}: {
  children: React.ReactNode
  className?: string
  tone?: "white" | "green"
}) {
  return (
    <span
      className={cn(
        "absolute inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1",
        tone === "green"
          ? "bg-[#eef8f2] text-[#1d4a38] ring-[#d7eadf]"
          : "bg-white text-neutral-700 ring-black/[0.04] dark:bg-[#1c1c1c] dark:text-neutral-200 dark:ring-white/10",
        className,
      )}
    >
      {children}
    </span>
  )
}
