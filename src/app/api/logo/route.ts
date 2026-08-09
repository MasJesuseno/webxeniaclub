import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const profile = await prisma.siteProfile.findFirst({
      select: { logo: true, shortName: true },
    })
    return NextResponse.json({
      logoUrl: profile?.logo || null,
      shortName: profile?.shortName || "DXIC",
    })
  } catch {
    return NextResponse.json({
      logoUrl: null,
      shortName: "DXIC",
    })
  }
}
