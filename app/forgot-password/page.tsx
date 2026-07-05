"use client"

import { useState } from "react"
import Link from "next/link"

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
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot password?"
      description="Enter your email and we'll send you a link to reset your password."
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

        {success ? (
          <AuthSuccess
            message={`We've sent a password reset link to ${email}. Check your inbox and follow the instructions.`}
          />
        ) : (
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
        )}

        {!success ? (
          <Button type="submit" className={authButtonClass} disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        ) : (
          <Link href="/sign-in" className="block">
            <Button type="button" className={authButtonClass}>
              Back to sign in
            </Button>
          </Link>
        )}
      </form>
    </AuthLayout>
  )
}
