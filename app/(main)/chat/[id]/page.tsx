import { notFound } from "next/navigation"
import { getSupabaseUserId } from "@/lib/supabase/auth-server"
import { getChatWithMessages } from "@/lib/supabase/chats-server"
import { ChatPanel } from "@/components/chat/chat-panel"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const userId = await getSupabaseUserId()
  if (!userId) notFound()

  const data = await getChatWithMessages(userId, id)
  if (!data) notFound()

  return (
    <ChatPanel
      chatId={data.chat.id}
      initialMessages={data.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      }))}
    />
  )
}
