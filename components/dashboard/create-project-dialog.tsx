"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  })

  // Clear error when dialog opens/closes
  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null)
    onOpenChange(next)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const onSubmit = async (data: ProjectFormValues) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await axios.post<{ id?: number }>(
        "/api/issues",
        {
          title: data.title.trim(),
          description: data.description?.trim() || null,
        },
        { headers: { "Content-Type": "application/json" } }
      )

      const id = response.data?.id
      if (id !== undefined && id !== null) {
        reset()
        setFiles([])
        onOpenChange(false)
        router.refresh()
      } else {
        setError("Failed to create issue. Please try again.")
      }
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to create issue. Please try again."
      setError(message)
      console.error("Error creating issue:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new issue. Only the title is required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="My Project"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Project description..."
                rows={4}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="files">Files (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {files.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
