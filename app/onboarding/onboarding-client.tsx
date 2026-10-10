"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"

import { FinnaOrb } from "@/components/finna-orb"
import { authClient } from "@/lib/auth-client"
import { safeInternalPath } from "@/lib/safe-redirect"

type UserRole = "investor" | "founder"

const QUESTION = "Are you a founder or an investor?"

function TypedQuestion() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setCount(QUESTION.length)
      return
    }
    if (count >= QUESTION.length) return
    const timer = window.setTimeout(() => setCount((value) => value + 1), 38)
    return () => window.clearTimeout(timer)
  }, [count])

  const done = count >= QUESTION.length

  return (
    <h1
      aria-label={QUESTION}
      className="min-h-[2.6em] text-[1.65rem] font-semibold tracking-tight text-[#1c1c1c]"
    >
      <span aria-hidden>
        {QUESTION.slice(0, count)}
        <span
          className={`ml-0.5 inline-block h-[1.05em] w-px translate-y-[0.12em] bg-[#1c1c1c] ${done ? "opacity-0" : "animate-pulse"}`}
        />
      </span>
    </h1>
  )
}

export function OnboardingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const continuePath = safeInternalPath(searchParams.get("redirect"), "")
  const { data: session, isPending } = authClient.useSession()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [error, setError] = useState("")

  // Wait until the session request finishes. A missing session while it is
  // still loading is not a signed-out user, and must not bounce a fresh
  // sign-up back to the login page.
  useEffect(() => {
    if (isPending || session?.user) return
    const next = continuePath
      ? `/onboarding?redirect=${encodeURIComponent(continuePath)}`
      : "/onboarding"
    router.replace(`/sign-in?redirect=${encodeURIComponent(next)}`)
  }, [isPending, session, router, continuePath])

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!session?.user) {
        setCheckingStatus(false)
        return
      }

      try {
        const response = await fetch("/api/user/check-onboarding")
        const data = await response.json()
        
        if (data.onboardingCompleted) {
          if (continuePath) {
            window.location.href = continuePath
            return
          }
          if (data.role === "founder") {
            window.location.href = "/founder"
            return
          } else {
            window.location.href = "/portfolio"
            return
          }
        }
      } catch (error) {
        // If error, continue with onboarding
        console.error("Error checking onboarding status:", error)
      } finally {
        setCheckingStatus(false)
      }
    }

    checkOnboardingStatus()
  }, [session, router, continuePath])

  // Show loading state while checking onboarding status or if no session
  if (isPending || checkingStatus || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5f2]">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    )
  }

  const handleSubmit = async (role: UserRole) => {
    setSelectedRole(role)

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/user/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Update role error:", data)
        throw new Error(data.error || "Failed to update role")
      }

      // Verify the update was successful
      if (!data.success) {
        console.error("Update role unsuccessful:", data)
        throw new Error("Role update was not successful")
      }

      console.log("Role updated successfully:", data)

      // Verify the update was actually saved by checking the database
      let verified = false
      let attempts = 0
      const maxAttempts = 5

      while (!verified && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        
        try {
          const verifyResponse = await fetch("/api/user/check-onboarding")
          const verifyData = await verifyResponse.json()
          
          if (verifyData.onboardingCompleted && verifyData.role === role) {
            verified = true
            console.log("Onboarding status verified:", verifyData)
            break
          }
        } catch (error) {
          console.error("Error verifying onboarding status:", error)
        }
        
        attempts++
      }

      if (!verified) {
        console.warn("Could not verify onboarding status, redirecting anyway")
      }

      // Use hard redirect to ensure server-side checks get fresh data
      // This forces a full page reload and fresh server-side session check
      const redirectPath = continuePath || (role === "investor" ? "/portfolio" : "/founder")
      window.location.href = redirectPath
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setLoading(false)
    }
  }

  const choices: { role: UserRole; label: string }[] = [
    { role: "founder", label: "Founder / startup" },
    { role: "investor", label: "Investor / VC / accelerator" },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f5f2] px-6">
      <div className="w-full max-w-md -translate-y-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
            <FinnaOrb size={20} />
          </span>
          <span className="text-sm font-medium text-[#c4a574]">Finna</span>
        </div>
        <TypedQuestion />

        <div className="mt-8 space-y-3">
          {choices.map((choice) => {
            const active = selectedRole === choice.role
            return (
              <button
                key={choice.role}
                type="button"
                disabled={loading}
                onClick={() => void handleSubmit(choice.role)}
                className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-left text-[15px] text-neutral-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-black/[0.04] transition hover:ring-black/10 disabled:opacity-70"
              >
                <span>{choice.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1c1c] text-white">
                  {loading && active ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  )
}

