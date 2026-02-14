import { auth } from "@/auth"

export default async function DebugPage() {
  const session = await auth()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      <pre className="bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}
