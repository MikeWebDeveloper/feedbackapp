"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppStore } from "@/src/lib/store"
import { databases, account, DATABASE_ID, TASKS_COLLECTION_ID } from "@/src/lib/appwrite"
import { Query } from "appwrite"
import type { Task } from "@/src/lib/types"
import { SubmissionForm } from "./submission-form"
import { TaskDetailDialog } from "./task-detail-dialog"
import { Header } from "./header"

export function UserDashboard() {
  const { user, tasks, setTasks, setUser } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await account.get()
        setUser({
          $id: currentUser.$id,
          email: currentUser.email,
          name: currentUser.name,
          isDeveloper: false,
        })
      } catch (error) {
        console.error("Failed to get user:", error)
      }
    }

    initializeUser()
  }, [setUser])

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!user) return

      try {
        const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
          Query.equal("submittedBy", user.$id),
          Query.orderDesc("$createdAt"),
        ])
        setTasks(response.documents as Task[])
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserTasks()
  }, [user, setTasks])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading your feedback...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Feedback</h1>
            <p className="text-muted-foreground mt-2">Track your submitted feedback and see their current status</p>
          </div>
          <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit New Feedback</DialogTitle>
              </DialogHeader>
              <SubmissionForm onSuccess={() => setShowSubmissionForm(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">No feedback submitted yet</p>
                <p>Click "Submit Feedback" to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card
                key={task.$id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTask(task)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
                      <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Submitted {new Date(task.$createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTask && (
          <TaskDetailDialog
            task={selectedTask}
            open={!!selectedTask}
            onOpenChange={(open) => !open && setSelectedTask(null)}
            showStatusUpdate={false}
          />
        )}
      </div>
    </div>
  )
}
