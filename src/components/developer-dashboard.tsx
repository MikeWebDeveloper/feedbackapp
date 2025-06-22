"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppStore } from "@/src/lib/store"
import { databases, account, DATABASE_ID, TASKS_COLLECTION_ID, client } from "@/src/lib/appwrite"
import { Query } from "appwrite"
import type { Task } from "@/src/lib/types"
import { TaskDetailDialog } from "./task-detail-dialog"
import { Header } from "./header"

export function DeveloperDashboard() {
  const { user, tasks, setTasks, addTask, updateTask, setUser } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await account.get()
        setUser({
          $id: currentUser.$id,
          email: currentUser.email,
          name: currentUser.name,
          isDeveloper: true,
        })
      } catch (error) {
        console.error("Failed to get user:", error)
      }
    }

    initializeUser()
  }, [setUser])

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
          Query.orderDesc("$createdAt"),
        ])
        setTasks(response.documents as Task[])
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllTasks()
  }, [setTasks])

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${TASKS_COLLECTION_ID}.documents`,
      (response) => {
        const task = response.payload as Task

        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          addTask(task)
        } else if (response.events.includes("databases.*.collections.*.documents.*.update")) {
          updateTask(task.$id, task)
        }
      },
    )

    return () => {
      unsubscribe()
    }
  }, [addTask, updateTask])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading feedback...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const openTasks = tasks.filter((task) => task.status === "open").length
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
  const closedTasks = tasks.filter((task) => task.status === "closed").length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Developer Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage and track all user feedback across projects</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{openTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{closedTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">No feedback submitted yet</p>
                <p>Feedback will appear here as users submit it</p>
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
                        {task.description.length > 150 ? `${task.description.substring(0, 150)}...` : task.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
                      <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(task.submittedByName || "Unknown")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{task.submittedByName || "Unknown User"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(task.$createdAt).toLocaleDateString()}
                    </div>
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
            showStatusUpdate={true}
          />
        )}
      </div>
    </div>
  )
}
