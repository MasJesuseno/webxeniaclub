import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, email } = body

    if (!memberId || !email) {
      return NextResponse.json(
        { error: "ID Member dan email harus diisi" },
        { status: 400 }
      )
    }

    // Cari member berdasarkan memberId
    const member = await prisma.prospectiveMember.findFirst({
      where: { memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: "ID Member tidak ditemukan" },
        { status: 404 }
      )
    }

    // Pastikan email cocok
    if (member.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email tidak cocok dengan data member" },
        { status: 400 }
      )
    }

    // Pastikan member aktif
    if (member.status !== "Diterima" && member.statusMember !== "Aktif") {
      return NextResponse.json(
        { error: "Akun belum aktif. Hubungi admin." },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 menit

    // Simpan OTP ke database
    await prisma.prospectiveMember.update({
      where: { id: member.id },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiry,
      },
    })

    // Kirim OTP via email
    const emailResult = await sendEmail({
      to: email,
      subject: "Reset Password - DXIC Member",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">DXIC Member</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Reset Password</p>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px;">Halo <strong>${member.namaLengkap}</strong>,</p>
            <p style="color: #374151;">Kami menerima permintaan reset password untuk akun Anda.</p>
            <p style="color: #374151;">Gunakan kode OTP berikut:</p>
            <div style="background: white; border: 2px dashed #DC2626; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #DC2626; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Kode ini berlaku selama <strong>15 menit</strong>.</p>
            <p style="color: #6b7280; font-size: 14px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </div>
          <div style="text-align: center; padding: 15px; color: #9ca3af; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} DXIC - Daihatsu Xenia Indonesia Club</p>
          </div>
        </div>
      `,
      text: `Reset Password DXIC Member\n\nHalo ${member.namaLengkap},\nKode OTP Anda: ${otp}\nBerlaku selama 15 menit.`,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Gagal mengirim email: ${emailResult.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Kode OTP telah dikirim ke ${email}`,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
