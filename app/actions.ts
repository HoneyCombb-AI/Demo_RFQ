"use server"

const CODE_MAP: Record<string, string> = {
  "4521": "/jal",
  "5281": "/almity",
  "1001": "/generic",
  "1324": "/sauto",
  "8191": "/obsc",
}

export async function loginWithCode(
  code: string
): Promise<{ error?: string; success?: boolean; redirectUrl?: string }> {
  const route = CODE_MAP[code]
  if (!route) {
    return { error: "Invalid code. Please try again." }
  }
  return { success: true, redirectUrl: route }
}

