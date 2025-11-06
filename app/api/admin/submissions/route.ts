import { type NextRequest, NextResponse } from "next/server"
import { getSubmissions } from "@/lib/db"
import { verifyAdminKey, extractApiKey } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const apiKey = extractApiKey(req)
    const status = req.nextUrl.searchParams.get("status")

    if (!apiKey || !verifyAdminKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submissions = await getSubmissions(status || undefined)

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("[v0] GET /api/admin/submissions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
