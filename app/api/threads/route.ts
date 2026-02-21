import { NextResponse } from "next/server"
import { getSupabaseUserId } from "@/lib/supabase/auth-server"

const THREADS_CONSTRAINTS = [
  {
    key: "user",
    constraint_type: "equals",
    value: "1763415437515x804064386191329700",
  },
]

export type ThreadItem = {
  Date: string
  subject: string
  status: string
  summary: string
  label: string
  _id: string
  Important: string
  Urgent: string
  pre_tag: string
  last_contact: string
}

export async function GET() {
  try {
    await getSupabaseUserId()
    // Optional: uncomment to require auth for threads
    // if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const token = process.env.THELOBBY_API_KEY ?? process.env.LOBBY_BEARER_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: "THELOBBY_API_KEY or LOBBY_BEARER_TOKEN not configured" },
        { status: 500 }
      )
    }

    const version = (process.env.THELOBBY_VERSION ?? "version-test/").replace(
      /\/?$/,
      "/"
    )
    const constraints = encodeURIComponent(JSON.stringify(THREADS_CONSTRAINTS))
    const url = `https://thelobby.ai/${version}api/1.1/obj/thread?constraints=${constraints}`

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
      return NextResponse.json(
        { error: "Failed to fetch threads", details: text },
        { status: res.status }
      )
    }

    const data = await res.json()
    const list = Array.isArray(data) ? data : data?.response ?? data?.results ?? []
    return NextResponse.json(list as ThreadItem[])
  } catch (error) {
    console.error("Threads API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    )
  }
}
