import { getMemberSession } from "@/lib/member-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(request: Request) {
  try {
    const member = await getMemberSession()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const allowedFields = [
      "namaLengkap",
      "namaPanggilan",
      "noWa",
      "email",
      "alamatLengkap",
      "kotaKabupaten",
      "provinsi",
      "noPolisi",
      "warna",
      "jenisMobil",
      "tempatLahir",
      "golonganDarah",
      "ukuranKaos",
      "foto",
    ]

    const data: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field] || null
      }
    }

    // Handle tanggalLahir (datetime field)
    if (body.tanggalLahir !== undefined) {
      data.tanggalLahir = body.tanggalLahir ? new Date(body.tanggalLahir) : null
    }

    // Handle password (hash with bcrypt)
    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10)
    }

    await prisma.prospectiveMember.update({
      where: { id: member.id },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
