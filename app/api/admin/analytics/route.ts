import { type NextRequest, NextResponse } from "next/server"
import { getLatestAnalytics } from "@/lib/db"
import { verifyAdminKey, extractApiKey } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const apiKey = extractApiKey(req)

    if (!apiKey || !verifyAdminKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analytics = await getLatestAnalytics()

    if (!analytics) {
      return NextResponse.json({ error: "No analytics available yet" }, { status: 404 })
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("[v0] GET /api/admin/analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
