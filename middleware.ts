import { type NextRequest, NextResponse } from "next/server"
import { getLoggedInUser } from "./src/lib/auth"

export async function middleware(request: NextRequest) {
  const user = await getLoggedInUser()
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ["/login", "/register"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Developer-only routes
  const developerRoutes = ["/dashboard/developer"]
  const isDeveloperRoute = developerRoutes.some((route) => pathname.startsWith(route))

  // Redirect logic
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isDeveloperRoute && (!user || !user.isDeveloper)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
