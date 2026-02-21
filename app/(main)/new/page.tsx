import { redirect } from "next/navigation"
import { getSupabaseUserId } from "@/lib/supabase/auth-server"
import { createChat } from "@/lib/supabase/chats-server"

export default async function NewChatPage() {
  const userId = await getSupabaseUserId()
  if (!userId) redirect("/login")

  const { id, error } = await createChat(userId, "New chat")
  if (error || !id) {
    console.error("createChat error:", error)
    redirect("/app")
  }

  redirect(`/chat/${id}`)
}
