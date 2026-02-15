import { createClient } from "@/lib/supabase/server"

export type ChatRow = {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export type MessageRow = {
  id: string
  chat_id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
}

export async function getChatsForUser(supabaseUserId: string): Promise<ChatRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("chats")
    .select("id, user_id, title, created_at, updated_at")
    .eq("user_id", supabaseUserId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("getChatsForUser error:", error)
    return []
  }
  return (data ?? []) as ChatRow[]
}

export async function getChatWithMessages(
  supabaseUserId: string,
  chatId: string
): Promise<{ chat: ChatRow; messages: MessageRow[] } | null> {
  const supabase = await createClient()
  const { data: chatData, error: chatError } = await supabase
    .from("chats")
    .select("id, user_id, title, created_at, updated_at")
    .eq("id", chatId)
    .eq("user_id", supabaseUserId)
    .single()

  if (chatError || !chatData) return null

  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .select("id, chat_id, role, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  if (messagesError) {
    console.error("getChatWithMessages messages error:", messagesError)
    return { chat: chatData as ChatRow, messages: [] }
  }

  return {
    chat: chatData as ChatRow,
    messages: (messagesData ?? []) as MessageRow[],
  }
}

export async function createChat(
  supabaseUserId: string,
  title: string | null = "New chat"
): Promise<{ id: string; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id: supabaseUserId, title })
    .select("id")
    .single()

  if (error) {
    console.error("createChat error:", error)
    return { id: "", error: error.message }
  }
  return { id: (data as { id: string }).id, error: null }
}

export async function createMessage(
  chatId: string,
  role: "user" | "assistant" | "system",
  content: string
): Promise<{ id: string; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, role, content })
    .select("id")
    .single()

  if (error) {
    console.error("createMessage error:", error)
    return { id: "", error: error.message }
  }
  return { id: (data as { id: string }).id, error: null }
}

export async function updateChatTitle(
  supabaseUserId: string,
  chatId: string,
  title: string
): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("chats")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("user_id", supabaseUserId)

  return !error
}

export async function touchChatUpdatedAt(
  supabaseUserId: string,
  chatId: string
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("user_id", supabaseUserId)
}
