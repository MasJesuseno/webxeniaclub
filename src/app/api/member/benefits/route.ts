import { getMemberSession } from "@/lib/member-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const member = await getMemberSession()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const partners = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        website: true,
        benefit: true,
        locationLink: true,
        region: true,
      },
    })

    return NextResponse.json({ benefits: partners })
  } catch (error) {
    console.error("Benefits error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
