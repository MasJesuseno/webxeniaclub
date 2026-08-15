"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateSiteProfile } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"
import { FileUpload } from "@/components/file-upload"

interface Profile {
  id: string
  clubName: string
  shortName: string
  slogan: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo: string | null
  favicon: string | null
  vision: string | null
  mission: string | null
  about: string | null
  history: string | null
  homeBanner: string | null
  primaryColor: string
  instagramUrl: string | null
  youtubeUrl: string | null
  facebookUrl: string | null
  twitterUrl: string | null
  memberCount: number | null
  cityCount: number | null
  establishedYear: string | null
  cardTemplateFront: string | null
  cardTemplateBack: string | null
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  organizationStructure: string | null
  jingleMp3: string | null
  momenSong: string | null
  momenSong2: string | null
  momenSongCaption: string | null
  momenSongCaption2: string | null
}

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [logo, setLogo] = useState(profile.logo || "")
  const [favicon, setFavicon] = useState(profile.favicon || "")
  const [homeBanner, setHomeBanner] = useState(profile.homeBanner || "")
  const [cardTemplateFront, setCardTemplateFront] = useState(profile.cardTemplateFront || "")
  const [cardTemplateBack, setCardTemplateBack] = useState(profile.cardTemplateBack || "")
  const [organizationStructure, setOrganizationStructure] = useState(profile.organizationStructure || "")
  const [jingleMp3, setJingleMp3] = useState(profile.jingleMp3 || "")
  const [momenSong, setMomenSong] = useState(profile.momenSong || "")
  const [momenSong2, setMomenSong2] = useState(profile.momenSong2 || "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    const form = new FormData(e.currentTarget)
    try {
      await updateSiteProfile(form)
      setMessage("Pengaturan berhasil disimpan!")
      router.refresh()
    } catch (err: any) {
      setMessage("Gagal menyimpan: " + (err?.message || "Terjadi kesalahan"))
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        {/* Informasi Umum */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informasi Umum
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap Club</label>
              <input type="text" name="clubName" defaultValue={profile.clubName} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Singkat</label>
              <input type="text" name="shortName" defaultValue={profile.shortName} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slogan</label>
              <input type="text" name="slogan" defaultValue={profile.slogan} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna Utama</label>
              <div className="flex gap-2">
                <input type="color" name="primaryColor" defaultValue={profile.primaryColor} className="w-12 h-10 rounded-lg cursor-pointer" />
                <input type="text" name="primaryColor_text" defaultValue={profile.primaryColor} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono" />
              </div>
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
            <textarea name="description" defaultValue={profile.description || ""} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
          </div>
        </section>

        {/* Logo & Banner */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Logo & Banner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <input type="hidden" name="logo" value={logo} />
              <ImageUpload value={logo} onChange={setLogo} label="Logo" hint="Rekomendasi: 400×400px (persegi) dengan latar transparan" />
            </div>
            <div>
              <input type="hidden" name="favicon" value={favicon} />
              <ImageUpload value={favicon} onChange={setFavicon} label="Favicon" hint="Rekomendasi: 32×32px atau 64×64px (ikon browser)" />
            </div>
          </div>
          <div className="mt-5">
            <input type="hidden" name="homeBanner" value={homeBanner} />
            <ImageUpload value={homeBanner} onChange={setHomeBanner} label="Banner Homepage" hint="Rekomendasi: 1920×800px (landscape lebar) untuk banner carousel home" />
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Visi, Misi & Tentang
          </h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tentang</label>
                <textarea name="about" defaultValue={profile.about || ""} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sejarah</label>
                <textarea name="history" defaultValue={profile.history || ""} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Visi</label>
              <textarea name="vision" defaultValue={profile.vision || ""} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Misi (pisahkan dengan baris baru)</label>
              <textarea name="mission" defaultValue={profile.mission || ""} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" placeholder="Misi 1&#10;Misi 2&#10;Misi 3" />
            </div>
          </div>
        </section>

        {/* Kontak */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Kontak & Statistik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
              <textarea name="address" defaultValue={profile.address || ""} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label>
              <input type="text" name="phone" defaultValue={profile.phone || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" name="email" defaultValue={profile.email || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Anggota</label>
                <input type="number" name="memberCount" defaultValue={profile.memberCount || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kota</label>
                <input type="number" name="cityCount" defaultValue={profile.cityCount || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun Berdiri</label>
                <input type="text" name="establishedYear" defaultValue={profile.establishedYear || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Media Sosial */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Media Sosial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
              <input type="url" name="instagramUrl" defaultValue={profile.instagramUrl || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="https://instagram.com/xeniaclub" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube</label>
              <input type="url" name="youtubeUrl" defaultValue={profile.youtubeUrl || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="https://youtube.com/@xeniaclub" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
              <input type="url" name="facebookUrl" defaultValue={profile.facebookUrl || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="https://facebook.com/xeniaclub" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Twitter / X</label>
              <input type="url" name="twitterUrl" defaultValue={profile.twitterUrl || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="https://twitter.com/xeniaclub" />
            </div>
          </div>
        </section>

        {/* Bank & Rekening Pembayaran */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Bank &amp; Rekening Pembayaran Member
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Informasi rekening untuk pembayaran iuran/iuran member.
            Data ini akan ditampilkan di halaman tagihan member.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Bank</label>
              <input
                type="text"
                name="bankName"
                defaultValue={profile.bankName || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                placeholder="Contoh: BCA, Mandiri, BNI"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Rekening</label>
              <input
                type="text"
                name="bankAccount"
                defaultValue={profile.bankAccount || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                placeholder="Contoh: 1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Atas Nama</label>
              <input
                type="text"
                name="bankAccountName"
                defaultValue={profile.bankAccountName || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                placeholder="Contoh: Yayasan Xenia Club Indonesia"
              />
            </div>
          </div>
        </section>

        {/* Struktur Organisasi */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Struktur Organisasi
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload gambar struktur organisasi club. Gambar ini akan ditampilkan di halaman Profil.
          </p>
          <div>
            <input type="hidden" name="organizationStructure" value={organizationStructure} />
            <ImageUpload value={organizationStructure} onChange={setOrganizationStructure} label="Gambar Struktur Organisasi" hint="Rekomendasi: ukuran landscape lebar (min. 1200×800px) dengan latar putih/transparan" />
          </div>
        </section>

        {/* Jingle MP3 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Jingle MP3
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload file audio jingle/lagu resmi club (format MP3).
            Audio akan diputar di halaman DXIC Member Area.
          </p>
          <div>
            <input type="hidden" name="jingleMp3" value={jingleMp3} />
            <FileUpload
              value={jingleMp3}
              onChange={setJingleMp3}
              label="File Jingle MP3"
              hint="Rekomendasi: file MP3 dengan kualitas tinggi, ukuran maksimal 10MB"
              accept=".mp3,.mpga,.wav,.ogg,.m4a,.aac"
            />
          </div>

          {/* Audio Preview */}
          {jingleMp3 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-red-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-red-500 flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Preview Audio</p>
                  <p className="text-xs text-gray-500">Klik play untuk mendengarkan</p>
                </div>
              </div>
              <audio
                controls
                src={jingleMp3}
                className="w-full h-10 rounded-lg"
                preload="metadata"
              >
                Browser tidak mendukung pemutar audio.
              </audio>
            </div>
          )}
        </section>

        {/* Momen Song */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Momen Song
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload lagu tema momen spesial club (format MP3).
            Audio akan diputar di halaman DXIC Member Area, di bawah Jingle.
          </p>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Caption Momen Song</label>
            <input
              type="text"
              name="momenSongCaption"
              defaultValue={profile.momenSongCaption || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              placeholder="Contoh: Lagu kebersamaan keluarga besar DXIC"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Menggantikan tulisan "Dengarkan lagu tema momen spesial" di Member Area. Kosongkan untuk memakai teks bawaan.
            </p>
          </div>
          <div>
            <input type="hidden" name="momenSong" value={momenSong} />
            <FileUpload
              value={momenSong}
              onChange={setMomenSong}
              label="File Momen Song MP3"
              hint="Rekomendasi: file MP3 dengan kualitas tinggi, ukuran maksimal 10MB"
              accept=".mp3,.mpga,.wav,.ogg,.m4a,.aac"
            />
          </div>

          {/* Audio Preview */}
          {momenSong && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Preview Momen Song</p>
                  <p className="text-xs text-gray-500">Klik play untuk mendengarkan</p>
                </div>
              </div>
              <audio
                controls
                src={momenSong}
                className="w-full h-10 rounded-lg"
                preload="metadata"
              >
                Browser tidak mendukung pemutar audio.
              </audio>
            </div>
          )}
        </section>

        {/* Momen Song 2 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Momen Song 2
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload lagu tema momen spesial kedua club (format MP3).
            Audio akan diputar di halaman DXIC Member Area, di bawah Momen Song.
          </p>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Caption Momen Song 2</label>
            <input
              type="text"
              name="momenSongCaption2"
              defaultValue={profile.momenSongCaption2 || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              placeholder="Contoh: Lagu perayaan anniversary DXIC"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Menggantikan tulisan "Dengarkan lagu tema momen spesial kedua" di Member Area. Kosongkan untuk memakai teks bawaan.
            </p>
          </div>
          <div>
            <input type="hidden" name="momenSong2" value={momenSong2} />
            <FileUpload
              value={momenSong2}
              onChange={setMomenSong2}
              label="File Momen Song 2 MP3"
              hint="Rekomendasi: file MP3 dengan kualitas tinggi, ukuran maksimal 10MB"
              accept=".mp3,.mpga,.wav,.ogg,.m4a,.aac"
            />
          </div>

          {/* Audio Preview */}
          {momenSong2 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Preview Momen Song 2</p>
                  <p className="text-xs text-gray-500">Klik play untuk mendengarkan</p>
                </div>
              </div>
              <audio
                controls
                src={momenSong2}
                className="w-full h-10 rounded-lg"
                preload="metadata"
              >
                Browser tidak mendukung pemutar audio.
              </audio>
            </div>
          )}
        </section>

        {/* Kartu Member */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Kartu Member
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload template kartu member bagian depan dan belakang (format JPG/PNG).
            Template akan digunakan sebagai latar belakang kartu member yang dicetak.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <input type="hidden" name="cardTemplateFront" value={cardTemplateFront} />
              <ImageUpload value={cardTemplateFront} onChange={setCardTemplateFront} label="Template Depan" hint="Rekomendasi: 53.98×85.60mm (ukuran kartu kredit), resolusi tinggi" />
            </div>
            <div>
              <input type="hidden" name="cardTemplateBack" value={cardTemplateBack} />
              <ImageUpload value={cardTemplateBack} onChange={setCardTemplateBack} label="Template Belakang" hint="Rekomendasi: ukuran sama dengan depan. Tidak perlu tulisan, hanya background" />
            </div>
          </div>
        </section>

        {/* Save Button */}
        {message && (
          <div className={`p-4 rounded-xl text-sm ${
            message.includes("berhasil") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {message}
          </div>
        )}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="dxic-gradient text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
