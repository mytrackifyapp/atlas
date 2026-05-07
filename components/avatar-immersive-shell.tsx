"use client"

import { useEffect, useRef, useState } from "react"
import { Fullscreen, Maximize2, Minimize2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  /** Shown in the immersive top bar (e.g. agent name). */
  title: string
  /** Extra controls shown in the top bar only while expanded (e.g. End session). */
  immersiveToolbar?: React.ReactNode
}

/**
 * Inline avatar + optional immersive overlay (fills viewport) + browser fullscreen on the overlay root.
 * Uses one DOM subtree — iframe/audio stay mounted when expanding (no session loss).
 */
export function AvatarImmersiveShell({ children, title, immersiveToolbar }: Props) {
  const [immersive, setImmersive] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (immersive) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [immersive])

  useEffect(() => {
    if (!immersive && document.fullscreenElement && shellRef.current?.contains(document.fullscreenElement)) {
      void document.exitFullscreen().catch(() => {})
    }
  }, [immersive])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && immersive) {
        setImmersive(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [immersive])

  async function toggleBrowserFullscreen() {
    const el = shellRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "relative transition-[border-radius,box-shadow] duration-200",
        immersive && "fixed inset-0 z-[200] flex flex-col bg-black text-white"
      )}
    >
      <div
        className={cn(
          immersive
            ? "flex w-full shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-black/95 px-3 py-2 sm:px-4"
            : "absolute left-2 top-2 z-10 flex items-center gap-1 sm:left-3 sm:top-3"
        )}
      >
        {immersive ? (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-white/95">
              {title}
            </span>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {immersiveToolbar ? (
                <div className="flex items-center">{immersiveToolbar}</div>
              ) : null}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  title="Exit expanded view"
                  aria-label="Exit expanded view"
                  onClick={() => setImmersive((v) => !v)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  title="Browser fullscreen"
                  aria-label="Browser fullscreen"
                  onClick={() => void toggleBrowserFullscreen()}
                >
                  <Fullscreen className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  title="Close"
                  aria-label="Close expanded view"
                  onClick={() => {
                    void document.exitFullscreen().catch(() => {})
                    setImmersive(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8 shadow-md border border-border/60 bg-background/95 backdrop-blur-sm"
            title="Expand — focus on avatar"
            aria-label="Expand avatar view"
            onClick={() => setImmersive(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          immersive
            ? "flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6"
            : "relative pt-0"
        )}
      >
        <div
          className={cn(
            "w-full",
            immersive &&
              "flex h-full max-h-[calc(100vh-52px)] w-full max-w-[min(1600px,100vw-1.5rem)] flex-col items-stretch justify-center sm:max-h-[calc(100vh-56px)] [&_iframe]:max-h-[min(85vh,calc(100vh-4rem))] [&_iframe]:min-h-[240px] [&_iframe]:w-full [&_iframe]:flex-1"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
