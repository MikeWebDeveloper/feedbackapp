"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  databases,
  storage,
  account,
  DATABASE_ID,
  PROJECTS_COLLECTION_ID,
  TASKS_COLLECTION_ID,
  STORAGE_BUCKET_ID,
} from "@/src/lib/appwrite"
import { ID } from "appwrite"
import type { Project, TaskType } from "@/src/lib/types"
import { Upload, X } from "lucide-react"

interface SubmissionFormProps {
  onSuccess: () => void
}

export function SubmissionForm({ onSuccess }: SubmissionFormProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<TaskType>("bug")
  const [projectId, setProjectId] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, PROJECTS_COLLECTION_ID)
        setProjects(response.documents as Project[])
      } catch (error) {
        console.error("Failed to fetch projects:", error)
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }
      setScreenshot(file)
    }
  }

  const removeScreenshot = () => {
    setScreenshot(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await account.get()
      let screenshotId = undefined

      // Upload screenshot if provided
      if (screenshot) {
        const uploadResponse = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), screenshot)
        screenshotId = uploadResponse.$id
      }

      // Create task
      await databases.createDocument(DATABASE_ID, TASKS_COLLECTION_ID, ID.unique(), {
        title,
        description,
        type,
        status: "open",
        projectId,
        submittedBy: user.$id,
        submittedByName: user.name,
        screenshotId,
      })

      toast({
        title: "Feedback submitted successfully",
        description: "Thank you for your feedback! We'll review it soon.",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setType("bug")
      setProjectId("")
      setScreenshot(null)
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="project">Project *</Label>
        <Select value={projectId} onValueChange={setProjectId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.$id} value={project.$id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type *</Label>
        <Select value={type} onValueChange={(value: TaskType) => setType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug">Bug Report</SelectItem>
            <SelectItem value="improvement">Improvement</SelectItem>
            <SelectItem value="feature">Feature Request</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Brief description of the issue or request"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Provide detailed information about the issue or request..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="screenshot">Screenshot (Optional)</Label>
        {screenshot ? (
          <div className="flex items-center gap-2 p-3 border rounded-md">
            <div className="flex-1">
              <p className="text-sm font-medium">{screenshot.name}</p>
              <p className="text-xs text-muted-foreground">{(screenshot.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={removeScreenshot}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="screenshot" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:text-primary/80">Upload a screenshot</span>
                  <input id="screenshot" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  )
}
