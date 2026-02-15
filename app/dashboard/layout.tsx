import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/auth-server"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="flex h-screen">
      <Sidebar
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
        }}
      />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
