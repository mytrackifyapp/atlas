"use client"

import Link from "next/link"
import { ExternalLink, ImageIcon, Loader2 } from "lucide-react"

import { SOCIAL_DRAFTS_PATH } from "@/lib/social/marketer-chat-intent"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  variant: "generating" | "ready"
  className?: string
  onViewDrafts?: () => void
}

export function MarketerSocialCta({ variant, className, onViewDrafts }: Props) {
  const isGenerating = variant === "generating"

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border px-4 py-3 text-sm",
        isGenerating
          ? "border-primary/25 bg-primary/5"
          : "border-emerald-500/30 bg-emerald-500/5",
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {isGenerating ? (
          <Loader2 className="h-4 w-4 shrink-0 mt-0.5 animate-spin text-primary" />
        ) : (
          <ImageIcon className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        )}
        <div className="min-w-0">
          <p className="font-medium">
            {isGenerating
              ? "Your content is generating…"
              : "Your draft is ready to review"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isGenerating
              ? "Branded caption + PNG are being created. You can open Social to preview when ready."
              : "Open Social to preview the graphic, edit fields, or publish to LinkedIn."}
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        variant={isGenerating ? "outline" : "default"}
        className="shrink-0"
        onClick={onViewDrafts}
      >
        <Link href={SOCIAL_DRAFTS_PATH}>
          {isGenerating ? "Open Social" : "View drafts"}
          <ExternalLink className="h-3.5 w-3.5 ml-2" />
        </Link>
      </Button>
    </div>
  )
}
