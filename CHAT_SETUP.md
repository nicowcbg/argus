# Chat (GPT) setup

- **Env:** Add `OPENAI_API_KEY` to `.env.local` (and to Vercel env vars for production). Your OpenAI API key.
- **Database:** Ensure the `chats` and `messages` tables exist in Supabase (run the SQL from the earlier prompt, or use the SQL in the chat feature doc).
- **Routes:** `/home` (issues), `/new` (new chat → redirects to `/chat/[id]`), `/chat/[id]` (chat UI).
