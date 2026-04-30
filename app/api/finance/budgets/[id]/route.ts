import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const body = await request.json()
    const update: Record<string, unknown> = { updatedAt: new Date() }
    if (body?.month != null) update.month = body.month
    if (body?.category != null) update.category = body.category
    if (body?.limit != null) update.limit = body.limit
    if (body?.currency != null) update.currency = body.currency

    const db = await getDatabase()
    const result = await db.collection("finance_budgets").findOneAndUpdate(
      { _id: new ObjectId(id), ownerId: session.user.id },
      { $set: update },
      { returnDocument: "after" },
    )
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const b: any = result
    return NextResponse.json({
      budget: {
        id: b._id.toString(),
        workspaceId: b.workspaceId,
        month: b.month,
        category: b.category,
        limit: b.limit,
        currency: b.currency,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      },
    })
  } catch (error) {
    console.error("finance budgets PATCH error:", error)
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const db = await getDatabase()
    const res = await db.collection("finance_budgets").deleteOne({
      _id: new ObjectId(id),
      ownerId: session.user.id,
    })
    if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("finance budgets DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 })
  }
}

