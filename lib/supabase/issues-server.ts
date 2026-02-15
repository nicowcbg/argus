import { createClient } from "@/lib/supabase/server"

export type IssueRow = {
  id: number
  created_at: string
  title: string | null
  description: string | null
  user_id: string | null
}

/** Supabase issues table may use "Title"/"Description" (capitalized); we normalize to title/description. */
function rowToIssue(row: Record<string, unknown>): IssueRow {
  return {
    id: row.id as number,
    created_at: row.created_at as string,
    title: (row.Title ?? row.title) as string | null,
    description: (row.Description ?? row.description) as string | null,
    user_id: (row.user_id as string) ?? null,
  }
}

/**
 * Fetch issues created by the given Supabase user.
 */
export async function getIssuesForUser(supabaseUserId: string): Promise<IssueRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("issues")
    .select("id, created_at, Title, Description, user_id")
    .eq("user_id", supabaseUserId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getIssuesForUser error:", error)
    return []
  }
  return (data ?? []).map(rowToIssue)
}

/**
 * Insert a new issue for the given Supabase user.
 * Table must have Title, Description, user_id (and id, created_at).
 */
export async function createIssue(
  supabaseUserId: string,
  payload: { title: string; description?: string | null }
): Promise<{ id: number; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("issues")
    .insert({
      Title: payload.title,
      Description: payload.description ?? null,
      user_id: supabaseUserId,
    })
    .select("id")
    .single()

  if (error) {
    console.error("createIssue error:", error)
    return { id: 0, error: error.message }
  }
  return { id: (data as { id: number })?.id ?? 0, error: null }
}

/**
 * Fetch a single issue by id; returns null if not found or not owned by the user.
 */
export async function getIssueById(
  supabaseUserId: string,
  issueId: number
): Promise<IssueRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("issues")
    .select("id, created_at, Title, Description, user_id")
    .eq("id", issueId)
    .eq("user_id", supabaseUserId)
    .single()

  if (error || !data) return null
  return rowToIssue(data as Record<string, unknown>)
}
