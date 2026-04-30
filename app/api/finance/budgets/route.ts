import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const workspaceId = request.nextUrl.searchParams.get("workspaceId")
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }

    const month = request.nextUrl.searchParams.get("month")

    const db = await getDatabase()
    const query: Record<string, unknown> = { ownerId: session.user.id, workspaceId }
    if (month) query.month = month

    const rows = await db.collection("finance_budgets").find(query).sort({ month: -1 }).toArray()

    return NextResponse.json({
      budgets: rows.map((b: any) => ({
        id: b._id.toString(),
        workspaceId: b.workspaceId,
        month: b.month,
        category: b.category,
        limit: b.limit,
        currency: b.currency,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
    })
  } catch (error) {
    console.error("finance budgets GET error:", error)
    return NextResponse.json({ error: "Failed to load budgets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const workspaceId = body?.workspaceId
    const month = body?.month
    const category = body?.category
    const limit = body?.limit

    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }
    if (!month || typeof month !== "string") {
      return NextResponse.json({ error: "month is required (YYYY-MM)" }, { status: 400 })
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "category is required" }, { status: 400 })
    }
    if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) {
      return NextResponse.json({ error: "limit must be a positive number" }, { status: 400 })
    }

    const doc = {
      ownerId: session.user.id,
      workspaceId,
      month,
      category: category.trim(),
      limit,
      currency: typeof body?.currency === "string" ? body.currency : "USD",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const db = await getDatabase()
    const res = await db.collection("finance_budgets").insertOne(doc)

    return NextResponse.json({ budget: { id: res.insertedId.toString(), ...doc } })
  } catch (error) {
    console.error("finance budgets POST error:", error)
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}

