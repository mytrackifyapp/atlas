import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

const dealSchema = z.object({
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  sector: z.string().trim().min(1).max(80),
  stage: z.string().trim().min(1).max(80),
  location: z.string().trim().min(1).max(120),
  website: z.string().trim().url().optional().nullable(),
  onboarded: z.boolean().optional().default(false),
  asking: z.coerce.number().nonnegative().optional().nullable(),
  valuation: z.coerce.number().nonnegative().optional().nullable(),
  status: z
    .enum(["New", "Under Review", "Due Diligence", "Declined"])
    .optional()
    .default("New"),
  score: z.coerce.number().int().min(0).max(100).optional().default(0),
  highlights: z.array(z.string().trim().min(1).max(80)).max(12).optional().default([]),
  logo: z.string().trim().optional().nullable(),
})

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDatabase()
    const deals = await db
      .collection("deal_flow_deals")
      .find({ ownerId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      deals: deals.map((d) => ({
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
      })),
    })
  } catch (error) {
    console.error("Deal flow GET error:", error)
    return NextResponse.json({ error: "Failed to load deals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const json = await request.json().catch(() => null)
    const parsed = dealSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid deal payload" }, { status: 400 })
    }

    const db = await getDatabase()

    const doc = {
      ownerId: session.user.id,
      ...parsed.data,
      website: parsed.data.website ?? null,
      onboarded: parsed.data.onboarded ?? false,
      asking: parsed.data.asking ?? null,
      valuation: parsed.data.valuation ?? null,
      highlights: parsed.data.highlights ?? [],
      submittedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("deal_flow_deals").insertOne(doc)

    return NextResponse.json(
      {
        success: true,
        deal: {
          id: result.insertedId.toString(),
          ...doc,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Deal flow POST error:", error)
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 })
  }
}

