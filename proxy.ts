import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function proxy(request: NextRequest) {
  // Get the org code from the cookie
  const orgCode = request.cookies.get('org_code')?.value

  // Check if they are trying to access a JAL route
  if (request.nextUrl.pathname.startsWith('/jal')) {
    // If no org code, or incorrect org code, redirect back to home/login
    if (!orgCode || orgCode !== "4521") {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
