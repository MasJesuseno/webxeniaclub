import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params

    if (!memberId) {
      return NextResponse.json({ error: "ID Member diperlukan" }, { status: 400 })
    }

    const member = await prisma.prospectiveMember.findFirst({
      where: { memberId },
      select: {
        namaLengkap: true,
        namaPanggilan: true,
        foto: true,
        memberId: true,
        status: true,
        statusMember: true,
        jenisMobil: true,
        tipeMobil: true,
        warna: true,
        noPolisi: true,
        kotaKabupaten: true,
        provinsi: true,
        region: true,
        masaBerlaku: true,
        isOnline: true,
      },
    })

    if (!member || member.statusMember === "Black List" || (member.status !== "Diterima" && member.statusMember !== "Aktif")) {
      return NextResponse.json({ error: "Member tidak ditemukan atau tidak aktif" }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error("Public member profile error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
