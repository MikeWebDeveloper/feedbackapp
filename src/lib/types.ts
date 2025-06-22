export interface User {
  $id: string
  email: string
  name: string
  isDeveloper?: boolean
}

export interface Project {
  $id: string
  name: string
  description: string
  $createdAt: string
  $updatedAt: string
}

export interface Task {
  $id: string
  title: string
  description: string
  type: "bug" | "improvement" | "feature"
  status: "open" | "in-progress" | "closed"
  projectId: string
  submittedBy: string
  submittedByName: string
  screenshotId?: string
  $createdAt: string
  $updatedAt: string
  project?: Project
}

export type TaskType = "bug" | "improvement" | "feature"
export type TaskStatus = "open" | "in-progress" | "closed"
