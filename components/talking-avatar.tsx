"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Volume2 } from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Props = {
  text: string
  voiceId?: string
  autoSpeak?: boolean
  speakRequest?: { id: number; text: string } | null
  /** Increment to cancel in-flight speech (e.g. new user message). */
  speechEpoch?: number
  onSpeakDone?: (id: number) => void
  imageSrc?: string
  name?: string
  /** Hides manual replay controls when voice conversation handles playback. */
  embedded?: boolean
}

export function TalkingAvatar({
  text,
  voiceId,
  autoSpeak = true,
  speakRequest,
  speechEpoch = 0,
  onSpeakDone,
  imageSrc,
  name = "AI Agent",
  embedded = false,
}: Props) {
  const [speaking, setSpeaking] = useState(false)
  const [mouth, setMouth] = useState(0)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastSpokenRef = useRef<string>("")
  const speakGenerationRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const activeRequestIdRef = useRef<number | null>(null)
  const handledRequestIdRef = useRef<number | null>(null)

  const safeText = useMemo(() => text.trim(), [text])

  function stopPlayback() {
    abortRef.current?.abort()
    abortRef.current = null
    speakGenerationRef.current += 1
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    audioRef.current?.pause()
    audioRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    setSpeaking(false)
    setMouth(0)
  }

  useEffect(() => {
    return () => {
      stopPlayback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function speak(force?: { text?: string; requestId?: number }) {
    const speakText = (force?.text ?? safeText).trim()
    if (!speakText) return

    const generation = ++speakGenerationRef.current
    const requestId = force?.requestId ?? speakRequest?.id ?? null
    activeRequestIdRef.current = requestId

    stopPlayback()
    speakGenerationRef.current = generation

    const aborter = new AbortController()
    abortRef.current = aborter
    setVoiceError(null)
    setSpeaking(true)
    setMouth(0)

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speakText, voiceId }),
        signal: aborter.signal,
      })

      if (generation !== speakGenerationRef.current) return

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(
          json?.details ? `${json?.error ?? "Voice synthesis failed"} — ${json.details}` : (json?.error ?? "Voice synthesis failed")
        )
      }

      const buf = await res.arrayBuffer()
      if (generation !== speakGenerationRef.current) return

      const blob = new Blob([buf], { type: "audio/mpeg" })
      const url = URL.createObjectURL(blob)

      const audio = new Audio(url)
      audioRef.current = audio

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = audioCtx

      const source = audioCtx.createMediaElementSource(audio)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 1024
      const data = new Uint8Array(analyser.frequencyBinCount)

      source.connect(analyser)
      analyser.connect(audioCtx.destination)

      const tick = () => {
        if (generation !== speakGenerationRef.current) return
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length) // ~0..1
        const next = Math.min(1, Math.max(0, (rms - 0.02) * 14))
        setMouth(next)
        rafRef.current = requestAnimationFrame(tick)
      }

      audio.onended = () => {
        if (generation !== speakGenerationRef.current) {
          URL.revokeObjectURL(url)
          return
        }
        setSpeaking(false)
        setMouth(0)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        URL.revokeObjectURL(url)
        onSpeakDone?.(activeRequestIdRef.current ?? -1)
      }

      // Browsers may block autoplay until user gesture.
      await audioCtx.resume()
      if (generation !== speakGenerationRef.current) {
        URL.revokeObjectURL(url)
        return
      }
      await audio.play()
      tick()
    } catch (e) {
      if (aborter.signal.aborted || generation !== speakGenerationRef.current) return
      const msg = e instanceof Error ? e.message : "Voice failed"
      setVoiceError(
        msg.includes("NotAllowedError") ? "Click Speak once to enable audio." : msg
      )
      setSpeaking(false)
      setMouth(0)
      onSpeakDone?.(activeRequestIdRef.current ?? -1)
    }
  }

  useEffect(() => {
    if (!speechEpoch) return
    handledRequestIdRef.current = null
    stopPlayback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechEpoch])

  useEffect(() => {
    if (!autoSpeak) return
    if (!safeText) return
    if (speaking) return
    if (safeText === lastSpokenRef.current) return

    lastSpokenRef.current = safeText
    speak({ text: safeText })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpeak, safeText])

  useEffect(() => {
    if (!speakRequest) return
    if (handledRequestIdRef.current === speakRequest.id) return
    handledRequestIdRef.current = speakRequest.id
    speak({ text: speakRequest.text, requestId: speakRequest.id })

    return () => {
      abortRef.current?.abort()
      speakGenerationRef.current += 1
      handledRequestIdRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakRequest?.id])

  return (
    <Card className={cn("border-border/50", embedded ? "p-3 border-0 shadow-none bg-transparent" : "p-4 sm:p-6")}>
      {!embedded ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Avatar</div>
            <div className="text-xs text-muted-foreground">
              Lip-synced voice playback for agent responses.
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => speak()}
            disabled={!safeText || speaking}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            {speaking ? "Speaking…" : "Replay"}
          </Button>
        </div>
      ) : null}
      {voiceError ? <div className="mt-3 text-xs text-destructive">{voiceError}</div> : null}

      <div className={cn("flex items-center justify-center", embedded ? "mt-0" : "mt-5")}>
        <div className="relative h-40 w-40 rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="object-cover"
              sizes="160px"
              priority={imageSrc === "/cfo.png"}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_25%,hsl(var(--primary)/0.18),transparent_70%)]" />
          )}

          {/* speaking indicator */}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
            <div
              className={cn(
                "h-2.5 w-20 rounded-full bg-background/80 border border-border/60 backdrop-blur transition-[transform,opacity] duration-75 origin-center",
                speaking ? "opacity-100" : "opacity-60"
              )}
              style={{ transform: `scaleY(${0.35 + mouth * 1.9})` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

