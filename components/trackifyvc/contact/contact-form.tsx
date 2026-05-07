"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"

import Container from "@/components/trackifyvc/global/container"
import Wrapper from "@/components/trackifyvc/global/wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function TrackifyVcContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)

  const isSubmitting = status === "submitting"

  const buttonLabel = useMemo(() => {
    if (status === "submitting") return "Sending…"
    if (status === "success") return "Sent!"
    return "Submit"
  }, [status])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      subject: String(data.get("subject") ?? ""),
      workEmail: String(data.get("workEmail") ?? ""),
      message: String(data.get("message") ?? ""),
      company: String(data.get("company") ?? ""), // honeypot
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

  return (
    <div className="w-full pb-16 lg:pb-24">
      <Wrapper>
        <Container delay={0.1}>
          <div className="flex flex-col lg:items-center lg:justify-center">
            <h2 className="text-2xl lg:text-3xl font-semibold text-left lg:text-center">
              Contact Us
            </h2>
          </div>
        </Container>

        <Container delay={0.2}>
          <form
            onSubmit={onSubmit}
            className="max-w-3xl mx-auto w-full mt-10 space-y-4"
          >
            <input
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              name="company"
              className="hidden"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name*</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  className="bg-[#0A0A0A] border-border/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name*</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  className="bg-[#0A0A0A] border-border/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject*</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Type your subject here"
                className="bg-[#0A0A0A] border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEmail">Work Email*</Label>
              <Input
                id="workEmail"
                name="workEmail"
                type="email"
                placeholder="johndoe@example.com"
                className="bg-[#0A0A0A] border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">How can we help you?*</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Type your message here..."
                className="min-h-[150px] bg-[#0A0A0A] border-border/50 resize-none"
                required
              />
            </div>

            {status === "success" ? (
              <p className="text-sm text-primary">
                Thanks — we received your message. Check your inbox for a confirmation.
              </p>
            ) : null}

            {status === "error" ? (
              <p className="text-sm text-red-400">{error ?? "Failed to send message"}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {buttonLabel}
            </Button>
          </form>
        </Container>
      </Wrapper>
    </div>
  )
}

