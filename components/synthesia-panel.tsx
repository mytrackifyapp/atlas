"use client"

import { ExternalLink } from "lucide-react"

import { AvatarImmersiveShell } from "@/components/avatar-immersive-shell"
import { synthesiaEmbedUrl, parseSynthesiaVideoRef } from "@/lib/synthesia-embed"

type Props = {
  /** Overrides `NEXT_PUBLIC_SYNTHESIA_VIDEO_ID` / agent catalog. */
  videoRef?: string | null
  immersiveTitle?: string
}

/**
 * Published Synthesia video embed (multilingual player in iframe).
 * Configure `NEXT_PUBLIC_SYNTHESIA_VIDEO_ID` or pass `videoRef` (id or full embed URL).
 * @see https://docs.synthesia.io/docs/video-player
 */
export function SynthesiaPanel({ videoRef, immersiveTitle = "Synthesia" }: Props) {
  const fromEnv = parseSynthesiaVideoRef(process.env.NEXT_PUBLIC_SYNTHESIA_VIDEO_ID)
  const fromProp = parseSynthesiaVideoRef(videoRef ?? undefined)
  const videoId = fromProp ?? fromEnv
  const lang = process.env.NEXT_PUBLIC_SYNTHESIA_LANGUAGE?.trim() || null

  if (!videoId) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground space-y-3">
        <p className="font-medium text-foreground">Synthesia embed</p>
        <p>
          Publish a video in{" "}
          <a
            href="https://www.synthesia.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline inline-flex items-center gap-1"
          >
            Synthesia <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
          , copy the video id or embed URL, then set{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_SYNTHESIA_VIDEO_ID</code>{" "}
          in <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> and restart the dev server.
          Optional: <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_SYNTHESIA_LANGUAGE</code>{" "}
          (e.g.{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">en</code>).
        </p>
      </div>
    )
  }

  const src = synthesiaEmbedUrl(videoId, lang)

  return (
    <AvatarImmersiveShell title={immersiveTitle}>
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-black shadow-lg"
        style={{ aspectRatio: "1920 / 1080" }}
      >
        <iframe
          src={src}
          title={immersiveTitle}
          loading="lazy"
          allowFullScreen
          allow="encrypted-media; fullscreen"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </AvatarImmersiveShell>
  )
}
