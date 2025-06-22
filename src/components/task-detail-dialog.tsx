"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { databases, storage, DATABASE_ID, TASKS_COLLECTION_ID, STORAGE_BUCKET_ID } from "@/src/lib/appwrite"
import type { Task, TaskStatus } from "@/src/lib/types"
import { useAppStore } from "@/src/lib/store"

interface TaskDetailDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  showStatusUpdate: boolean
}

export function TaskDetailDialog({ task, open, onOpenChange, showStatusUpdate }: TaskDetailDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const { updateTask } = useAppStore()
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "improvement":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "feature":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    setIsUpdating(true)
    try {
      await databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, task.$id, { status: newStatus })

      updateTask(task.$id, { status: newStatus })

      toast({
        title: "Status updated",
        description: `Task status changed to ${newStatus.replace("-", " ")}.`,
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update task status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Load screenshot when dialog opens
  React.useEffect(() => {
    const loadScreenshot = async () => {
      if (task.screenshotId && open) {
        try {
          const url = storage.getFileView(STORAGE_BUCKET_ID, task.screenshotId)
          setScreenshotUrl(url.href)
        } catch (error) {
          console.error("Failed to load screenshot:", error)
        }
      }
    }

    loadScreenshot()
  }, [task.screenshotId, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges */}
          <div className="flex gap-2">
            <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
            <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Screenshot */}
          {task.screenshotId && (
            <div>
              <h3 className="font-semibold mb-2">Screenshot</h3>
              {screenshotUrl ? (
                <div className="border rounded-lg overflow-hidden">
                  <Image
                    src={screenshotUrl || "/placeholder.svg"}
                    alt="Task screenshot"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading screenshot...</p>
                </div>
              )}
            </div>
          )}

          {/* Submitter Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(task.submittedByName || "Unknown")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{task.submittedByName || "Unknown User"}</p>
              <p className="text-sm text-muted-foreground">
                Submitted on {new Date(task.$createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Status Update (Developer Only) */}
          {showStatusUpdate && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Update Status</h3>
              <div className="flex gap-2">
                <Select
                  value={task.status}
                  onValueChange={(value: TaskStatus) => handleStatusUpdate(value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdating && (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
