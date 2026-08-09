import { getMemberSession } from "@/lib/member-auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { MemberCard } from "@/components/member-card"

export const dynamic = "force-dynamic"

export default async function MemberKartuPage({
  searchParams,
}: {
  searchParams: Promise<{ download?: string; side?: string }>
}) {
  const member = await getMemberSession()
  if (!member) redirect("/member/login")

  const { download, side } = await searchParams
  const showBack = side === "back"

  const profile = await prisma.siteProfile.findFirst()

  // Masa Berlaku diambil dari Data Member (member.masaBerlaku) sebagai sumber utama,
  // karena sudah tersinkron dari Tanggal Berlaku Periode Register saat status Lunas.
  let cardMasaBerlaku: string | null = null

  if (member.masaBerlaku) {
    cardMasaBerlaku = member.masaBerlaku.toISOString()
  } else if (member.memberId) {
    // Fallback: ambil Tanggal Berlaku dari periode tagihan Lunas terbaru dengan regisLang = "Ya"
    const lunasData = await prisma.registrationData.findMany({
      where: {
        memberId: member.memberId,
        status: "Lunas",
      },
      include: {
        registrationPeriod: true,
      },
    })

    const tanggalBerlakuList = lunasData
      .filter((d) => d.registrationPeriod.regisLang === "Ya")
      .map((d) => d.registrationPeriod.tanggalBerlaku)
      .filter((d): d is Date => !!d)

    if (tanggalBerlakuList.length > 0) {
      // Ambil tanggal berlaku terbaru (sort date)
      const latest = new Date(Math.max(...tanggalBerlakuList.map((d) => d.getTime())))
      cardMasaBerlaku = latest.toISOString()
    }
  }

  // Build profile URL for QR code
  const baseUrl = process.env.NEXTAUTH_URL || "http://192.168.1.53"
  const profileUrl = member.memberId ? `${baseUrl}/p/${member.memberId}` : null

  return (
    <div className="space-y-4">
      {/* Back button (hidden when printing) */}
      <div className="no-print">
        <a
          href="/member/tagihan"
          className="inline-flex items-center gap-1 text-xs text-red-600 font-medium hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Tagihan
        </a>
      </div>

      <MemberCard
        member={{
          namaPanggilan: member.namaPanggilan,
          namaLengkap: member.namaLengkap,
          foto: member.foto,
          memberId: member.memberId,
          masaBerlaku: cardMasaBerlaku,
        }}
        clubName={profile?.clubName || "DXIC"}
        shortName={profile?.shortName || "DXIC"}
        logo={profile?.logo}
        favicon={profile?.favicon}
        cardTemplateFront={profile?.cardTemplateFront}
        cardTemplateBack={profile?.cardTemplateBack}
        slogan={profile?.slogan}
        profileUrl={profileUrl}
        showBack={showBack}
        downloadImage={download === "true"}
      />

      {/* Side toggle + Download (hidden when printing) */}
      <div className="no-print space-y-3">
        {/* Toggle Depan/Belakang */}
        <div className="flex gap-2">
          <a
            href="/member/kartu"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              !showBack
                ? "dxic-gradient text-white shadow-lg"
                : "border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Depan
          </a>
          <a
            href="/member/kartu?side=back"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              showBack
                ? "dxic-gradient text-white shadow-lg"
                : "border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Belakang
          </a>
        </div>

        {/* Download button */}
        <a
          href={`/member/kartu?download=true${showBack ? "&side=back" : ""}`}
          className="flex items-center justify-center gap-1.5 py-2.5 w-full border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download {showBack ? "Kartu Belakang" : "Gambar"}
        </a>
      </div>
    </div>
  )
}
