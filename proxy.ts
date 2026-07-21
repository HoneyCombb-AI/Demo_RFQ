import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// Map each org route prefix to the code required to access it.
const ORG_ROUTE_CODES: Record<string, string> = {
  '/jal': '4521',
  '/alm': '5281',
}

export function proxy(request: NextRequest) {
  // Get the org code from the cookie
  const orgCode = request.cookies.get('org_code')?.value
  const { pathname } = request.nextUrl

  // Find the org route being accessed (if any) and enforce its code
  for (const [prefix, requiredCode] of Object.entries(ORG_ROUTE_CODES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!orgCode || orgCode !== requiredCode) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      break
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
