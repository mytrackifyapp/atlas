"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  settingsHref: string
  agentsHubHref: string
}

export function CheckoutSuccess({ settingsHref, agentsHubHref }: Props) {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const kind = searchParams.get("kind") === "credits" ? "credits" : "subscription"
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!sessionId) {
      setStatus("error")
      setError("Missing checkout session.")
      return
    }

    let cancelled = false
    fetch(`/api/checkout/stripe/session?session_id=${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Could not confirm payment")
        if (cancelled) return
        setStatus("ok")
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setStatus("error")
        setError(err instanceof Error ? err.message : "Could not confirm payment")
      })

    return () => {
      cancelled = true
    }
  }, [sessionId])

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-400" />
        <p className="text-sm text-neutral-500">Confirming your payment…</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="text-xl font-semibold">We couldn’t confirm that payment</h1>
        <p className="text-sm text-neutral-500">{error}</p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/checkout">Back to checkout</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#c1ff72]/20">
        <Check className="h-7 w-7 text-[#5a8f1e]" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Payment confirmed</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {kind === "credits"
            ? "AI credits have been added to your balance."
            : "Your plan is active. AI credits have been refreshed for this billing period."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          asChild
          className="rounded-full bg-[#c1ff72] text-neutral-950 hover:bg-[#b4f25f]"
        >
          <Link href={settingsHref}>View settings</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={agentsHubHref}>Open AI hub</Link>
        </Button>
      </div>
    </div>
  )
}
