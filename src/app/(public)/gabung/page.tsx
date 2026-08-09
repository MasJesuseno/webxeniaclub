import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { MemberForm } from "@/components/member-form"

export default async function GabungPage() {
  const profile = await prisma.siteProfile.findFirst()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="dxic-gradient py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white">Gabung Member</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Pendaftaran Anggota {profile?.shortName || "DXIC"}</h1>
          <p className="text-white/80 mt-2">
            Isi data diri Anda dengan lengkap untuk bergabung bersama komunitas kami
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto dxic-gradient rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Formulir Pendaftaran Member</h2>
            <p className="text-gray-500 mt-1">
              Semua data akan diproses oleh tim kami dan dikonfirmasi melalui WhatsApp
            </p>
          </div>

          <MemberForm
            bankName={profile?.bankName || null}
            bankAccount={profile?.bankAccount || null}
            bankAccountName={profile?.bankAccountName || null}
          />
        </div>

        {/* Note */}
        <div className="flex items-center gap-3 justify-center mt-8 text-sm text-gray-500">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Sudah menjadi member? <Link href="/member/login" className="text-red-600 font-medium hover:text-red-700 transition-colors">Masuk di sini</Link></span>
        </div>
      </div>
    </div>
  )
}
