import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { canAccessAdminMenu } from "@/lib/permissions"
import { dumpDatabase } from "@/lib/db-backup"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/admin/backup — unduh file SQL dump database (backup).
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowed = await canAccessAdminMenu(session.user.id, "/admin/backup")
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { sql, filename } = await dumpDatabase()

    return new NextResponse(sql, {
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("[BACKUP ERROR]", error)
    return NextResponse.json(
      { error: error?.message || "Backup gagal. Pastikan mysqldump tersedia di server." },
      { status: 500 }
    )
  }
}
