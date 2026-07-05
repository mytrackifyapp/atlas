import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

// Minimal ElevenLabs TTS wrapper for MVP.
// Client: POST { text: string, voiceId?: string }

type ElevenLabsVoicesResponse = {
  voices?: Array<{
    voice_id: string
    name?: string
    category?: string
  }>
}

async function pickDefaultVoiceId(apiKey: string): Promise<string | null> {
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: {
      Accept: "application/json",
      "xi-api-key": apiKey,
    },
  })
  if (!res.ok) return null
  const json = (await res.json().catch(() => null)) as ElevenLabsVoicesResponse | null
  const voices = json?.voices ?? []
  const allowed = voices.filter((v) => v.voice_id && v.category !== "library")
  return allowed[0]?.voice_id ?? null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Voice is not configured. Add ELEVENLABS_API_KEY to your environment." },
        { status: 503 }
      )
    }

    const body = (await request.json()) as { text?: string; voiceId?: string }
    const text = (body.text ?? "").trim()
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const envVoiceId = (process.env.ELEVENLABS_DEFAULT_VOICE_ID ?? "").trim()
    const requestedVoiceId = (body.voiceId ?? "").trim()
    const voiceId = requestedVoiceId || envVoiceId || (await pickDefaultVoiceId(apiKey)) || ""
    if (!voiceId) {
      return NextResponse.json(
        {
          error: "No usable ElevenLabs voice found",
          details:
            "Set ELEVENLABS_DEFAULT_VOICE_ID to a voice you own (not a Voice Library voice), or pass voiceId from the client.",
        },
        { status: 400 }
      )
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("ElevenLabs error:", res.status, errText)
      return NextResponse.json(
        {
          error: "Failed to synthesize voice",
          details: errText.slice(0, 500),
        },
        { status: 502 }
      )
    }

    const arrayBuffer = await res.arrayBuffer()
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    })
  } catch (e) {
    console.error("Voice API error:", e)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

