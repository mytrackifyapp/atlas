import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { z } from "zod"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  tagline: z.string().trim().min(1).max(240).optional(),
  sector: z.string().trim().min(1).max(80).optional(),
  stage: z.string().trim().min(1).max(80).optional(),
  location: z.string().trim().min(1).max(120).optional(),
  website: z.string().trim().url().optional().nullable(),
  onboarded: z.boolean().optional(),
  asking: z.coerce.number().nonnegative().optional().nullable(),
  valuation: z.coerce.number().nonnegative().optional().nullable(),
  status: z.enum(["New", "Under Review", "Due Diligence", "Declined"]).optional(),
  score: z.coerce.number().int().min(0).max(100).optional(),
  highlights: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
  logo: z.string().trim().optional().nullable(),
})

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const json = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update payload" }, { status: 400 })
    }

    const db = await getDatabase()
    const _id = new ObjectId(id)

    const update = {
      ...parsed.data,
      updatedAt: new Date(),
    }

    const result = await db.collection("deal_flow_deals").findOneAndUpdate(
      { _id, ownerId: session.user.id },
      { $set: update },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const d = result
    return NextResponse.json({
      success: true,
      deal: {
        id: d._id.toString(),
        name: d.name,
        logo: d.logo ?? null,
        tagline: d.tagline,
        sector: d.sector,
        stage: d.stage,
        asking: d.asking ?? null,
        valuation: d.valuation ?? null,
        location: d.location,
        website: d.website ?? null,
        onboarded: !!d.onboarded,
        submittedDate: d.submittedDate ?? d.createdAt ?? new Date(),
        status: d.status ?? "New",
        score: d.score ?? 0,
        highlights: d.highlights ?? [],
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      },
    })
  } catch (error) {
    console.error("Deal flow PATCH error:", error)
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const db = await getDatabase()
    const _id = new ObjectId(id)

    const result = await db.collection("deal_flow_deals").deleteOne({ _id, ownerId: session.user.id })
    if (!result.deletedCount) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Deal flow DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 })
  }
}

