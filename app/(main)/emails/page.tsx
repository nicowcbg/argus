import { EmailsTab } from "@/components/dashboard/emails-tab"

export default function EmailsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
        <p className="text-muted-foreground mt-1">
          Your email threads
        </p>
      </div>
      <EmailsTab />
    </div>
  )
}
