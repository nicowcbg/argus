"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { EmailsTab } from "@/components/dashboard/emails-tab"
import { setThreadsCache } from "@/lib/threads-cache"
import type { DashboardIssue } from "@/components/dashboard/dashboard-content"
import type { ThreadsPayload } from "@/lib/threads-server"

type AppTab = "home" | "emails"

interface MainLayoutClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  chats: { id: string; title: string | null; updated_at: string }[]
  issues: DashboardIssue[]
  initialThreads: ThreadsPayload | null
  children: React.ReactNode
}

export function MainLayoutClient({
  user,
  chats,
  issues,
  initialThreads,
  children,
}: MainLayoutClientProps) {
  useEffect(() => {
    if (initialThreads?.results?.length) {
      setThreadsCache({
        results: initialThreads.results,
        cursor: initialThreads.cursor,
        count: initialThreads.count,
        remaining: initialThreads.remaining,
      })
    }
  }, [initialThreads])
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isApp = pathname === "/app"

  const initialTab = useMemo<AppTab>(() => {
    if (!isApp) return "home"
    const t = searchParams.get("tab")
    return t === "emails" ? "emails" : "home"
  }, [isApp, searchParams])

  const [tab, setTab] = useState<AppTab>(initialTab)

  useEffect(() => {
    if (isApp) {
      const t = searchParams.get("tab")
      setTab(t === "emails" ? "emails" : "home")
    }
  }, [isApp, searchParams])

  const setAppTab = (newTab: AppTab) => {
    setTab(newTab)
    const url = newTab === "home" ? "/app" : "/app?tab=emails"
    window.history.replaceState(null, "", url)
  }

  const content =
    isApp ? (
      tab === "home" ? (
        <div className="p-8">
          <DashboardContent issues={issues} noPadding />
        </div>
      ) : (
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
            <p className="text-muted-foreground mt-1">Your email threads</p>
          </div>
          <EmailsTab initialThreads={initialThreads} />
        </div>
      )
    ) : (
      children
    )

  return (
    <div className="flex h-screen">
      <Sidebar
        user={user}
        chats={chats}
        isApp={isApp}
        appTab={tab}
        onAppTabChange={setAppTab}
      />
      <div className="flex-1 overflow-auto">{content}</div>
    </div>
  )
}
