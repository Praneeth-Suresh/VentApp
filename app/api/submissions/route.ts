import { type NextRequest, NextResponse } from "next/server"
import { addSubmission, getSubmissions } from "@/lib/db"
import { verifyAdminKey, extractApiKey } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content } = body

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 })
    }

    const id = await addSubmission(content)

    return NextResponse.json({ id, message: "Submission created" }, { status: 201 })
  } catch (error) {
    console.error("[v0] POST /api/submissions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    console.error("[v0] GET /api/submissions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
