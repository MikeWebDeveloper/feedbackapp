import { redirect } from "next/navigation"
import { getLoggedInUser } from "@/src/lib/auth"

export default async function HomePage() {
  const user = await getLoggedInUser()

  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
