"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateProjectDialog } from "./create-project-dialog"
import { Plus, FileText, Calendar } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export interface DashboardIssue {
  id: number
  title: string | null
  description: string | null
  createdAt: string
}

interface DashboardContentProps {
  issues: DashboardIssue[]
}

export function DashboardContent({ issues: initialIssues }: DashboardContentProps) {
  const [issues, setIssues] = useState(initialIssues)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    setIssues(initialIssues)
  }, [initialIssues])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Issues</h1>
          <p className="text-muted-foreground mt-1">
            Issues created by you
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {issues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No issues yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Get started by creating your first issue
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Link key={issue.id} href={`/dashboard/issues/${issue.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{issue.title ?? "Untitled"}</CardTitle>
                  {issue.description && (
                    <CardDescription className="line-clamp-2">
                      {issue.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(issue.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
