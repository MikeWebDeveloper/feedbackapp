import { redirect } from "next/navigation"
import { getLoggedInUser } from "@/src/lib/auth"
import { UserDashboard } from "@/src/components/user-dashboard"
import { DeveloperDashboard } from "@/src/components/developer-dashboard"

export default async function DashboardPage() {
  const user = await getLoggedInUser()

  if (!user) {
    redirect("/login")
  }

  if (user.isDeveloper) {
    return <DeveloperDashboard />
  }

  return <UserDashboard />
}
