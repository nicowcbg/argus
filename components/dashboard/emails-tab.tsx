"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { ThreadItem } from "@/app/api/threads/route"

function truncateOneLine(s: string, maxLen = 120): string {
  const t = s?.trim() ?? ""
  if (t.length <= maxLen) return t
  return t.slice(0, maxLen).trim() + "…"
}

export function EmailsTab() {
  const [threads, setThreads] = useState<ThreadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/threads")
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 500 ? "Server error" : "Failed to load")
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setThreads(Array.isArray(data) ? data : [])
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
  }, [])

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Loading threads…</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
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
            {threads.map((t) => (
              <tr
                key={t._id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {t.last_contact
                    ? (() => {
                        try {
                          const d = new Date(t.last_contact)
                          return isNaN(d.getTime())
                            ? t.last_contact
                            : format(d, "MMM d, yyyy")
                        } catch {
                          return t.last_contact
                        }
                      })()
                    : "—"}
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
    </Card>
  )
}
