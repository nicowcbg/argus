import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()

  // Redirect to login if not authenticated
  // Note: redirect() throws internally, so we don't wrap it in try-catch
  if (!session?.user) {
    redirect("/login")
  }

  // Redirect to login if user ID is missing
  if (!session.user.id) {
    console.error("Session user ID is missing")
    redirect("/login")
  }

  // Fetch projects - handle errors gracefully
  let projects = []
  try {
    projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        files: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    // Continue with empty projects array
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      <div className="flex-1 overflow-auto">
        <DashboardContent projects={projects} />
      </div>
    </div>
  )
}
