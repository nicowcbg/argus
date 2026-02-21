import { notFound } from "next/navigation"
import Link from "next/link"
import { getSupabaseUserId } from "@/lib/supabase/auth-server"
import { getIssueById } from "@/lib/supabase/issues-server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

export default async function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const issueId = parseInt(id, 10)
  if (Number.isNaN(issueId)) notFound()

  const userId = await getSupabaseUserId()
  if (!userId) notFound()

  const issue = await getIssueById(userId, issueId)
  if (!issue) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-4 gap-2">
        <Link href="/app">
          <ArrowLeft className="h-4 w-4" />
          Back to issues
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{issue.title ?? "Untitled"}</CardTitle>
          <CardDescription>
            {format(new Date(issue.created_at), "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {issue.description ? (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {issue.description}
            </p>
          ) : (
            <p className="text-muted-foreground">No description.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
