import { NextRequest, NextResponse } from "next/server"
import { AI_CFO_SYSTEM_PROMPT, FINNA_SYSTEM_PROMPT } from "@/lib/finna-prompts"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export type ChatMessage = { role: "user" | "assistant"; content: string }

function systemPromptForAgent(agentId: unknown) {
  if (agentId === "ai-cfo") return AI_CFO_SYSTEM_PROMPT
  return FINNA_SYSTEM_PROMPT
}

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
    const agentId = body.agentId as string | undefined
    const messages = body.messages as ChatMessage[] | undefined
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Request must include a non-empty messages array." },
        { status: 400 }
      )
    }

    const systemPrompt = systemPromptForAgent(agentId)
    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
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
