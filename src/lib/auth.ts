import { cookies } from "next/headers"
import { createSessionClient, createAdminClient, DEVELOPERS_TEAM_ID } from "./appwrite"
import type { User } from "./types"

export async function getLoggedInUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session) return null

    const { account, teams } = createSessionClient(session.value)
    const user = await account.get()

    // Check if user is a developer
    let isDeveloper = false
    try {
      const memberships = await teams.listMemberships(DEVELOPERS_TEAM_ID)
      isDeveloper = memberships.memberships.some((m) => m.userId === user.$id)
    } catch (error) {
      // User is not in developers team or team doesn't exist
      isDeveloper = false
    }

    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
      isDeveloper,
    }
  } catch (error) {
    return null
  }
}

export async function createSession(email: string, password: string) {
  const { account } = createAdminClient()
  const session = await account.createEmailPasswordSession(email, password)

  const cookieStore = await cookies()
  cookieStore.set("session", session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    expires: new Date(session.expire),
    path: "/",
  })

  return session
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (session) {
    const { account } = createSessionClient(session.value)
    await account.deleteSession("current")
    cookieStore.delete("session")
  }
}
