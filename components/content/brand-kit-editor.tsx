"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, Loader2, Upload, X } from "lucide-react"
import { UploadButton } from "@uploadthing/react"

import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type BrandKitValues = {
  companyName: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const COLOR_FIELDS = [
  { key: "primaryColor", label: "Primary" },
  { key: "secondaryColor", label: "Secondary" },
  { key: "accentColor", label: "Accent" },
] as const

function snapshot(brand: BrandKitValues) {
  return JSON.stringify({
    companyName: brand.companyName.trim(),
    logoUrl: brand.logoUrl ?? "",
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    accentColor: brand.accentColor,
  })
}

export function BrandKitEditor({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const [brand, setBrand] = useState<BrandKitValues | null>(null)
  const [initialSnapshot, setInitialSnapshot] = useState("")
  const [pexelsConfigured, setPexelsConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/social/brand-kit", { cache: "no-store" })
      const data = (await res.json()) as {
        brand?: BrandKitValues
        pexelsConfigured?: boolean
        error?: string
      }
      if (!res.ok || !data.brand) throw new Error(data.error ?? "Failed to load brand kit")
      setBrand(data.brand)
      setInitialSnapshot(snapshot(data.brand))
      setPexelsConfigured(Boolean(data.pexelsConfigured))
      setSaved(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load brand kit")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const hasChanges = useMemo(
    () => (brand ? snapshot(brand) !== initialSnapshot : false),
    [brand, initialSnapshot],
  )

  const filledCount = useMemo(() => {
    if (!brand) return 0
    return (brand.companyName.trim() ? 1 : 0) + (brand.logoUrl ? 1 : 0)
  }, [brand])

  const persist = async (payload: BrandKitValues & { logoUrl?: string | null }) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/social/brand-kit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { brand?: BrandKitValues; error?: string }
      if (!res.ok || !data.brand) throw new Error(data.error ?? "Failed to save brand kit")
      setBrand(data.brand)
      setInitialSnapshot(snapshot(data.brand))
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save brand kit")
    } finally {
      setSaving(false)
    }
  }

  const update = (patch: Partial<BrandKitValues>) => {
    setBrand((prev) => (prev ? { ...prev, ...patch } : prev))
    setSaved(false)
  }

  const handleLogoUploadComplete = (res: { url: string }[]) => {
    setLogoUploading(false)
    if (!res[0]?.url || !brand) return
    void persist({ ...brand, logoUrl: res[0].url })
  }

  const removeLogo = () => {
    if (!brand) return
    void persist({ ...brand, logoUrl: null })
  }

  if (loading) {
    return (
      <div className={cn("flex min-h-0 flex-1 flex-col animate-pulse gap-4", className)}>
        <div className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    )
  }

  if (!brand) {
    return (
      <p className={cn("py-6 text-xs text-neutral-500", className)}>
        {error ?? "Brand kit unavailable."}
      </p>
    )
  }

  const colorRows = (
    <div className={cn(compact ? "space-y-2" : "grid grid-cols-3 gap-2")}>
      {COLOR_FIELDS.map(({ key, label }) => (
        <div key={key} className={cn("space-y-1", compact && "flex items-center gap-2 space-y-0")}>
          <p
            className={cn(
              "text-[11px] font-medium text-neutral-600 dark:text-neutral-400",
              compact && "w-20 shrink-0",
            )}
          >
            {label}
          </p>
          <div className="flex min-w-0 flex-1 gap-1.5">
            <input
              type="color"
              value={brand[key]}
              onChange={(event) => update({ [key]: event.target.value })}
              className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700"
              aria-label={`${label} color`}
            />
            <Input
              value={brand[key]}
              onChange={(event) => update({ [key]: event.target.value })}
              className="h-9 font-mono text-xs"
            />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={cn(compact ? "flex min-h-0 flex-1 flex-col" : "space-y-3", className)}>
      {compact ? (
        <>
          <div className="relative mb-4 flex min-h-[4.25rem] items-center overflow-hidden rounded-xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white px-4 py-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-[#171717]">
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#c1ff72]/20 blur-2xl" />
            <div className="relative min-w-0">
              <p className="text-sm font-semibold leading-snug text-neutral-950 dark:text-white">
                Your brand kit
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                Logo and colors used on every social graphic.
              </p>
            </div>
          </div>
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="font-medium text-neutral-600 dark:text-neutral-400">
                {filledCount >= 2
                  ? "Brand kit ready"
                  : filledCount > 0
                    ? "Brand kit in progress"
                    : "Get started"}
              </span>
              <span className="tabular-nums text-neutral-500">{filledCount}/2 · name + logo</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  filledCount >= 2 ? "bg-[#c1ff72]" : "bg-neutral-400 dark:bg-neutral-500",
                )}
                style={{ width: `${Math.max((filledCount / 2) * 100, 4)}%` }}
              />
            </div>
          </div>
        </>
      ) : null}

      {error ? (
        <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      <div
        className={cn(
          "space-y-3",
          compact &&
            "min-h-0 flex-1 overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
            Company name
          </label>
          <Input
            value={brand.companyName}
            onChange={(event) => update({ companyName: event.target.value })}
            placeholder="Acme"
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
            Logo
          </label>
          {brand.logoUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logoUrl}
                alt="Company logo"
                className="h-12 w-12 rounded-lg border border-neutral-200 object-contain bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  Logo uploaded
                </p>
                <p className="text-[10px] text-neutral-500">Used on social graphics</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={removeLogo}
                disabled={logoUploading || saving}
                aria-label="Remove logo"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
          <UploadButton<OurFileRouter, "companyLogo">
            endpoint="companyLogo"
            onClientUploadComplete={handleLogoUploadComplete}
            onUploadError={(uploadError) => {
              console.error("Logo upload error:", uploadError)
              setLogoUploading(false)
              setError("Failed to upload logo. Use a PNG or JPG under 4MB.")
            }}
            onUploadBegin={() => {
              setError(null)
              setLogoUploading(true)
            }}
            className="ut-button:w-full ut-button:bg-transparent ut-button:text-neutral-700 ut-button:hover:bg-neutral-50 ut-button:rounded-xl ut-button:border ut-button:border-dashed ut-button:border-neutral-300 ut-button:dark:text-neutral-300 ut-button:dark:hover:bg-neutral-800 ut-button:dark:border-neutral-700"
            content={{
              button: ({ ready }) => (
                <div className="flex w-full items-center justify-center gap-2 px-3 py-2.5">
                  {logoUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  ) : (
                    <Upload className="h-4 w-4 text-neutral-400" />
                  )}
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {!ready
                      ? "Preparing upload…"
                      : logoUploading
                        ? "Uploading…"
                        : brand.logoUrl
                          ? "Replace logo"
                          : "Upload logo"}
                  </span>
                </div>
              ),
              allowedContent: "PNG or JPG up to 4MB",
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
            Colors
          </label>
          <div className="rounded-xl border border-neutral-200/80 bg-white px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900/60">
            {colorRows}
          </div>
        </div>

        {!compact && !pexelsConfigured ? (
          <p className="text-[11px] leading-relaxed text-neutral-500">
            Add <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">PEXELS_API_KEY</code>{" "}
            for stock photo backgrounds on editorial templates.
          </p>
        ) : null}
      </div>

      <div className="mt-4 shrink-0 space-y-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        {hasChanges && !saving ? (
          <p className="text-center text-[10px] font-medium text-amber-600 dark:text-amber-400">
            Unsaved changes
          </p>
        ) : saved ? (
          <p className="text-center text-[10px] font-medium text-[#5a8f1e] dark:text-[#c1ff72]">
            Brand kit saved — used on every graphic
          </p>
        ) : null}

        <Button
          type="button"
          className={cn(
            "h-10 w-full rounded-xl font-semibold transition-colors",
            compact && hasChanges
              ? "bg-[#c1ff72] text-neutral-950 hover:bg-[#b4f25f]"
              : undefined,
          )}
          disabled={saving || logoUploading || !hasChanges}
          onClick={() => void persist(brand)}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : saved && !hasChanges ? (
            <>
              <Check className="mr-2 h-3.5 w-3.5" />
              Saved
            </>
          ) : (
            "Save brand kit"
          )}
        </Button>
      </div>
    </div>
  )
}
