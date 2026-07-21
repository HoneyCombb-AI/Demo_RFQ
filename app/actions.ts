"use server"

import { cookies } from "next/headers"

// Code → org slug. No external imports, no path module, nothing that can
// fail during serverless module initialization.
const ORG_CODES: Record<string, string> = {
  "4521": "jal",
  "5281": "alm",
}

export async function loginWithCode(code: string) {
  const orgSlug = ORG_CODES[code]

  if (orgSlug) {
    const cookieStore = await cookies()
    cookieStore.set("org_code", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return { success: true, redirectUrl: `/${orgSlug}` }
  }

  return { error: "Invalid organization code" }
}
