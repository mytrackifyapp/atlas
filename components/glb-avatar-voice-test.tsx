"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Volume2 } from "lucide-react"

import type { GlbModelInfo } from "@/components/glb-avatar-canvas"
import { GlbAvatarCanvas } from "@/components/glb-avatar-canvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  url: string
}

type VoiceOption = { id: string; name: string; category: string }

export function GlbAvatarVoiceTest({ url }: Props) {
  const [text, setText] = useState("Hello. I am your AI agent.")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mouth, setMouth] = useState(0)
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [voiceId, setVoiceId] = useState<string>("")
  const [modelInfo, setModelInfo] = useState<GlbModelInfo | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)

  const safeText = useMemo(() => text.trim(), [text])
  const onModelInfo = useCallback((info: GlbModelInfo) => setModelInfo(info), [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/voice/voices")
      .then(async (r) => {
        const j = (await r.json().catch(() => null)) as
          | { voices?: VoiceOption[]; recommended?: VoiceOption[]; error?: string; details?: string }
          | null
        if (!r.ok) {
          throw new Error([j?.error, j?.details].filter(Boolean).join(" — ") || "Failed to load voices")
        }
        const rec = j?.recommended ?? j?.voices ?? []
        if (!cancelled) {
          setVoices(rec)
          setVoiceId(rec[0]?.id ?? "")
        }
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load voices")
      })
    return () => {
      cancelled = true
    }
  }, [])

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

  async function speak() {
    if (!safeText || busy) return

    setBusy(true)
    setError(null)
    setMouth(0)

    if (!voiceId) {
      setBusy(false)
      setError(
        "No usable ElevenLabs voice selected. Create/own a voice in ElevenLabs or set ELEVENLABS_DEFAULT_VOICE_ID."
      )
      return
    }

    // Stop any current playback
    audioRef.current?.pause()
    audioRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: safeText, voiceId }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(
          json?.details
            ? `${json?.error ?? "Voice synthesis failed"} — ${json.details}`
            : json?.error ?? "Voice synthesis failed"
        )
      }

      const buf = await res.arrayBuffer()
      const blob = new Blob([buf], { type: "audio/mpeg" })
      const audioUrl = URL.createObjectURL(blob)

      const audio = new Audio(audioUrl)
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
        setBusy(false)
        setMouth(0)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        URL.revokeObjectURL(audioUrl)
      }

      await audioCtx.resume()
      await audio.play()
      tick()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Voice failed"
      setError(msg.includes("NotAllowedError") ? "Click Speak once to enable audio." : msg)
      setBusy(false)
      setMouth(0)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something to speak…"
          disabled={busy}
        />
        <Button type="button" onClick={speak} disabled={!safeText || busy} className="shrink-0">
          <Volume2 className="h-4 w-4 mr-2" />
          {busy ? "Speaking…" : "Speak"}
        </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-muted-foreground">Voice</div>
          <Select value={voiceId} onValueChange={setVoiceId} disabled={busy || voices.length === 0}>
            <SelectTrigger className="min-w-[240px]" size="sm">
              <SelectValue placeholder={voices.length ? "Choose a voice…" : "No voices available"} />
            </SelectTrigger>
            <SelectContent>
              {voices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} <span className="text-muted-foreground text-xs">({v.category})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error ? <div className="text-xs text-destructive">{error}</div> : null}
      <GlbAvatarCanvas url={url} mouth={mouth} onModelInfo={onModelInfo} />
      {modelInfo ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground space-y-1">
          <div className="font-medium text-foreground">Model rig debug</div>
          <div>
            Mouth morph matches:{" "}
            <span className="font-mono">
              {modelInfo.mouthMorphMatches.length ? modelInfo.mouthMorphMatches.join(", ") : "none"}
            </span>
          </div>
          <div>
            Jaw nodes:{" "}
            <span className="font-mono">
              {modelInfo.jawNodeNames.length ? modelInfo.jawNodeNames.join(", ") : "none"}
            </span>
          </div>
          <div>
            Total morph targets:{" "}
            <span className="font-mono">{modelInfo.morphTargetNames.length}</span>
          </div>
        </div>
      ) : null}
      <div className="text-xs text-muted-foreground">
        This is RMS-driven “mouth open”. Next step is mapping visemes to your model’s specific morph
        target names for cleaner lip-sync.
      </div>
    </div>
  )
}

