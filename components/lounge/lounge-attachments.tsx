"use client"

import { FileText, Link2, X } from "lucide-react"

import { hostnameOf } from "@/lib/lounge/attachments"
import type { LoungeAttachment } from "@/lib/lounge/types"
import { cn } from "@/lib/utils"

function formatSize(bytes?: number) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function LoungeAttachmentPreviews({
  attachments,
  onRemove,
}: {
  attachments: LoungeAttachment[]
  onRemove?: (id: string) => void
}) {
  if (attachments.length === 0) return null

  const images = attachments.filter((item) => item.kind === "image")
  const rest = attachments.filter((item) => item.kind !== "image")

  return (
    <div className="space-y-2">
      {images.length > 0 ? (
        <div className={cn("grid gap-2", images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {images.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.name} className="max-h-56 w-full object-cover" />
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
                  <span className="sr-only">Open image</span>
                </a>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {rest.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-neutral-900">
            {item.kind === "link" ? (
              <Link2 className="h-4 w-4 text-neutral-500" />
            ) : (
              <FileText className="h-4 w-4 text-neutral-500" />
            )}
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 hover:underline"
          >
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{item.name}</p>
            <p className="truncate text-[11px] text-neutral-500">
              {item.kind === "link"
                ? hostnameOf(item.url)
                : [formatSize(item.sizeBytes), "PDF / file"].filter(Boolean).join(" · ")}
            </p>
          </a>
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-full p-1 text-neutral-400 hover:text-neutral-700"
              aria-label={`Remove ${item.name}`}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
