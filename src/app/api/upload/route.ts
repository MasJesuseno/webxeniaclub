import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diupload" }, { status: 400 })
    }

    const allowedTypes = [
      "image/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "audio/",
    ]

    const isAllowed = allowedTypes.some((t) => file.type.startsWith(t) || file.type === t)
    if (!isAllowed) {
      return NextResponse.json({ error: "File harus berupa gambar, PDF, dokumen, atau MP3 (max 10MB)" }, { status: 400 })
    }

    const maxSize = file.type.startsWith("image/") ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const label = file.type.startsWith("image/") ? "5MB" : "10MB"
      return NextResponse.json({ error: `Ukuran file maksimal ${label}` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/api/uploads/${filename}` })
  } catch (error: any) {
    console.error("[UPLOAD ERROR]", error)
    return NextResponse.json({ error: error?.message || "Gagal mengupload file" }, { status: 500 })
  }
}
