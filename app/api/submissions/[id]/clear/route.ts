import { type NextRequest, NextResponse } from "next/server"
import { updateSubmission } from "@/lib/db"
import { verifyAdminKey, extractApiKey } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiKey = extractApiKey(req)
    const { id } = params

    if (!apiKey || !verifyAdminKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await updateSubmission(id, { status: "approved" })

    return NextResponse.json({ message: "Submission approved" })
  } catch (error) {
    console.error("[v0] PATCH /api/submissions/[id]/clear error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
