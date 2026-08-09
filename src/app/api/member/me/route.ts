import { getMemberSession } from "@/lib/member-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const member = await getMemberSession()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!member.memberId) {
      return NextResponse.json({ error: "Member ID tidak ditemukan" }, { status: 400 })
    }

    // Get registration data count
    const tagihanCount = await prisma.registrationData.count({
      where: {
        memberId: member.memberId,
      },
    })

    const pendingCount = await prisma.registrationData.count({
      where: {
        memberId: member.memberId,
        status: { not: "Lunas" },
      },
    })

    return NextResponse.json({
      id: member.id,
      memberId: member.memberId,
      namaLengkap: member.namaLengkap,
      namaPanggilan: member.namaPanggilan,
      noWa: member.noWa,
      email: member.email,
      provinsi: member.provinsi,
      kotaKabupaten: member.kotaKabupaten,
      region: member.region,
      jenisKelamin: member.jenisKelamin,
      tempatLahir: member.tempatLahir,
      tanggalLahir: member.tanggalLahir,
      alamatLengkap: member.alamatLengkap,
      jenisMobil: member.jenisMobil,
      tipeMobil: member.tipeMobil,
      tahunProduksi: member.tahunProduksi,
      warna: member.warna,
      noPolisi: member.noPolisi,
      golonganDarah: member.golonganDarah,
      ukuranKaos: member.ukuranKaos,
      foto: member.foto,
      statusMember: member.statusMember,
      masaBerlaku: member.masaBerlaku,
      lastLatitude: member.lastLatitude,
      lastLongitude: member.lastLongitude,
      lastLocationLabel: member.lastLocationLabel,
      lastLocationAt: member.lastLocationAt,
      lastLoginAt: member.lastLoginAt,
      isOnline: member.isOnline,
      tagihanCount,
      pendingCount,
    })
  } catch (error) {
    console.error("Member me error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
