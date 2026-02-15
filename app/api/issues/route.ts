import { NextRequest, NextResponse } from "next/server"
import { getSupabaseUserId } from "@/lib/supabase/auth-server"
import { getIssuesForUser, createIssue } from "@/lib/supabase/issues-server"

export async function GET() {
  try {
    const userId = await getSupabaseUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const issues = await getIssuesForUser(userId)
    return NextResponse.json(issues)
  } catch (error) {
    console.error("Error fetching issues:", error)
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSupabaseUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const description =
      typeof body.description === "string" ? body.description.trim() : null

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const { id, error } = await createIssue(userId, { title, description })
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }
    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error creating issue:", error)
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    )
  }
}
