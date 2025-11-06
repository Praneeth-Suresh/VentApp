import { type NextRequest, NextResponse } from "next/server"
import { getSubmissionById } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const submission = await getSubmissionById(id)

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error("[v0] GET /api/submissions/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
