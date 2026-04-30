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
  onSpeakDone?: (id: number) => void
  imageSrc?: string
  name?: string
}

export function TalkingAvatar({
  text,
  voiceId,
  autoSpeak = true,
  speakRequest,
  onSpeakDone,
  imageSrc,
  name = "AI Agent",
}: Props) {
  const [speaking, setSpeaking] = useState(false)
  const [mouth, setMouth] = useState(0)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastSpokenRef = useRef<string>("")

  const safeText = useMemo(() => text.trim(), [text])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      audioRef.current?.pause()
      audioRef.current = null
      audioCtxRef.current?.close().catch(() => {})
      audioCtxRef.current = null
    }
  }, [])

  async function speak(force?: { text?: string }) {
    const speakText = (force?.text ?? safeText).trim()
    if (!speakText) return

    // Stop any current playback
    audioRef.current?.pause()
    audioRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    setVoiceError(null)

    setSpeaking(true)
    setMouth(0)

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speakText, voiceId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(
          json?.details ? `${json?.error ?? "Voice synthesis failed"} — ${json.details}` : (json?.error ?? "Voice synthesis failed")
        )
      }

      const buf = await res.arrayBuffer()
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
        setSpeaking(false)
        setMouth(0)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        URL.revokeObjectURL(url)
        onSpeakDone?.(speakRequest?.id ?? -1)
      }

      // Browsers may block autoplay until user gesture.
      await audioCtx.resume()
      await audio.play()
      tick()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Voice failed"
      setVoiceError(
        msg.includes("NotAllowedError") ? "Click Speak once to enable audio." : msg
      )
      setSpeaking(false)
      setMouth(0)
      onSpeakDone?.(speakRequest?.id ?? -1)
    }
  }

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
    speak({ text: speakRequest.text })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakRequest?.id])

  return (
    <Card className="p-4 sm:p-6 border-border/50">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Avatar</div>
          <div className="text-xs text-muted-foreground">
            MVP mouth animation (audio-driven). Swap with a 3D model later.
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={speak} disabled={!safeText || speaking}>
          <Volume2 className="h-4 w-4 mr-2" />
          {speaking ? "Speaking…" : "Speak"}
        </Button>
      </div>
      {voiceError ? <div className="mt-3 text-xs text-destructive">{voiceError}</div> : null}

      <div className="mt-5 flex items-center justify-center">
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

