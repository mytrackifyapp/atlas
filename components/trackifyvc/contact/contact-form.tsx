"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const TOPICS = ["Talk to sales", "Partnerships", "Support", "Press", "Something else"] as const

const fieldClass =
  "h-11 rounded-xl border-neutral-200 bg-white text-neutral-950 shadow-none placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-neutral-400/20"

export default function TrackifyVcContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("Talk to sales")

  const isSubmitting = status === "submitting"

  const buttonLabel = useMemo(() => {
    if (status === "submitting") return "Sending…"
    return "Send message"
  }, [status])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)
    const customSubject = String(data.get("customSubject") ?? "").trim()
    const subject = topic === "Something else" ? customSubject : topic

    const payload = {
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      subject,
      workEmail: String(data.get("workEmail") ?? ""),
      message: String(data.get("message") ?? ""),
      company: String(data.get("company") ?? ""),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || "Failed to send message")
      }

      setStatus("success")
      form.reset()
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Failed to send message")
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.75rem] border border-neutral-200 bg-neutral-50 px-6 py-16 text-center sm:px-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Message sent</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
          Thanks — we received your note. Check your inbox for a confirmation, and we&apos;ll reply within one business day.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-8 h-11 rounded-full border-neutral-200 px-6"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-[0_16px_48px_rgba(15,23,42,0.06)] sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight">How can we help?</h2>
      <p className="mt-1 text-sm text-neutral-500">Pick a topic and tell us a bit about what you need.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <input
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          name="company"
          className="hidden"
        />

        <fieldset>
          <legend className="mb-2.5 text-sm font-medium text-neutral-950">Topic</legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className={cn(
                  "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
                  topic === item
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        {topic === "Something else" ? (
          <div className="space-y-2">
            <Label htmlFor="customSubject">Subject</Label>
            <Input
              id="customSubject"
              name="customSubject"
              placeholder="What is this about?"
              className={fieldClass}
              required
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              placeholder="Ada"
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              placeholder="Mensah"
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="workEmail">Work email</Label>
          <Input
            id="workEmail"
            name="workEmail"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={fieldClass}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Tell us about your team, round, or what you'd like help with."
            className="min-h-[140px] rounded-xl border-neutral-200 bg-white text-neutral-950 shadow-none placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-neutral-400/20"
            required
          />
        </div>

        {status === "error" ? (
          <p role="alert" className="text-sm text-red-600">
            {error ?? "Couldn't send that. Try again, or email hey@mytrackify.com."}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-full bg-neutral-950 text-base font-semibold text-white hover:bg-neutral-800"
        >
          {buttonLabel}
          {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>
    </div>
  )
}
