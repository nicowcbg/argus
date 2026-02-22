import { NextRequest, NextResponse } from "next/server"
import { getSupabaseUserId } from "@/lib/supabase/auth-server"

export const dynamic = "force-dynamic"

const THREADS_CONSTRAINTS = [
  {
    key: "user",
    constraint_type: "equals",
    value: "1763415437515x804064386191329700",
  },
]

/** Shape of one thread from Lobby API (response.response.results[]) */
export type ThreadItem = {
  _id: string
  subject?: string
  summary?: string
  status?: string
  label?: string
  last_contact?: string
  "Modified Date"?: string
  "Created Date"?: string
  date?: string
  Important?: boolean
  Urgent?: boolean
  pre_tag?: string
  user?: string
  [key: string]: unknown
}

export async function GET(request: NextRequest) {
  try {
    await getSupabaseUserId()

    const token = process.env.THELOBBY_API_KEY ?? process.env.LOBBY_BEARER_TOKEN
    if (!token) {
      return NextResponse.json(
        {
          error: "Lobby API key not configured",
          code: "MISSING_API_KEY",
          hint: "Set THELOBBY_API_KEY or LOBBY_BEARER_TOKEN in .env.local",
        },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor") ?? "0"
    const limit = searchParams.get("limit") ?? "50"
    const sort_field = searchParams.get("sort_field") ?? "last_contact"
    const descending = searchParams.get("descending") ?? "true"

    const version = (process.env.THELOBBY_VERSION ?? "version-test/").replace(
      /\/?$/,
      "/"
    )
    const constraints = encodeURIComponent(JSON.stringify(THREADS_CONSTRAINTS))
    const params = new URLSearchParams({
      constraints,
      cursor,
      limit,
      sort_field,
      descending,
    })
    const url = `https://thelobby.ai/${version}api/1.1/obj/thread?${params}`

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Lobby API error:", res.status, text)
      const message =
        res.status === 401
          ? "Lobby API: invalid or expired token"
          : res.status === 403
            ? "Lobby API: access denied"
            : `Lobby API error (${res.status})`
      return NextResponse.json(
        { error: message, details: text.slice(0, 200) },
        { status: res.status }
      )
    }

    const data = await res.json()
    const response = data?.response
    const list =
      response?.results ??
      (Array.isArray(data) ? data : data?.results ?? [])
    const count = response?.count ?? list.length
    const remaining = response?.remaining ?? 0
    const nextCursor = Number(cursor) + list.length

    return NextResponse.json({
      results: list as ThreadItem[],
      cursor: nextCursor,
      count,
      remaining,
    })
  } catch (error) {
    console.error("Threads API error:", error)
    const message =
      error instanceof Error ? error.message : "Failed to fetch threads"
    return NextResponse.json(
      { error: message, details: message },
      { status: 500 }
    )
  }
}
