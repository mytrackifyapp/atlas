import { NextRequest } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const FINNA_SYSTEM_PROMPT = `You are Finna, the AI assistant for Trackify Atlas—a platform for investors and founders in the African startup ecosystem.

Your role:
- Help users understand Trackify Atlas: portfolio analytics, deal flow, fundraising tools, and market intelligence.
- Answer questions about features for investors (portfolio tracking, deal scoring, pipeline management) and founders (investor pipeline, data room, fundraising tracker, cap table, metrics).
- Provide concise, friendly, and accurate answers. If you don't know something specific about their data or product, say so and suggest they check the dashboard or docs.
- Keep responses focused and not overly long unless the user asks for detail.
- You can suggest next steps (e.g. "Try the Portfolio view" or "Check out the Fundraising Tracker") when relevant.`

const AI_CFO_SYSTEM_PROMPT = `You are the AI CFO for Trackify Atlas.

You help founders and operators make strong financial decisions with speed and clarity.

Your responsibilities:
- Explain cashflow, burn, runway, budgeting, unit economics, pricing, and financial planning in plain language.
- Provide structured outputs when helpful (tables, bullet plans, simple formulas).
- Ask 1-2 clarifying questions when necessary, but still give a best-effort answer with assumptions.
- Be practical and action-oriented. Keep answers concise unless the user asks for depth.

Constraints:
- You do NOT have access to the user's private financial data unless they provide it in the chat.
- Do not invent numbers. If you need data, ask for it and offer example templates.
`

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

