import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { User, Task } from "./types"

interface AppState {
  user: User | null
  tasks: Task[]
  isLoading: boolean
  setUser: (user: User | null) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      user: null,
      tasks: [],
      isLoading: false,
      setUser: (user) => set({ user }),
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.$id === taskId ? { ...task, ...updates } : task)),
        })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: "feedback-platform-store" },
  ),
)
