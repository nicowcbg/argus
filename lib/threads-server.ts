/**
 * Server-side fetch for threads (used by layout to preload for instant Emails tab).
 * Shares constraint/config with app/api/threads/route.ts.
 */

const THREADS_CONSTRAINTS = [
  {
    key: "user",
    constraint_type: "equals",
    value: "1763415437515x804064386191329700",
  },
]

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
  [key: string]: unknown
}

export type ThreadsPayload = {
  results: ThreadItem[]
  cursor: number
  count: number
  remaining: number
}

export async function fetchThreadsServer(
  cursor = 0,
  limit = 50
): Promise<ThreadsPayload | null> {
  const token = process.env.THELOBBY_API_KEY ?? process.env.LOBBY_BEARER_TOKEN
  if (!token) return null

  try {
    const version = (
      process.env.THELOBBY_VERSION ?? "version-test/"
    ).replace(/\/?$/, "/")
    const constraints = encodeURIComponent(JSON.stringify(THREADS_CONSTRAINTS))
    const params = new URLSearchParams({
      constraints,
      cursor: String(cursor),
      limit: String(limit),
      sort_field: "last_contact",
      descending: "true",
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

    if (!res.ok) return null

    const data = await res.json()
    const response = data?.response
    const list =
      response?.results ??
      (Array.isArray(data) ? data : data?.results ?? [])
    const count = response?.count ?? list.length
    const remaining = response?.remaining ?? 0
    const nextCursor = cursor + list.length

    return {
      results: list as ThreadItem[],
      cursor: nextCursor,
      count,
      remaining,
    }
  } catch {
    return null
  }
}
