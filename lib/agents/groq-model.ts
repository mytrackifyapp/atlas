import { groq } from "@ai-sdk/groq"
import { generateText, streamText, type StreamTextResult } from "ai"

export const GROQ_PRIMARY_MODEL =
  process.env.GROQ_MODEL ?? "openai/gpt-oss-120b"

export const GROQ_FALLBACK_MODEL =
  process.env.GROQ_FALLBACK_MODEL ?? "openai/gpt-oss-20b"

const GROQ_MAX_RETRIES = 0

export function getDefaultGroqModel(): string {
  return GROQ_PRIMARY_MODEL
}

export function softenEmDashes(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s+--\s+/g, ", ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,+/g, ",")
}

export function extractGeneratedText(result: {
  text?: string
  reasoningText?: string
}): string {
  const text = typeof result.text === "string" ? result.text.trim() : ""
  const raw = text || (typeof result.reasoningText === "string" ? result.reasoningText.trim() : "")
  return softenEmDashes(raw)
}

export function getGroqModelChain(preferredModel?: string): string[] {
  const primary = preferredModel?.trim() || GROQ_PRIMARY_MODEL
  const chain = [primary]
  if (GROQ_FALLBACK_MODEL && GROQ_FALLBACK_MODEL !== primary) {
    chain.push(GROQ_FALLBACK_MODEL)
  }
  return chain
}

function collectErrorText(error: unknown): string {
  if (!error || typeof error !== "object") return String(error ?? "")

  const parts: string[] = []
  const err = error as {
    message?: string
    statusCode?: number
    lastError?: { message?: string; statusCode?: number }
    errors?: Array<{ message?: string; statusCode?: number }>
  }

  if (err.message) parts.push(err.message)
  if (err.lastError?.message) parts.push(err.lastError.message)
  for (const nested of err.errors ?? []) {
    if (nested.message) parts.push(nested.message)
  }

  return parts.join(" ")
}

export function isGroqModelUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const err = error as {
    statusCode?: number
    lastError?: { statusCode?: number }
    errors?: Array<{ statusCode?: number }>
  }

  if (err.statusCode === 404) return true
  if (err.lastError?.statusCode === 404) return true
  if (err.errors?.some((e) => e.statusCode === 404)) return true

  const text = collectErrorText(error).toLowerCase()
  return text.includes("model_not_found") || text.includes("does not exist")
}

export function isGroqRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const err = error as {
    statusCode?: number
    lastError?: { statusCode?: number }
    errors?: Array<{ statusCode?: number }>
  }

  if (err.statusCode === 429) return true
  if (err.lastError?.statusCode === 429) return true
  if (err.errors?.some((e) => e.statusCode === 429)) return true

  const text = collectErrorText(error).toLowerCase()
  return text.includes("rate limit") || text.includes("rate_limit_exceeded")
}

export function formatGroqRateLimitMessage(error?: unknown): string {
  const text = collectErrorText(error)
  const waitMatch = text.match(/try again in (?:(\d+)m)?(\d+(?:\.\d+)?)s/i)
  if (waitMatch) {
    const minutes = waitMatch[1] ? parseInt(waitMatch[1], 10) : 0
    const seconds = Math.ceil(parseFloat(waitMatch[2] ?? "0"))
    const totalMinutes = minutes + Math.ceil(seconds / 60)
    return `Daily Groq token limit reached for the primary model. Try again in about ${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}, switch GROQ_MODEL to a smaller model in .env, or upgrade at https://console.groq.com/settings/billing`
  }

  return "Daily Groq token limit reached. Try again later, set GROQ_FALLBACK_MODEL=openai/gpt-oss-20b in .env, or upgrade your Groq plan."
}

export async function generateTextWithGroqFallback(
  options: Omit<Parameters<typeof generateText>[0], "model"> & {
    preferredModel?: string
  }
): Promise<Awaited<ReturnType<typeof generateText>> & { modelId: string }> {
  const { preferredModel, ...rest } = options
  const models = getGroqModelChain(preferredModel)
  let lastError: unknown

  for (let i = 0; i < models.length; i++) {
    const modelId = models[i]!
    try {
      const result = await generateText({
        ...rest,
        model: groq(modelId),
        maxRetries: GROQ_MAX_RETRIES,
        providerOptions: {
          ...rest.providerOptions,
          groq: {
            reasoningEffort: "low",
            ...(typeof rest.providerOptions?.groq === "object" ? rest.providerOptions.groq : {}),
          },
        },
      })
      if (i > 0) {
        console.warn(`Groq primary model rate limited; used fallback ${modelId}`)
      }
      return Object.assign(result, { modelId })
    } catch (error) {
      lastError = error
      if (
        !(isGroqRateLimitError(error) || isGroqModelUnavailableError(error)) ||
        i === models.length - 1
      ) {
        throw error
      }
      console.warn(`Groq ${modelId} failed, trying ${models[i + 1]}...`)
    }
  }

  throw lastError ?? new Error("Groq request failed")
}

export async function streamTextWithGroqFallback(
  options: Omit<Parameters<typeof streamText>[0], "model"> & {
    preferredModel?: string
  }
): Promise<{ result: StreamTextResult; modelId: string }> {
  const { preferredModel, ...rest } = options
  const models = getGroqModelChain(preferredModel)
  let lastError: unknown

  for (let i = 0; i < models.length; i++) {
    const modelId = models[i]!
    const result = streamText({
      ...rest,
      model: groq(modelId),
      maxRetries: GROQ_MAX_RETRIES,
      providerOptions: {
        ...rest.providerOptions,
        groq: {
          reasoningEffort: "low",
          ...(typeof rest.providerOptions?.groq === "object" ? rest.providerOptions.groq : {}),
        },
      },
    })

    try {
      await result.response
      if (i > 0) {
        console.warn(`Groq primary model rate limited; streaming with fallback ${modelId}`)
      }
      return { result, modelId }
    } catch (error) {
      lastError = error
      if (
        !(isGroqRateLimitError(error) || isGroqModelUnavailableError(error)) ||
        i === models.length - 1
      ) {
        throw error
      }
      console.warn(`Groq ${modelId} failed, trying ${models[i + 1]}...`)
    }
  }

  throw lastError ?? new Error("Groq stream failed")
}

export function groqRateLimitResponse(
  error: unknown,
  headers?: Record<string, string>
): Response {
  return new Response(formatGroqRateLimitMessage(error), {
    status: 429,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...headers,
    },
  })
}
