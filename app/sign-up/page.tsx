"use client"

import { useState } from "react"
import Link from "next/link"
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

export default function SignUpPage() {
  const [name, setName] = useState("")
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
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        setError(result.error.message || "Failed to sign up")
      } else {
        window.location.href = "/onboarding"
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      description="Enter your personal data to create your account."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-[#c1ff72] hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <AuthError message={error} /> : null}

        <div className="space-y-2">
          <Label htmlFor="name" className={authLabelClass}>
            Full name<span className="text-neutral-600">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Amanda Oliver"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className={authInputClass}
            autoComplete="name"
          />
        </div>

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
          <Label htmlFor="password" className={authLabelClass}>
            Password<span className="text-neutral-600">*</span>
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
          <p className="text-xs text-neutral-600">
            Password must be at least 8 characters long and include a special character.
          </p>
        </div>

        <Button type="submit" className={authButtonClass} disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  )
}
