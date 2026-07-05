"use client"

import Image from "next/image"
import { UploadButton } from "@uploadthing/react"
import { ImageIcon, X } from "lucide-react"
import { toast } from "sonner"

import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  description?: string
  value: string | null
  onChange: (url: string | null) => void
  variant?: "logo" | "cover" | "avatar"
}

export function FundraiseImageUpload({
  label,
  description,
  value,
  onChange,
  variant = "logo",
}: Props) {
  const isLogo = variant === "logo"
  const isAvatar = variant === "avatar"

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}

      {value ? (
        <div className="relative overflow-hidden rounded-2xl border bg-muted/30">
          <div
            className={cn(
              "relative w-full bg-neutral-100 dark:bg-neutral-900",
              isAvatar && "aspect-square max-w-[120px] rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700",
              isLogo && "aspect-square max-w-[140px] rounded-2xl",
              !isLogo && !isAvatar && "aspect-[21/9] rounded-2xl",
            )}
          >
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full shadow-sm"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-8 dark:border-neutral-700 dark:bg-neutral-950/50",
            isLogo || isAvatar ? "max-w-[200px]" : "w-full",
            isAvatar && "rounded-full max-w-[140px]",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200/80 dark:bg-neutral-800">
            <ImageIcon className="h-5 w-5 text-neutral-500" />
          </div>
          <UploadButton<OurFileRouter, "companyLogo">
            endpoint="companyLogo"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) {
                onChange(res[0].url)
                toast.success(`${label} uploaded`)
              }
            }}
            onUploadError={(error) => {
              const message =
                error.message?.toLowerCase().includes("size")
                  ? "Image is too large. Max 4MB."
                  : error.message || `Failed to upload ${label.toLowerCase()}`
              toast.error(message)
            }}
            className="ut-button:rounded-full ut-button:bg-neutral-900 ut-button:px-4 ut-button:py-2 ut-button:text-sm ut-button:font-medium ut-button:text-white ut-button:hover:bg-neutral-800 dark:ut-button:bg-[#c1ff72] dark:ut-button:text-neutral-950"
            content={{
              button: ({ ready }) => (
                <span>
                  {ready
                    ? `Upload ${isAvatar ? "photo" : isLogo ? "logo" : "image"}`
                    : "Preparing..."}
                </span>
              ),
              allowedContent: "PNG, JPG, or WebP up to 4MB",
            }}
          />
        </div>
      )}
    </div>
  )
}
