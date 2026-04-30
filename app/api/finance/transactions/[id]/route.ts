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
    if (body?.date != null) update.date = body.date
    if (body?.direction != null) update.direction = body.direction
    if (body?.amount != null) update.amount = body.amount
    if (body?.currency != null) update.currency = body.currency
    if (body?.category != null) update.category = body.category
    if (body?.description != null) update.description = body.description
    if (body?.accountId !== undefined) update.accountId = body.accountId

    const db = await getDatabase()
    const result = await db.collection("finance_transactions").findOneAndUpdate(
      { _id: new ObjectId(id), ownerId: session.user.id },
      { $set: update },
      { returnDocument: "after" },
    )

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const t: any = result
    return NextResponse.json({
      transaction: {
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
      },
    })
  } catch (error) {
    console.error("finance transactions PATCH error:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
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
    const res = await db.collection("finance_transactions").deleteOne({
      _id: new ObjectId(id),
      ownerId: session.user.id,
    })

    if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("finance transactions DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}

