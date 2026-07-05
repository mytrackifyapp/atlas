import { NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

type ElevenLabsVoicesResponse = {
  voices?: Array<{
    voice_id: string
    name?: string
    category?: string
  }>
}

export async function GET() {
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

  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: {
      Accept: "application/json",
      "xi-api-key": apiKey,
    },
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    return NextResponse.json(
      { error: "Failed to list voices", details: errText.slice(0, 500) },
      { status: 502 }
    )
  }

  const json = (await res.json().catch(() => null)) as ElevenLabsVoicesResponse | null
  const voices = (json?.voices ?? [])
    .filter((v) => v.voice_id)
    .map((v) => ({
      id: v.voice_id,
      name: v.name ?? v.voice_id,
      category: v.category ?? "unknown",
    }))

  // Free accounts cannot use Voice Library voices via API.
  const recommended = voices.filter((v) => v.category !== "library")

  return NextResponse.json({ voices, recommended })
}

