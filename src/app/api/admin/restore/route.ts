import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { canAccessAdminMenu } from "@/lib/permissions"
import { restoreDatabase } from "@/lib/db-backup"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST /api/admin/restore — upload file .sql lalu restore database.
// Menerima form-data: file (File) + confirm (string harus "RESTORE").
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowed = await canAccessAdminMenu(session.user.id, "/admin/backup")
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const confirm = (formData.get("confirm") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "File backup (.sql) harus dipilih" }, { status: 400 })
    }
    if (!file.name.toLowerCase().endsWith(".sql")) {
      return NextResponse.json({ error: "File harus berekstensi .sql" }, { status: 400 })
    }
    if (confirm !== "RESTORE") {
      return NextResponse.json(
        { error: 'Konfirmasi salah. Ketik "RESTORE" untuk melanjutkan.' },
        { status: 400 }
      )
    }
    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 200MB" }, { status: 400 })
    }

    const sql = await file.text()
    if (!sql.trim()) {
      return NextResponse.json({ error: "File backup kosong" }, { status: 400 })
    }

    const result = await restoreDatabase(sql)

    return NextResponse.json({
      success: true,
      message: "Restore database berhasil.",
      stderr: result.stderr ? result.stderr.slice(0, 2000) : "",
    })
  } catch (error: any) {
    console.error("[RESTORE ERROR]", error)
    return NextResponse.json(
      { error: error?.message || "Restore gagal. Periksa file backup dan coba lagi." },
      { status: 500 }
    )
  }
}
