"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const errorParam = searchParams.get("error")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(errorParam === "INVALID_TOKEN" ? "Invalid or expired reset token" : "")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (errorParam === "INVALID_TOKEN") {
      setError("Invalid or expired reset token. Please request a new password reset link.")
    }
  }, [errorParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Missing reset token. Please use the link from your email.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    try {
      const result = await authClient.forgetPassword.resetPassword({
        newPassword: password,
        token,
      })

      if (result.error) {
        setError(result.error.message || "Failed to reset password")
      } else {
        router.push("/sign-in?reset=success")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!token && !errorParam) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-chart-2/5 p-12 xl:p-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
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
                Use the link from your email to set a new password.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Trackify Atlas.</p>
        </div>
        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 bg-background">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 w-full">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Card className="w-full max-w-md border-border/50 shadow-lg shadow-primary/5 rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 pb-2">
              <div className="flex justify-center mb-4">
                <img src="/images/logo.PNG" alt="Trackify Atlas" className="h-12 w-auto object-contain lg:hidden" />
              </div>
              <CardTitle className="text-2xl font-semibold text-center">Reset Password</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Missing reset token. Please use the link from your email.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Link href="/forgot-password" className="w-full">
                <Button className="w-full h-11 rounded-lg font-medium">Request new reset link</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
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
              Set a new password
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Choose a strong password to secure your account.
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
            <CardTitle className="text-2xl font-semibold text-center">Reset password</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your new password below
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
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                    className="h-11 pr-10 rounded-lg border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                    className="h-11 pr-10 rounded-lg border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={loading}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-medium"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
