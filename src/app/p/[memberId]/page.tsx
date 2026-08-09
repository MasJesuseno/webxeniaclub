import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function PublicMemberProfilePage({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = await params

  const member = await prisma.prospectiveMember.findFirst({
    where: { memberId },
  })

  if (!member || member.statusMember === "Black List" || (member.status !== "Diterima" && member.statusMember !== "Aktif")) {
    notFound()
  }

  const profile = await prisma.siteProfile.findFirst()

  const initial = member.namaLengkap.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="dxic-gradient px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            {/* Photo */}
            <div className="relative z-10 inline-flex mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden shadow-lg mx-auto">
                {member.foto ? (
                  <img src={member.foto} alt={member.namaLengkap} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                    {initial}
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-xl font-bold text-white relative z-10">{member.namaLengkap}</h1>
            {member.namaPanggilan && (
              <p className="text-sm text-white/70 relative z-10 mt-0.5">@{member.namaPanggilan}</p>
            )}
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-white/15 rounded-full text-xs text-white/90 relative z-10">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0l-4 4m0 0l4 4m-4-4h12" />
              </svg>
              ID {member.memberId}
            </div>

            {/* Status badge */}
            {member.isOnline && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/80 rounded-full text-[10px] text-white font-medium">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Online
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-5">
            {/* Club Info */}
            {profile?.shortName && (
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                {profile?.logo ? (
                  <img src={profile.logo} alt={profile.shortName} className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 dxic-gradient rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {profile.shortName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{profile.clubName}</p>
                  <p className="text-xs text-gray-500">Anggota {profile.shortName}</p>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {member.jenisMobil && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Mobil</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{member.jenisMobil}</p>
                  {member.tipeMobil && (
                    <p className="text-xs text-gray-500">{member.tipeMobil}</p>
                  )}
                </div>
              )}
              {member.noPolisi && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">No. Polisi</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 font-mono">{member.noPolisi}</p>
                </div>
              )}
              {member.warna && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Warna</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{member.warna}</p>
                </div>
              )}
              {member.kotaKabupaten && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Kota</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{member.kotaKabupaten}</p>
                  {member.provinsi && (
                    <p className="text-xs text-gray-500">{member.provinsi}</p>
                  )}
                </div>
              )}
              {member.region && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Region</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{member.region}</p>
                </div>
              )}
              {member.masaBerlaku && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Masa Berlaku</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {new Date(member.masaBerlaku).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Verified Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Anggota terverifikasi — {profile?.clubName || "DXIC"}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {profile?.clubName || "DXIC"}
          </Link>
        </div>
      </div>
    </div>
  )
}
