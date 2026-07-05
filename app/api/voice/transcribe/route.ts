import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

/** Groq Whisper fallback when browser speech recognition is unavailable. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Transcription is not configured. Add GROQ_API_KEY." },
        { status: 503 }
      )
    }

    const form = await request.formData()
    const file = form.get("file")
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    const upstream = new FormData()
    upstream.append("file", file, "audio.webm")
    upstream.append("model", process.env.GROQ_WHISPER_MODEL ?? "whisper-large-v3-turbo")
    upstream.append("response_format", "json")
    upstream.append("language", "en")

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Groq transcribe error:", res.status, errText)
      return NextResponse.json(
        { error: "Failed to transcribe audio", details: errText.slice(0, 500) },
        { status: 502 }
      )
    }

    const json = (await res.json()) as { text?: string }
    const text = (json.text ?? "").trim()
    if (!text) {
      return NextResponse.json({ error: "No speech detected" }, { status: 400 })
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Transcribe API error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
