import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, otp, newPassword } = body

    if (!memberId || !otp || !newPassword) {
      return NextResponse.json(
        { error: "ID Member, OTP, dan password baru harus diisi" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter" },
        { status: 400 }
      )
    }

    // Cari member
    const member = await prisma.prospectiveMember.findFirst({
      where: { memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: "ID Member tidak ditemukan" },
        { status: 404 }
      )
    }

    // Verifikasi OTP
    if (!member.resetToken || member.resetToken !== otp) {
      return NextResponse.json(
        { error: "Kode OTP tidak valid" },
        { status: 400 }
      )
    }

    // Cek expiry
    if (!member.resetTokenExpiry || new Date() > member.resetTokenExpiry) {
      // OTP expired, hapus token
      await prisma.prospectiveMember.update({
        where: { id: member.id },
        data: { resetToken: null, resetTokenExpiry: null },
      })
      return NextResponse.json(
        { error: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." },
        { status: 400 }
      )
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password dan hapus token
    await prisma.prospectiveMember.update({
      where: { id: member.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    // Hapus "Remember Me" dari localStorage (client-side)
    return NextResponse.json({
      success: true,
      message: "Password berhasil direset. Silakan login dengan password baru.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
