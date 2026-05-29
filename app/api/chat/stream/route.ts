import { NextRequest } from "next/server"
import { AI_CFO_SYSTEM_PROMPT, FINNA_SYSTEM_PROMPT } from "@/lib/finna-prompts"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

type ChatMessage = { role: "user" | "assistant"; content: string }

function systemPromptForAgent(agentId: unknown) {
  if (agentId === "ai-cfo") return AI_CFO_SYSTEM_PROMPT
  return FINNA_SYSTEM_PROMPT
}

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return new Response("Missing GROQ_API_KEY", { status: 503 })
  }

  const body = (await request.json()) as {
    agentId?: string
    messages?: ChatMessage[]
  }
  const messages = body.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages is required", { status: 400 })
  }

  const systemPrompt = systemPromptForAgent(body.agentId)

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.6,
      stream: true,
    }),
  })

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "")
    console.error("Groq stream error:", res.status, errText)
    return new Response("Upstream error", { status: 502 })
  }

  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  let buffer = ""

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = res.body!.getReader()
      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith("data:")) continue
            const data = trimmed.slice(5).trim()
            if (!data) continue
            if (data === "[DONE]") {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data) as any
              const delta = json?.choices?.[0]?.delta?.content
              if (typeof delta === "string" && delta.length) {
                controller.enqueue(encoder.encode(delta))
              }
            } catch {
              // ignore parse errors from partial lines
            }
          }
        }
      } catch (e) {
        console.error("Groq stream read error:", e)
        controller.error(e)
      } finally {
        reader.releaseLock()
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}

