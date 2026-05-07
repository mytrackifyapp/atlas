import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { AI_AGENTS_CATALOG } from "@/lib/ai-agents-catalog"

export const dynamic = "force-dynamic"

/**
 * Sandbox only allows this avatar (Wayne). Using other avatar IDs with `is_sandbox: true`
 * causes embeds to load but `/v1/sessions/start` returns 400 inside the iframe.
 * @see https://docs.liveavatar.com/docs/sandbox-mode
 */
const LIVEAVATAR_SANDBOX_AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a"

type EmbedResponse = {
  code?: number
  data?: {
    url?: string
    embed_id?: string
    script?: string
  }
  message?: string
}

async function fetchFirstContextId(apiKey: string): Promise<string | null> {
  const res = await fetch("https://api.liveavatar.com/v1/contexts?page=1&page_size=10", {
    headers: { "X-API-KEY": apiKey },
  })
  if (!res.ok) return null
  const json = (await res.json().catch(() => null)) as {
    data?: { results?: { id?: string }[] }
  } | null
  const id = json?.data?.results?.[0]?.id
  return typeof id === "string" ? id : null
}

async function createMinimalContext(apiKey: string): Promise<string | null> {
  const res = await fetch("https://api.liveavatar.com/v1/contexts", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Trackify (sandbox)",
      prompt: "You are a helpful, concise assistant for founders and finance questions.",
      opening_text: "Hi — how can I help you today?",
    }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    console.error("LiveAvatar create context:", res.status, t.slice(0, 500))
    return null
  }
  const json = (await res.json().catch(() => null)) as { data?: { id?: string } } | null
  const id = json?.data?.id
  return typeof id === "string" ? id : null
}

async function resolveContextForSandbox(
  apiKey: string,
  existingContextId: string | undefined
): Promise<string | null> {
  if (existingContextId) return existingContextId
  const fromList = await fetchFirstContextId(apiKey)
  if (fromList) return fromList
  return createMinimalContext(apiKey)
}

/**
 * Create a short-lived LiveAvatar embed session (server-side API key).
 * @see https://docs.liveavatar.com/api-reference/embeddings/create-embed-v2.md
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = process.env.LIVEAVATAR_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json(
        { error: "LiveAvatar is not configured (set LIVEAVATAR_API_KEY on the server)." },
        { status: 503 }
      )
    }

    const body = (await request.json().catch(() => ({}))) as { agentId?: string }
    const agent = body.agentId
      ? AI_AGENTS_CATALOG.find((a) => a.id === body.agentId)
      : undefined

    // Production defaults to billed sessions; set LIVEAVATAR_SANDBOX=true to force sandbox.
    const isSandbox =
      process.env.LIVEAVATAR_SANDBOX === "true" ||
      (process.env.LIVEAVATAR_SANDBOX !== "false" && process.env.NODE_ENV !== "production")

    let avatarId =
      agent?.liveAvatar?.avatarId?.trim() || process.env.LIVEAVATAR_AVATAR_ID?.trim()
    let contextId =
      agent?.liveAvatar?.contextId?.trim() || process.env.LIVEAVATAR_CONTEXT_ID?.trim()

    if (isSandbox) {
      // Sandbox: platform requires Wayne avatar; session start fails otherwise.
      avatarId = LIVEAVATAR_SANDBOX_AVATAR_ID
      contextId = (await resolveContextForSandbox(apiKey, contextId)) ?? ""
      if (!contextId) {
        return NextResponse.json(
          {
            error:
              "Could not use your LiveAvatar API key to list or create a context. Create a context at https://app.liveavatar.com (no custom avatar needed for sandbox) and set LIVEAVATAR_CONTEXT_ID, or verify your key at https://app.liveavatar.com/developers .",
          },
          { status: 502 }
        )
      }
    } else {
      if (!avatarId || !contextId) {
        return NextResponse.json(
          {
            error:
              "Set LIVEAVATAR_AVATAR_ID and LIVEAVATAR_CONTEXT_ID for production, or set LIVEAVATAR_SANDBOX=true to use free sandbox (Wayne avatar, ~1 min sessions).",
          },
          { status: 400 }
        )
      }
    }

    const res = await fetch("https://api.liveavatar.com/v2/embeddings", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        context_id: contextId,
        is_sandbox: isSandbox,
      }),
    })

    const json = (await res.json().catch(() => null)) as EmbedResponse | null
    if (!res.ok) {
      const msg =
        json?.message ||
        (typeof json === "object" && json !== null ? JSON.stringify(json) : "") ||
        res.statusText
      console.error("LiveAvatar embed error:", res.status, msg)
      return NextResponse.json(
        { error: "LiveAvatar API request failed", details: String(msg).slice(0, 500) },
        { status: 502 }
      )
    }

    const url = json?.data?.url
    if (!url) {
      return NextResponse.json(
        { error: "LiveAvatar returned no embed URL", raw: json },
        { status: 502 }
      )
    }

    return NextResponse.json({
      url,
      embedId: json.data?.embed_id,
      sandbox: isSandbox,
      sandboxWayneAvatar: isSandbox,
    })
  } catch (e) {
    console.error("liveavatar embed route:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500 }
    )
  }
}
