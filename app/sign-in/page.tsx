"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import {
  AuthError,
  AuthLayout,
  AuthSuccess,
  authButtonClass,
  authInputClass,
  authLabelClass,
} from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

function SignInForm() {
  const searchParams = useSearchParams()
  const redirectToRaw =
    searchParams.get("redirect") || searchParams.get("next") || "/dashboard"
  const redirectTo =
    redirectToRaw.startsWith("/") && !redirectToRaw.startsWith("//")
      ? redirectToRaw
      : "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || "Failed to sign in")
      } else {
        window.location.href = redirectTo
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your email and password to access your account."
      headerExtra={
        searchParams.get("reset") === "success" ? (
          <AuthSuccess message="Password reset successful. You can now sign in with your new password." />
        ) : null
      }
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-[#c1ff72] hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <AuthError message={error} /> : null}

        <div className="space-y-2">
          <Label htmlFor="email" className={authLabelClass}>
            Email address<span className="text-neutral-600">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={authInputClass}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className={authLabelClass}>
              Password<span className="text-neutral-600">*</span>
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-neutral-500 transition-colors hover:text-[#c1ff72]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={`${authInputClass} pr-11`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 transition-colors hover:text-neutral-300"
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className={authButtonClass} disabled={loading}>
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-neutral-500">
          Loading...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}
