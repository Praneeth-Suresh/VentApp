import { type NextRequest, NextResponse } from "next/server"
import { getPendingSubmissionsCount } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const count = await getPendingSubmissionsCount()
    return NextResponse.json({ count })
  } catch (error) {
    console.error("[v0] GET /api/submissions/count error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
