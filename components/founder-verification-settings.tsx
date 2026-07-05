"use client"

import { useCallback, useEffect, useState } from "react"
import { BadgeCheck, Loader2, Shield } from "lucide-react"
import { toast } from "sonner"

import { FounderSocialLinksInput } from "@/components/founder-social-links-input"
import { VerifiedBadge } from "@/components/verified-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  SOCIAL_PLATFORM_CONFIG,
  formatSocialLink,
  hasValidSocialLinks,
  type FounderSocialLink,
} from "@/lib/founder/social-platforms"

type VerificationForm = {
  fullName: string
  location: string
  phoneNumber: string
  socialLinks: FounderSocialLink[]
}

type VerificationRecord = VerificationForm & {
  verified: boolean
  submittedAt: string | null
  verifiedAt: string | null
}

type Props = {
  onVerified?: () => void
}

export function FounderVerificationSettings({ onVerified }: Props) {
  const [form, setForm] = useState<VerificationForm>({
    fullName: "",
    location: "",
    phoneNumber: "",
    socialLinks: [],
  })
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/verification", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load verification")
      const record = data.verification as VerificationRecord
      setForm({
        fullName: record.fullName ?? "",
        location: record.location ?? "",
        phoneNumber: record.phoneNumber ?? "",
        socialLinks: record.socialLinks ?? [],
      })
      setVerified(Boolean(record.verified))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load verification")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!hasValidSocialLinks(form.socialLinks)) {
      toast.error("Add at least one social profile")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/user/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit verification")
      setVerified(true)
      onVerified?.()
      toast.success("You're verified — badge is now live on your invest page")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit verification")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (verified) {
    return (
      <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 px-4 py-5 dark:border-sky-900 dark:bg-sky-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-neutral-950 dark:text-white">You&apos;re verified</p>
                <VerifiedBadge compact />
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Investors see your verified badge on your public invest page.
              </p>
            </div>
          </div>
        </div>
        <dl className="mt-4 grid gap-3 border-t border-sky-200/60 pt-4 text-sm dark:border-sky-900/60 sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Full name</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.fullName}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Location</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.location}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Phone</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.phoneNumber}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-neutral-500">Social profiles</dt>
            <dd className="mt-1 space-y-1">
              {form.socialLinks.map((link) => (
                <p key={link.platform} className="font-medium text-neutral-900 dark:text-neutral-100">
                  {SOCIAL_PLATFORM_CONFIG[link.platform].label}: {formatSocialLink(link)}
                </p>
              ))}
            </dd>
          </div>
        </dl>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/40">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Complete a short KYC check to earn a <strong className="font-medium text-neutral-800 dark:text-neutral-200">Verified</strong> badge on your invest page. This helps investors trust who they&apos;re backing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="kyc-fullName">Full legal name</Label>
          <Input
            id="kyc-fullName"
            placeholder="Jane Doe"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kyc-location">Location</Label>
          <Input
            id="kyc-location"
            placeholder="Lagos, Nigeria"
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kyc-phone">Phone number</Label>
          <Input
            id="kyc-phone"
            type="tel"
            placeholder="+1 555 000 0000"
            value={form.phoneNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <FounderSocialLinksInput
            value={form.socialLinks}
            onChange={(socialLinks) => setForm((prev) => ({ ...prev, socialLinks }))}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="rounded-full bg-[#c1ff72] font-semibold text-neutral-950 hover:bg-[#b4f25f]"
        disabled={saving}
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-2 h-4 w-4" />}
        Become verified
      </Button>
    </form>
  )
}
