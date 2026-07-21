"use server"

import { cookies } from "next/headers"
import { getOrgByCode } from "@/lib/org-config"

export async function loginWithCode(code: string) {
  const org = getOrgByCode(code)

  if (org) {
    const cookieStore = await cookies()
    cookieStore.set("org_code", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true, redirectUrl: `/${org.slug}` }
  }

  return { error: "Invalid organization code" }
}
