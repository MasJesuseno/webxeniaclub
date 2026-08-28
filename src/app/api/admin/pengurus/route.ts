import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pengurus = await prisma.pengurus.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json({ pengurus })
}
