"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginWithCode(code: string) {
  // Hardcoded for now. 4521 = JAL
  if (code === "4521") {
    // Await the cookies() promise (Next.js 15+ requirement)
    const cookieStore = await cookies()
    cookieStore.set("org_code", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    
    return { success: true, redirectUrl: "/jal" }
  }

  // If wrong code, return an error message
  return { error: "Invalid organization code" }
}
