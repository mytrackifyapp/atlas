"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const result = await authClient.forgetPassword.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (result.error) {
        setError(result.error.message || "Failed to send reset email")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding (visible on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-chart-2/5 p-12 xl:p-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="space-y-8">
          <img src="/images/logo.PNG" alt="Trackify Atlas" className="h-14 w-auto object-contain" />
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground mb-3">
              Reset your password
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Enter your email and we&apos;ll send you a secure link to create a new password.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Trackify Atlas. All rights reserved.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 bg-background">
        <Link
          href="/"
          className="lg:hidden inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 w-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="w-full max-w-md border-border/50 shadow-lg shadow-primary/5 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex justify-center mb-4">
              <img src="/images/logo.PNG" alt="Trackify Atlas" className="h-12 w-auto object-contain lg:hidden" />
            </div>
            <CardTitle className="text-2xl font-semibold text-center">Forgot password?</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email and we&apos;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20"
                >
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 space-y-1">
                  <p className="font-medium">Check your email</p>
                  <p className="text-muted-foreground">
                    We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>. 
                    Check your inbox and follow the instructions.
                  </p>
                </div>
              )}
              {!success && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 rounded-lg border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
                    autoComplete="email"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              {!success && (
                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg font-medium"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              )}
              {success && (
                <Link href="/sign-in" className="w-full">
                  <Button className="w-full h-11 rounded-lg font-medium">
                    Back to sign in
                  </Button>
                </Link>
              )}
              <p className="text-sm text-center text-muted-foreground">
                Remember your password?{" "}
                <Link href="/sign-in" className="text-primary font-medium hover:underline focus:outline-none focus:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
