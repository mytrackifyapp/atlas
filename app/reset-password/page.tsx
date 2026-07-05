"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import {
  AuthError,
  AuthLayout,
  authButtonClass,
  authInputClass,
  authLabelClass,
} from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [error, setError] = useState(
    errorParam === "INVALID_TOKEN" ? "Invalid or expired reset token" : "",
  )
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
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!token && !errorParam) {
    return (
      <AuthLayout
        title="Reset password"
        description="Missing reset token. Please use the link from your email."
        footer={
          <>
            Remember your password?{" "}
            <Link href="/sign-in" className="font-medium text-[#c1ff72] hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <Link href="/forgot-password" className="block">
          <Button type="button" className={authButtonClass}>
            Request new reset link
          </Button>
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset password"
      description="Enter your new password below."
      footer={
        <>
          Remember your password?{" "}
          <Link href="/sign-in" className="font-medium text-[#c1ff72] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <AuthError message={error} /> : null}

        <div className="space-y-2">
          <Label htmlFor="password" className={authLabelClass}>
            New password<span className="text-neutral-600">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
              className={`${authInputClass} pr-11`}
              autoComplete="new-password"
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
          <p className="text-xs text-neutral-600">At least 8 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className={authLabelClass}>
            Confirm password<span className="text-neutral-600">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
              className={`${authInputClass} pr-11`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 transition-colors hover:text-neutral-300"
              disabled={loading}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className={authButtonClass} disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-neutral-500">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
