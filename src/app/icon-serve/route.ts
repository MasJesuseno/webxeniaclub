import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export const runtime = "nodejs"

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".gif": "image/gif",
  ".webp": "image/webp",
}

export async function GET() {
  let logoUrl = "/uploads/logo-placeholder.svg"

  try {
    const profile = await prisma.siteProfile.findFirst({
      select: { logo: true },
    })
    if (profile?.logo) {
      logoUrl = profile.logo
    }
  } catch (e) {
    console.error("icon-serve: failed to fetch logo URL", e)
  }

  try {
    // Normalize path: /api/uploads/x -> uploads/x (file is in public/uploads/)
    let normalizedPath = logoUrl.replace(/^\//, "")
    if (normalizedPath.startsWith("api/uploads/")) {
      normalizedPath = normalizedPath.replace("api/uploads/", "uploads/")
    }
    const filePath = path.join(process.cwd(), "public", normalizedPath)
    const imageBuffer = await fs.readFile(filePath)
    const ext = path.extname(logoUrl).toLowerCase()
    const contentType = MIME_MAP[ext] || "image/png"

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  } catch (e) {
    console.error("icon-serve: failed to read file", e)

    const fallback = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    )
    return new NextResponse(fallback, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-cache" },
    })
  }
}
