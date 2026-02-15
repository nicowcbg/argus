import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export type AppUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

/**
 * Get the current app user from Supabase session.
 * Finds or creates our User record linked to the Supabase auth user.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient()
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()

  if (!supabaseUser) return null

  let appUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  })

  if (!appUser) {
    appUser = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email ?? null,
        name: supabaseUser.user_metadata?.name ?? supabaseUser.user_metadata?.full_name ?? null,
        image: supabaseUser.user_metadata?.avatar_url ?? supabaseUser.user_metadata?.picture ?? null,
      },
    })
  }

  return {
    id: appUser.id,
    name: appUser.name,
    email: appUser.email,
    image: appUser.image,
  }
}

/**
 * Returns the current Supabase Auth user id (UUID) or null.
 * Use this when reading/writing Supabase tables that are scoped by user (e.g. issues).
 */
export async function getSupabaseUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}
