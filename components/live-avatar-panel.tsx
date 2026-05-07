"use client"

import { useState } from "react"

import { AvatarImmersiveShell } from "@/components/avatar-immersive-shell"
import { Button } from "@/components/ui/button"

type Props = {
  agentId: string
  /** Label for expanded / fullscreen bar */
  immersiveTitle?: string
}

/**
 * HeyGen LiveAvatar embed — conversation + video handled inside the iframe.
 * @see https://docs.liveavatar.com/
 */
export function LiveAvatarPanel({ agentId, immersiveTitle = "Live avatar" }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function start() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/liveavatar/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        error?: string
        details?: string
        url?: string
        sandbox?: boolean
        sandboxWayneAvatar?: boolean
      }
      if (!res.ok) {
        throw new Error(
          [json.error, json.details].filter(Boolean).join(": ") || "Failed to start LiveAvatar"
        )
      }
      if (!json.url) throw new Error("No embed URL returned")
      setUrl(json.url)
      if (json.sandboxWayneAvatar && typeof window !== "undefined") {
        console.info(
          "[LiveAvatar] Sandbox session uses the Wayne avatar per LiveAvatar docs; sessions are short and do not use credits."
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start")
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setUrl(null)
    setError(null)
  }

  return (
    <div className="space-y-3">
      {!url ? (
        <Button type="button" onClick={start} disabled={loading} className="w-full rounded-xl">
          {loading ? "Starting session…" : "Start live avatar"}
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={reset} className="w-full rounded-xl">
          End session / new embed
        </Button>
      )}

      {error ? (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : null}

      {url ? (
        <AvatarImmersiveShell
          title={immersiveTitle}
          immersiveToolbar={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 rounded-lg border-white/25 bg-white/5 text-xs text-white hover:bg-white/15"
              onClick={reset}
            >
              End session
            </Button>
          }
        >
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-black shadow-lg">
            <iframe
              src={url}
              className="aspect-video w-full min-h-[220px] border-0"
              allow="microphone; camera; autoplay; fullscreen; display-capture"
              title="LiveAvatar session"
            />
          </div>
        </AvatarImmersiveShell>
      ) : null}
    </div>
  )
}
