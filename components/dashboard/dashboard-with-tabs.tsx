"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DashboardContent } from "./dashboard-content"
import { EmailsTab } from "./emails-tab"
import type { DashboardIssue } from "./dashboard-content"

interface DashboardWithTabsProps {
  issues: DashboardIssue[]
}

export function DashboardWithTabs({ issues }: DashboardWithTabsProps) {
  const [tab, setTab] = useState("issues")

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Issues and email threads
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
          <DashboardContent issues={issues} noPadding />
        </TabsContent>

        <TabsContent value="emails">
          <EmailsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
