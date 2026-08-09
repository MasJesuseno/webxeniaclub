import { getMemberSession } from "@/lib/member-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const member = await getMemberSession()
    if (!member || !member.memberId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tagihan = await prisma.registrationData.findMany({
      where: {
        memberId: member.memberId,
      },
      include: {
        registrationPeriod: {
          select: {
            id: true,
            period: true,
            biaya: true,
            tanggalBerlaku: true,
            batasAkhir: true,
            regisLang: true,
          },
        },
      },
      orderBy: { tanggalTagihan: "desc" },
    })

    // Get bank info from SiteProfile
    const siteProfile = await prisma.siteProfile.findFirst({
      select: {
        bankName: true,
        bankAccount: true,
        bankAccountName: true,
      },
    })

    return NextResponse.json({
      tagihan,
      bank: siteProfile
        ? {
            name: siteProfile.bankName,
            account: siteProfile.bankAccount,
            accountName: siteProfile.bankAccountName,
          }
        : null,
    })
  } catch (error) {
    console.error("Tagihan error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
