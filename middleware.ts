import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow access to auth pages when not authenticated
    if (req.nextUrl.pathname.startsWith("/auth/")) {
      return NextResponse.next()
    }

    // Redirect to signin if not authenticated
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Allow access to protected routes when authenticated
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true
        }
        
        // Require token for all other pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     * - icons/ (PWA icons)
     * - public files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
} 