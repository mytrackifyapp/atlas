import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

function requireWorkspaceId(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId")
  if (!workspaceId) return null
  return workspaceId
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const workspaceId = requireWorkspaceId(request)
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }

    const accountId = request.nextUrl.searchParams.get("accountId")

    const db = await getDatabase()
    const rows = await db
      .collection("finance_transactions")
      .find({
        ownerId: session.user.id,
        workspaceId,
        ...(accountId ? { accountId } : {}),
      })
      .sort({ date: -1, createdAt: -1 })
      .limit(500)
      .toArray()

    return NextResponse.json({
      transactions: rows.map((t: any) => ({
        id: t._id.toString(),
        workspaceId: t.workspaceId,
        date: t.date,
        direction: t.direction,
        amount: t.amount,
        currency: t.currency,
        category: t.category,
        description: t.description,
        accountId: t.accountId ?? null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    })
  } catch (error) {
    console.error("finance transactions GET error:", error)
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const workspaceId = body?.workspaceId
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }

    const date = body?.date
    const direction = body?.direction
    const amount = body?.amount

    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "date is required" }, { status: 400 })
    }
    if (direction !== "income" && direction !== "expense") {
      return NextResponse.json({ error: "direction must be income|expense" }, { status: 400 })
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 })
    }

    const doc = {
      ownerId: session.user.id,
      workspaceId,
      date,
      direction,
      amount,
      currency: typeof body?.currency === "string" ? body.currency : "USD",
      category: typeof body?.category === "string" ? body.category : "Uncategorized",
      description: typeof body?.description === "string" ? body.description : "",
      accountId: typeof body?.accountId === "string" ? body.accountId : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const db = await getDatabase()
    const result = await db.collection("finance_transactions").insertOne(doc)

    return NextResponse.json({
      transaction: {
        id: result.insertedId.toString(),
        ...doc,
      },
    })
  } catch (error) {
    console.error("finance transactions POST error:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

