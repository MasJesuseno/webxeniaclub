import { getMemberSession } from "@/lib/member-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { escapeHtml, formatDateSafe } from "@/lib/utils"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const member = await getMemberSession()
    if (!member || !member.memberId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const registrationDataId = formData.get("registrationDataId") as string
    const tanggalBayar = formData.get("tanggalBayar") as string
    const file = formData.get("bukti") as File

    if (!registrationDataId || !file) {
      return NextResponse.json(
        { error: "Data tagihan dan bukti transfer harus diisi" },
        { status: 400 }
      )
    }

    // Verify this registration belongs to the member
    const registration = await prisma.registrationData.findFirst({
      where: {
        id: registrationDataId,
        memberId: member.memberId,
      },
      include: {
        registrationPeriod: {
          select: {
            id: true,
            period: true,
            biaya: true,
            regisLang: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: "Data tagihan tidak ditemukan" },
        { status: 404 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file harus JPG, PNG, atau PDF" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      )
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads", "bukti")
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `bukti_${member.memberId}_${registrationDataId}_${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const fotoBukti = `/uploads/bukti/${fileName}`

    // Update registration data
    const updateData: any = {
      fotoBukti,
      status: "Menunggu Verifikasi",
    }

    if (tanggalBayar) {
      updateData.tanggalBayar = new Date(tanggalBayar)
    }

    await prisma.registrationData.update({
      where: { id: registrationDataId },
      data: updateData,
    })

    // ── Notifikasi email ke admin ber-role Bendahara ──
    // Gagal kirim email TIDAK membuat upload gagal — cukup dicatat di log.
    try {
      const bendaharaUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          notifyEmail: true,
          roles: { some: { role: { name: "bendahara" } } },
        },
        select: { id: true, email: true, name: true },
      })

      if (bendaharaUsers.length > 0) {
        const period = registration.registrationPeriod
        const periodName = period?.period || "Periode tidak diketahui"
        const biaya = registration.biaya ?? period?.biaya ?? 0
        const isLanjutan = period?.regisLang === "Ya"
        const paymentDesc = `Biaya Registrasi Periode ${periodName}${isLanjutan ? " (Registrasi Lanjutan)" : ""}`
        const formattedBiaya = `Rp ${biaya.toLocaleString("id-ID")}`

        const baseUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "")
        const buktiUrl = baseUrl ? `${baseUrl}${fotoBukti}` : fotoBukti
        const adminUrl = baseUrl ? `${baseUrl}/admin/registration-data` : "/admin/registration-data"
        const tanggalBayarLabel = formatDateSafe(tanggalBayar)

        for (const user of bendaharaUsers) {
          if (!user.email) continue

          const subject = `Bukti Transfer Baru — ${registration.namaMember} (${registration.memberId || "-"})`
          const text = [
            `Halo ${user.name || "Admin"},`,
            "",
            `Member berikut telah mengunggah bukti transfer:`,
            `• Member ID: ${registration.memberId || "-"}`,
            `• Nama: ${registration.namaMember}`,
            `• Pembayaran: ${paymentDesc}`,
            `• Jumlah: ${formattedBiaya}`,
            `• Tanggal Transfer: ${tanggalBayarLabel}`,
            `• Status: Menunggu Verifikasi`,
            "",
            `Lihat bukti transfer: ${buktiUrl}`,
            `Kelola di panel admin: ${adminUrl}`,
          ].join("\n")
          // Nilai dari member/admin di-escape agar tidak terjadi HTML injection di email
          const escMemberId = escapeHtml(registration.memberId || "-")
          const escNama = escapeHtml(registration.namaMember)
          const escPaymentDesc = escapeHtml(paymentDesc)
          const escTanggalBayar = escapeHtml(tanggalBayarLabel)
          const escAdminName = escapeHtml(user.name || "Admin")
          const html = `
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
              <div style="background:#DC2626;padding:20px 24px">
                <h2 style="margin:0;color:#fff;font-size:18px">📩 Bukti Transfer Baru</h2>
              </div>
              <div style="padding:24px">
                <p style="margin:0 0 16px;color:#374151;font-size:14px">
                  Halo <strong>${escAdminName}</strong>, member berikut telah mengunggah bukti transfer dan menunggu verifikasi Anda:
                </p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
                  <tr>
                    <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600;width:40%">Member ID</td>
                    <td style="padding:8px 12px;border:1px solid #eee">${escMemberId}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Nama</td>
                    <td style="padding:8px 12px;border:1px solid #eee">${escNama}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Pembayaran</td>
                    <td style="padding:8px 12px;border:1px solid #eee">${escPaymentDesc}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Jumlah</td>
                    <td style="padding:8px 12px;border:1px solid #eee">${formattedBiaya}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Tanggal Transfer</td>
                    <td style="padding:8px 12px;border:1px solid #eee">${escTanggalBayar}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #eee;font-weight:600">Status</td>
                    <td style="padding:8px 12px;border:1px solid #eee"><span style="background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:999px;font-size:12px">Menunggu Verifikasi</span></td>
                  </tr>
                </table>
                <div style="margin-top:20px">
                  <a href="${buktiUrl}" style="display:inline-block;background:#DC2626;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">Lihat Bukti Transfer</a>
                  <a href="${adminUrl}" style="display:inline-block;margin-left:8px;color:#DC2626;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;border:1px solid #DC2626">Buka Panel Admin</a>
                </div>
              </div>
            </div>
          `.trim()

          const result = await sendEmail({ to: user.email, subject, text, html })
          if (!result.success) {
            console.warn(`Notifikasi email bendahara (${user.email}) gagal: ${result.message}`)
          }
        }
      }
    } catch (err) {
      console.error("Notifikasi email bendahara error:", err)
    }

    return NextResponse.json({ success: true, fotoBukti })
  } catch (error) {
    console.error("Upload bukti error:", error)
    return NextResponse.json(
      { error: "Gagal mengupload bukti transfer" },
      { status: 500 }
    )
  }
}
