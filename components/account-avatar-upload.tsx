"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUploadThing } from "@/lib/uploadthing-client"
import { cn } from "@/lib/utils"

type Props = {
  name?: string | null
  image?: string | null
  onImageUpdated?: (url: string) => void
  className?: string
}

export function AccountAvatarUpload({ name, image, onImageUpdated, className }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localImage, setLocalImage] = useState<string | null>(image ?? null)

  useEffect(() => {
    setLocalImage(image ?? null)
  }, [image])

  const displayImage = localImage ?? image ?? null
  const initial = (name?.trim() || "U").charAt(0).toUpperCase()

  async function saveImage(url: string) {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: url }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to save profile photo")
    setLocalImage(url)
    onImageUpdated?.(url)
    toast.success("Profile photo updated")
  }

  const { startUpload, isUploading } = useUploadThing("companyLogo", {
    onClientUploadComplete: async (res) => {
      const url = res?.[0]?.url
      if (!url) return
      try {
        await saveImage(url)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save profile photo")
      }
    },
    onUploadError: (error) => {
      const message =
        error.message?.toLowerCase().includes("size")
          ? "Image is too large. Max 4MB."
          : error.message || "Failed to upload photo"
      toast.error(message)
    },
  })

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files?.length) return
    await startUpload(Array.from(files))
    event.target.value = ""
  }

  function openPicker() {
    if (!isUploading) fileInputRef.current?.click()
  }

  return (
    <div className={cn("group relative shrink-0", className)}>
      <button
        type="button"
        onClick={openPicker}
        disabled={isUploading}
        aria-label="Upload profile photo"
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1ff72] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900",
          isUploading ? "cursor-wait" : "cursor-pointer",
        )}
      >
        <Avatar className="h-16 w-16 border-2 border-neutral-200/90 shadow-sm transition-opacity group-hover:opacity-90 dark:border-neutral-700">
          <AvatarImage src={displayImage || undefined} alt={name || "Profile"} className="object-cover" />
          <AvatarFallback className="bg-neutral-100 text-xl font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            {initial}
          </AvatarFallback>
        </Avatar>

        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full bg-black/0 transition-colors",
            !isUploading && "group-hover:bg-black/25",
          )}
        />

        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full",
            "bg-neutral-950 text-white shadow-md ring-[2.5px] ring-white dark:bg-[#c1ff72] dark:text-neutral-950 dark:ring-neutral-900",
            "transition-transform group-hover:scale-105",
          )}
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => void handleFileChange(e)}
      />
    </div>
  )
}
