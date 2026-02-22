"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import type { ThreadItem } from "@/app/api/threads/route"
import { getThreadsCache, setThreadsCache } from "@/lib/threads-cache"
import type { ThreadsPayload } from "@/lib/threads-server"

function truncateOneLine(s: string, maxLen = 120): string {
  const t = s?.trim() ?? ""
  if (t.length <= maxLen) return t
  return t.slice(0, maxLen).trim() + "…"
}

function getThreadDate(t: ThreadItem): number {
  const raw = t.last_contact ?? t["Modified Date"] ?? t.date
  if (!raw) return 0
  try {
    const d = new Date(raw)
    return isNaN(d.getTime()) ? 0 : d.getTime()
  } catch {
    return 0
  }
}

function sortByDateDesc(a: ThreadItem, b: ThreadItem): number {
  return getThreadDate(b) - getThreadDate(a)
}

type ThreadsPayload = {
  results: ThreadItem[]
  cursor: number
  count: number
  remaining: number
}

async function fetchThreads(cursor?: number): Promise<ThreadsPayload> {
  const params = new URLSearchParams()
  params.set("sort_field", "last_contact")
  params.set("descending", "true")
  if (cursor != null && cursor > 0) params.set("cursor", String(cursor))
  const res = await fetch(`/api/threads?${params}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg =
      typeof data?.error === "string"
        ? data.error
        : data?.hint ?? (res.status === 500 ? "Server error" : "Failed to load")
    const details = typeof data?.details === "string" ? data.details : undefined
    throw new Error(details ? `${msg}: ${details}` : msg)
  }
  return {
    results: Array.isArray(data.results) ? data.results : [],
    cursor: typeof data.cursor === "number" ? data.cursor : data.cursor ?? 0,
    count: data.count ?? 0,
    remaining: data.remaining ?? 0,
  }
}

export function EmailsTab({
  initialThreads,
}: {
  initialThreads?: ThreadsPayload | null
} = {}) {
  const hasInitial =
    initialThreads?.results && initialThreads.results.length > 0
  const [threads, setThreads] = useState<ThreadItem[]>(() => {
    if (hasInitial) {
      return [...initialThreads!.results].sort(sortByDateDesc)
    }
    return []
  })
  const [cursor, setCursor] = useState<number>(() => initialThreads?.cursor ?? 0)
  const [remaining, setRemaining] = useState<number>(
    () => initialThreads?.remaining ?? 0
  )
  const [loading, setLoading] = useState(!hasInitial)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPage = useCallback(async (nextCursor?: number) => {
    const payload = await fetchThreads(nextCursor)
    const sorted = [...payload.results].sort(sortByDateDesc)
    return { ...payload, results: sorted }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (hasInitial) {
      setLoading(false)
      loadPage()
        .then((payload) => {
          if (cancelled) return
          setThreads(payload.results)
          setCursor(payload.cursor)
          setRemaining(payload.remaining)
          setThreadsCache({
            results: payload.results,
            cursor: payload.cursor,
            count: payload.count,
            remaining: payload.remaining,
          })
        })
        .catch(() => {
          /* keep showing initial data on background refresh failure */
        })
      return () => {
        cancelled = true
      }
    }
    const cached = getThreadsCache()
    if (cached?.results?.length) {
      const sorted = [...(cached.results as ThreadItem[])].sort(sortByDateDesc)
      setThreads(sorted)
      setCursor(cached.cursor)
      setRemaining(cached.remaining)
      setLoading(false)
    }
    loadPage()
      .then((payload) => {
        if (cancelled) return
        setThreads(payload.results)
        setCursor(payload.cursor)
        setRemaining(payload.remaining)
        setThreadsCache({
          results: payload.results,
          cursor: payload.cursor,
          count: payload.count,
          remaining: payload.remaining,
        })
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Failed to load threads")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loadPage, hasInitial])

  const loadMore = () => {
    if (remaining <= 0 || loadingMore) return
    setLoadingMore(true)
    fetchThreads(cursor)
      .then((payload) => {
        const sorted = [...payload.results].sort(sortByDateDesc)
        setThreads((prev) => [...prev, ...sorted])
        setCursor(payload.cursor)
        setRemaining(payload.remaining)
      })
      .catch((e) => setError(e.message ?? "Failed to load more"))
      .finally(() => setLoadingMore(false))
  }

  if (loading && threads.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[140px]">
                  Last contact
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[180px]">
                  Subject
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 max-w-[200px] rounded bg-muted animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 max-w-[320px] rounded bg-muted animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  if (error && threads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Couldn’t load threads</h3>
          <p className="text-muted-foreground text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No threads yet</h3>
          <p className="text-muted-foreground text-center">
            Threads matching your filters will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const sortedThreads = [...threads].sort(sortByDateDesc)

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[140px]">
                Last contact
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[180px]">
                Subject
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Summary
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedThreads.map((t) => (
              <tr
                key={t._id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {(() => {
                    const raw = t.last_contact ?? t["Modified Date"] ?? t.date
                    if (!raw) return "—"
                    try {
                      const d = new Date(raw)
                      return isNaN(d.getTime()) ? raw : format(d, "MMM d, yyyy")
                    } catch {
                      return raw
                    }
                  })()}
                </td>
                <td className="px-4 py-3 text-sm font-medium truncate max-w-[280px]" title={t.subject}>
                  {t.subject ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[400px]" title={t.summary}>
                  {truncateOneLine(t.summary ?? "") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {remaining > 0 && (
        <div className="p-4 border-t flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="gap-2"
          >
            {loadingMore ? (
              "Loading…"
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Load older emails ({remaining} remaining)
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  )
}
