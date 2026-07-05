import { after } from "next/server"

import { inngest } from "@/inngest/client"

function isInngestUnreachable(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  if (message.includes("fetch failed") || message.includes("econnrefused")) {
    return true
  }

  const cause = (error as Error & { cause?: unknown }).cause
  if (cause && typeof cause === "object" && "code" in cause) {
    return (cause as { code?: string }).code === "ECONNREFUSED"
  }

  return false
}

async function runInBackground(fallback: () => Promise<void>) {
  after(async () => {
    try {
      await fallback()
    } catch (error) {
      console.error("Background task failed:", error)
    }
  })
}

export async function sendInngestEventOrRunLocally(
  event: Parameters<typeof inngest.send>[0],
  fallback: () => Promise<void>
): Promise<"inngest" | "local"> {
  if (!process.env.INNGEST_EVENT_KEY) {
    await runInBackground(fallback)
    return "local"
  }

  try {
    await inngest.send(event)
    return "inngest"
  } catch (error) {
    if (!isInngestUnreachable(error)) {
      throw error
    }

    console.warn(
      "Inngest unreachable; running task in-process. For queued jobs locally, run: pnpm inngest:dev"
    )
    await runInBackground(fallback)
    return "local"
  }
}
