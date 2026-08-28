import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export const runtime = "nodejs"

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Prevent path traversal - no .. allowed
    if (filename.includes("..")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }

    // Allow subdirectories like bukti/filename.jpg
    const safeFilename = filename.replace(/[^a-zA-Z0-9._/-]/g, "")

    const filePath = join(process.cwd(), "public", "uploads", safeFilename)

    // Read file
    const fileBuffer = await readFile(filePath)

    // Determine content type
    const ext = safeFilename.split(".").pop()?.toLowerCase() || ""
    const contentType = MIME_TYPES[`.${ext}`] || "application/octet-stream"

    // Return response with cache headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
    console.error("[UPLOADS ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
