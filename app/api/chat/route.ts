import { NextRequest, NextResponse } from "next/server"
import { getSupabaseUserId } from "@/lib/supabase/auth-server"
import {
  getChatWithMessages,
  createMessage,
  touchChatUpdatedAt,
  updateChatTitle,
} from "@/lib/supabase/chats-server"

export async function POST(request: NextRequest) {
  try {
    const userId = await getSupabaseUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const chatId = typeof body.chatId === "string" ? body.chatId.trim() : ""
    const content = typeof body.content === "string" ? body.content.trim() : ""

    if (!chatId || !content) {
      return NextResponse.json(
        { error: "chatId and content are required" },
        { status: 400 }
      )
    }

    const chatWithMessages = await getChatWithMessages(userId, chatId)
    if (!chatWithMessages) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const { chat, messages } = chatWithMessages

    await createMessage(chatId, "user", content)

    const openAiMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
      {
        role: "system",
        content:
          "You are a helpful assistant. Be concise and clear.",
      },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      { role: "user", content },
    ]

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openAiMessages,
        max_tokens: 1024,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("OpenAI API error:", res.status, err)
      return NextResponse.json(
        { error: "Failed to get assistant response" },
        { status: 502 }
      )
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const assistantContent =
      data.choices?.[0]?.message?.content?.trim() ?? "No response."

    await createMessage(chatId, "assistant", assistantContent)
    await touchChatUpdatedAt(userId, chatId)

    if (!chat.title || chat.title === "New chat") {
      const title =
        content.length > 40 ? content.slice(0, 40) + "…" : content
      await updateChatTitle(userId, chatId, title || "New chat")
    }

    return NextResponse.json({ content: assistantContent })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}
