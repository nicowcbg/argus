import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser, getSupabaseUserId } from "@/lib/supabase/auth-server"
import { getChatsForUser } from "@/lib/supabase/chats-server"
import { getIssuesForUser } from "@/lib/supabase/issues-server"
import { MainLayoutClient } from "@/components/dashboard/main-layout-client"
import type { DashboardIssue } from "@/components/dashboard/dashboard-content"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  let chats: { id: string; title: string | null; updated_at: string }[] = []
  let issues: DashboardIssue[] = []
  const supabaseUserId = await getSupabaseUserId()
  if (supabaseUserId) {
    try {
      const [chatRows, issueRows] = await Promise.all([
        getChatsForUser(supabaseUserId),
        getIssuesForUser(supabaseUserId),
      ])
      chats = chatRows.map((c) => ({
        id: c.id,
        title: c.title,
        updated_at: c.updated_at,
      }))
      issues = issueRows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        createdAt: r.created_at,
      }))
    } catch (e) {
      console.error("Error fetching layout data:", e)
    }
  }

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
      <MainLayoutClient
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
        }}
        chats={chats}
        issues={issues}
      >
        {children}
      </MainLayoutClient>
    </Suspense>
  )
}
