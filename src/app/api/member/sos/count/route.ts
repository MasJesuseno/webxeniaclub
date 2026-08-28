import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

export async function GET() {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const count = await prisma.sosMessage.count({ where: { status: "Open" } })
  return NextResponse.json({ count })
}
