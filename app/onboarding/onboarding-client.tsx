"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Rocket, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"

type UserRole = "investor" | "founder"

export function OnboardingClient() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [error, setError] = useState("")

  // Redirect to sign-in if no session
  useEffect(() => {
    if (!session?.user) {
      router.push("/sign-in")
      return
    }
  }, [session, router])

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
          // Redirect based on role using hard redirect
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
  }, [session, router])

  // Show loading state while checking onboarding status or if no session
  if (checkingStatus || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-semibold">Trackify Atlas</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError("Please select a role")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/user/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
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
          
          if (verifyData.onboardingCompleted && verifyData.role === selectedRole) {
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
      const redirectPath = selectedRole === "investor" ? "/portfolio" : "/founder"
      console.log("Redirecting to:", redirectPath)
      window.location.href = redirectPath
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-semibold">Trackify Atlas</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome! Let's get you started</h1>
          <p className="text-lg text-muted-foreground">Choose your role to customize your experience</p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Investor Card */}
          <Card
            className={`cursor-pointer transition-all duration-200 ${
              selectedRole === "investor"
                ? "ring-2 ring-primary shadow-lg border-primary"
                : "hover:border-primary/50 hover:shadow-md"
            }`}
            onClick={() => setSelectedRole("investor")}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                {selectedRole === "investor" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">Investor / VC</CardTitle>
              <CardDescription className="text-base">
                Manage your portfolio, track deals, and analyze investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Portfolio management and analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Deal flow pipeline management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Investment tracking and reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Market insights and trends</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Founder Card */}
          <Card
            className={`cursor-pointer transition-all duration-200 ${
              selectedRole === "founder"
                ? "ring-2 ring-primary shadow-lg border-primary"
                : "hover:border-primary/50 hover:shadow-md"
            }`}
            onClick={() => setSelectedRole("founder")}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                {selectedRole === "founder" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">Founder / Startup</CardTitle>
              <CardDescription className="text-base">
                Track your fundraising, manage investors, and grow your startup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Fundraising pipeline management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Investor relationship tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Business metrics and KPIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Document and data room management</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedRole || loading}
            className="px-8 h-12 text-base"
          >
            {loading ? "Setting up your account..." : "Continue"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

