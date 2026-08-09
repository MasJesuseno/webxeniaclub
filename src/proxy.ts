import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes with NextAuth
  if (pathname.startsWith("/admin")) {
    const session = await auth()
    if (!session?.user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Teruskan pathname ke aplikasi agar admin layout bisa melakukan
    // pengecekan izin menu (RBAC) fresh ke database per request.
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-pathname", pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Protect /member routes with member auth (check cookie and verify token)
  if (pathname.startsWith("/member")) {
    // Allow access to login page
    if (pathname === "/member/login") {
      return NextResponse.next()
    }

    const token = request.cookies.get("member_token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/member/login", request.url))
    }

    // Verify the token using Edge Runtime-compatible verification
    try {
      const { verifyMemberToken } = await import("@/lib/member-token")
      const payload = await verifyMemberToken(token)
      if (!payload) {
        return NextResponse.redirect(new URL("/member/login", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/member/login", request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
}
