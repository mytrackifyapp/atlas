import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import {
  deleteOutreach,
  getOutreach,
  updateOutreachContent,
} from "@/lib/sales/outreach-service"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

function serializeOutreach(outreach: NonNullable<Awaited<ReturnType<typeof getOutreach>>>) {
  return {
    ...outreach,
    createdAt: outreach.createdAt.toISOString(),
    updatedAt: outreach.updatedAt.toISOString(),
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const outreach = await getOutreach(id, session.user.id)
    if (!outreach) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, outreach: serializeOutreach(outreach) })
  } catch (error) {
    console.error("Error getting outreach:", error)
    return NextResponse.json({ error: "Failed to get outreach" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = (await request.json()) as {
      subject?: string
      body?: string
      toEmail?: string
    }

    const updated = await updateOutreachContent(id, session.user.id, body)
    if (!updated) {
      return NextResponse.json(
        { error: "Not found or cannot edit in current status" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, outreach: serializeOutreach(updated) })
  } catch (error) {
    console.error("Error updating outreach:", error)
    return NextResponse.json({ error: "Failed to update outreach" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const deleted = await deleteOutreach(id, session.user.id)
    if (!deleted) {
      return NextResponse.json(
        { error: "Cannot delete — not found or already sent" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting outreach:", error)
    return NextResponse.json({ error: "Failed to delete outreach" }, { status: 500 })
  }
}
