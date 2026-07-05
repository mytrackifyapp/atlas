import { NextResponse } from "next/server"

import {
  getAiCreditSnapshot,
  getAiSubscription,
  listRecentAiUsage,
} from "@/lib/ai-credits/service"
import { featureLabel } from "@/lib/ai-credits/pricing"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 20)))

    const [snapshot, subscription, recentUsage] = await Promise.all([
      getAiCreditSnapshot(session.user.id),
      getAiSubscription(session.user.id),
      listRecentAiUsage(session.user.id, limit),
    ])

    return NextResponse.json({
      credits: snapshot,
      subscription,
      recentUsage: recentUsage.map((row) => ({
        ...row,
        featureLabel: featureLabel(row.feature),
      })),
    })
  } catch (e) {
    console.error("AI credits GET error:", e)
    return NextResponse.json({ error: "Failed to load credits" }, { status: 500 })
  }
}
