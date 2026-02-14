import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { uploadToS3 } from "@/lib/s3"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
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

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string | null
    const files = formData.getAll("files") as File[]

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        userId: session.user.id,
      },
    })

    // Handle file uploads to S3
    if (files.length > 0) {
      const fileRecords = await Promise.all(
        files.map(async (file) => {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const fileName = `${project.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
          
          // Upload to S3
          const url = await uploadToS3(buffer, fileName, file.type)

          return prisma.file.create({
            data: {
              name: file.name,
              url,
              size: file.size,
              mimeType: file.type,
              projectId: project.id,
            },
          })
        })
      )

      return NextResponse.json({
        ...project,
        files: fileRecords,
      })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
