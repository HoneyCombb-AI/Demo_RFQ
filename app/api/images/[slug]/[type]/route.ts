import { NextRequest } from "next/server"
import { resolveSlug, getImagePath } from "@/lib/server-data"
import fs from "fs/promises"

type Params = {
  params: Promise<{ slug: string; type: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  const { slug, type } = await params

  if (type !== "ballooned" && type !== "original") {
    return new Response("Invalid image type", { status: 400 })
  }

  try {
    const folderName = await resolveSlug(slug)
    if (!folderName) {
      return new Response("Part not found", { status: 404 })
    }

    const imagePath = getImagePath(folderName, type as "ballooned" | "original")
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
