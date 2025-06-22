import { Client, Account, Databases, Storage, Teams } from "appwrite"
import { Client as ServerClient, Account as ServerAccount, Databases as ServerDatabases, Storage as ServerStorage, Teams as ServerTeams } from "node-appwrite"
import { cookies } from "next/headers"

// Environment variables
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!

// Database and collection IDs
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "feedback-platform-db"
export const PROJECTS_COLLECTION_ID = process.env.APPWRITE_PROJECTS_COLLECTION_ID || "projects"
export const TASKS_COLLECTION_ID = process.env.APPWRITE_TASKS_COLLECTION_ID || "tasks"
export const STORAGE_BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || "task-screenshots"
export const DEVELOPERS_TEAM_ID = process.env.APPWRITE_DEVELOPERS_TEAM_ID || "developers-team"

// Standard client for Client Components
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)

// Export services for client-side use
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

// Export the client itself for realtime subscriptions
export { client }

// Re-export Appwrite utilities
export { ID, Query, Permission, Role } from "appwrite"

// Session client for server-side authenticated requests
export function createSessionClient(sessionId: string) {
  const sessionClient = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setSession(sessionId)

  return {
    get account() {
      return new Account(sessionClient)
    },
    get databases() {
      return new Databases(sessionClient)
    },
    get storage() {
      return new Storage(sessionClient)
    },
    get teams() {
      return new Teams(sessionClient)
    }
  }
}

// Admin client for privileged operations (server-side only)
export function createAdminClient() {
  const adminClient = new ServerClient()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY)

  return {
    get account() {
      return new ServerAccount(adminClient)
    },
    get databases() {
      return new ServerDatabases(adminClient)
    },
    get storage() {
      return new ServerStorage(adminClient)
    },
    get teams() {
      return new ServerTeams(adminClient)
    }
  }
}
