import { NextRequest } from "next/server"
import { resolveSlug, findImageFile } from "@/lib/server-data"
import fs from "fs/promises"

type Params = {
  params: Promise<{ org: string; slug: string; type: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  const { org, slug, type } = await params

  if (type !== "ballooned" && type !== "original") {
    return new Response("Invalid image type", { status: 400 })
  }

  const pageParam = request.nextUrl.searchParams.get("page")
  const page = pageParam ? parseInt(pageParam, 10) : 1

  try {
    const folderName = await resolveSlug(slug, org)
    if (!folderName) {
      return new Response("Part not found", { status: 404 })
    }

    const imagePath = await findImageFile(folderName, type as "ballooned" | "original", org, page)
    if (!imagePath) {
      return new Response("Image not found", { status: 404 })
    }

    const fileBuffer = await fs.readFile(imagePath)

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return new Response("Image not found", { status: 404 })
  }
}
