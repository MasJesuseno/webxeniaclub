import { getMemberSession } from "@/lib/member-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const member = await getMemberSession()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!member.canUpdateKegiatan) {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin untuk menambahkan kegiatan" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tanggal, region, namaKegiatan, uraian, lokasi, kontakPerson } = body

    if (!tanggal) {
      return NextResponse.json({ error: "Tanggal harus diisi" }, { status: 400 })
    }
    if (!region || !region.trim()) {
      return NextResponse.json({ error: "Region / Provinsi harus diisi" }, { status: 400 })
    }
    if (!namaKegiatan || !namaKegiatan.trim()) {
      return NextResponse.json({ error: "Nama kegiatan harus diisi" }, { status: 400 })
    }
    if (!lokasi || !lokasi.trim()) {
      return NextResponse.json({ error: "Lokasi harus diisi" }, { status: 400 })
    }
    if (!kontakPerson || !kontakPerson.trim()) {
      return NextResponse.json({ error: "Kontak Person harus diisi" }, { status: 400 })
    }

    await prisma.kegiatan.create({
      data: {
        tanggal: new Date(tanggal),
        region: region.trim(),
        namaKegiatan: namaKegiatan.trim(),
        uraian: uraian?.trim() || null,
        lokasi: lokasi.trim(),
        kontakPerson: kontakPerson.trim(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Create kegiatan error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
