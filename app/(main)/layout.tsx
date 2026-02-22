import { redirect } from "next/navigation"
import { getCurrentUser, getSupabaseUserId } from "@/lib/supabase/auth-server"
import { getChatsForUser } from "@/lib/supabase/chats-server"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  let chats: { id: string; title: string | null; updated_at: string }[] = []
  const supabaseUserId = await getSupabaseUserId()
  if (supabaseUserId) {
    try {
      const rows = await getChatsForUser(supabaseUserId)
      chats = rows.map((c) => ({
        id: c.id,
        title: c.title,
        updated_at: c.updated_at,
      }))
    } catch (e) {
      console.error("Error fetching chats:", e)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
        }}
        chats={chats}
      />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
