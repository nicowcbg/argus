/**
 * Client-side cache for threads first page so Emails tab can show data
 * instantly when user has prefetched (e.g. by hovering the Emails nav link).
 */

const CACHE_TTL_MS = 60_000 // 1 minute

export type ThreadsCacheEntry = {
  results: unknown[]
  cursor: number
  count: number
  remaining: number
  ts: number
}

let cache: ThreadsCacheEntry | null = null

export function getThreadsCache(): ThreadsCacheEntry | null {
  if (!cache) return null
  if (Date.now() - cache.ts > CACHE_TTL_MS) {
    cache = null
    return null
  }
  return cache
}

export function setThreadsCache(entry: Omit<ThreadsCacheEntry, "ts">): void {
  cache = {
    ...entry,
    ts: Date.now(),
  }
}

export function clearThreadsCache(): void {
  cache = null
}
