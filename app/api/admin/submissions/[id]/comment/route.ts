import { type NextRequest, NextResponse } from "next/server"
import { addAdminComment } from "@/lib/db"
import { verifyAdminKey, extractApiKey } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiKey = extractApiKey(req)
    const { id } = params

    if (!apiKey || !verifyAdminKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { comment } = body

    if (!comment || typeof comment !== "string") {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 })
    }

    await addAdminComment(id, comment)

    return NextResponse.json({ message: "Comment added" })
  } catch (error) {
    console.error("[v0] POST /api/admin/submissions/[id]/comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
