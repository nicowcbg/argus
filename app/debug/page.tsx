import { getCurrentUser } from "@/lib/supabase/auth-server"
import { createClient } from "@/lib/supabase/server"

export default async function DebugPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <h2 className="text-lg font-semibold mt-4">App user (from DB)</h2>
      <pre className="bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
      <h2 className="text-lg font-semibold mt-4">Supabase user</h2>
      <pre className="bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(supabaseUser, null, 2)}
      </pre>
    </div>
  )
}
