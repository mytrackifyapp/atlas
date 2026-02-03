import { NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const FINNA_SYSTEM_PROMPT = `You are Finna, the AI assistant for Trackify Atlas—a platform for investors and founders in the African startup ecosystem.

Your role:
- Help users understand Trackify Atlas: portfolio analytics, deal flow, fundraising tools, and market intelligence.
- Answer questions about features for investors (portfolio tracking, deal scoring, pipeline management) and founders (investor pipeline, data room, fundraising tracker, cap table, metrics).
- Provide concise, friendly, and accurate answers. If you don't know something specific about their data or product, say so and suggest they check the dashboard or docs.
- Keep responses focused and not overly long unless the user asks for detail.
- You can suggest next steps (e.g. "Try the Portfolio view" or "Check out the Fundraising Tracker") when relevant.`

export type ChatMessage = { role: "user" | "assistant"; content: string }

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Finna AI is not configured. Add GROQ_API_KEY to your environment." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const messages = body.messages as ChatMessage[] | undefined
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Request must include a non-empty messages array." },
        { status: 400 }
      )
    }

    const groqMessages = [
      { role: "system" as const, content: FINNA_SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ]

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.6,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Groq API error:", res.status, errText)
      return NextResponse.json(
        { error: "Finna is temporarily unavailable. Please try again." },
        { status: 502 }
      )
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content =
      data.choices?.[0]?.message?.content?.trim() ??
      "I couldn't generate a response. Please try again."

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
