import { getSupabaseUserId } from "@/lib/supabase/auth-server"
import { getIssuesForUser } from "@/lib/supabase/issues-server"
import { DashboardWithTabs } from "@/components/dashboard/dashboard-with-tabs"
import type { DashboardIssue } from "@/components/dashboard/dashboard-content"

export default async function HomePage() {
  let issues: DashboardIssue[] = []
  const supabaseUserId = await getSupabaseUserId()
  if (supabaseUserId) {
    try {
      const rows = await getIssuesForUser(supabaseUserId)
      issues = rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        createdAt: r.created_at,
      }))
    } catch (error) {
      console.error("Error fetching issues:", error)
    }
  }

  return <DashboardWithTabs issues={issues} />
}
