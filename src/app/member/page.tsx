"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MemberGPS } from "@/components/member-gps"
import { ImageUpload } from "@/components/image-upload"

interface GPSData {
  latitude: number
  longitude: number
  accuracy: number
  label?: string
}

interface MemberData {
  id: string
  memberId: string
  namaLengkap: string
  namaPanggilan: string
  noWa: string
  email: string
  provinsi: string
  kotaKabupaten: string
  region: string
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: string
  alamatLengkap: string
  jenisMobil: string
  tipeMobil: string
  tahunProduksi: number
  warna: string
  noPolisi: string
  foto: string
  golonganDarah: string
  ukuranKaos: string
  statusMember: string
  masaBerlaku: string
  lastLatitude: number
  lastLongitude: number
  lastLocationLabel: string
  lastLocationAt: string
  lastLoginAt: string
  isOnline: boolean
  tagihanCount: number
  pendingCount: number
}

export default function MemberProfilePage() {
  const router = useRouter()
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [locationUpdateMsg, setLocationUpdateMsg] = useState("")
  const [foto, setFoto] = useState("")

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/member/me")
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/member/login")
          return
        }
        throw new Error("Gagal memuat profil")
      }
      const data = await res.json()
      setMember(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function handleLogout() {
    await fetch("/api/member/logout", { method: "POST" })
    // Tandai di tab ini agar login otomatis ("Ingat ID & Password")
    // tidak langsung login ulang setelah logout.
    try {
      sessionStorage.setItem("member_logged_out", "1")
    } catch {}
    router.push("/member/login")
    router.refresh()
  }

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg("")

    const formData = new FormData(e.currentTarget)
    const data: Record<string, any> = {}

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        data[key] = value
      }
    }

    // Add foto state (only if changed)
    if (foto) data.foto = foto

    // If password fields are filled, verify they match
    if (data.password && data.password !== data.passwordConfirm) {
      setSaveMsg("Password dan konfirmasi password tidak cocok")
      setSaving(false)
      return
    }
    if (data.password === "") {
      delete data.password
    }
    delete data.passwordConfirm

    try {
      const res = await fetch("/api/member/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setSaveMsg("Profil berhasil diperbarui!")
        setEditMode(false)
        fetchProfile()
      } else {
        const result = await res.json()
        setSaveMsg(result.error || "Gagal memperbarui profil")
      }
    } catch {
      setSaveMsg("Terjadi kesalahan")
    } finally {
      setSaving(false)
    }
  }

  const handleLocationCapture = useCallback(
    async (gps: GPSData) => {
      setLocationUpdateMsg("Memperbarui lokasi...")
      try {
        const res = await fetch("/api/member/location", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: gps.latitude,
            longitude: gps.longitude,
            locationLabel: gps.label,
          }),
        })
        if (res.ok) {
          setLocationUpdateMsg("Lokasi berhasil diperbarui!")
          setTimeout(() => setLocationUpdateMsg(""), 3000)
          fetchProfile()
        }
      } catch {
        setLocationUpdateMsg("Gagal memperbarui lokasi")
      }
    },
    [fetchProfile]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-red-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Memuat profil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchProfile() }}
            className="text-sm text-red-600 underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  if (!member) return null

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {member.foto ? (
              <img src={member.foto} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              member.namaLengkap.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{member.namaLengkap}</h2>
            <p className="text-white/80 text-sm">ID: {member.memberId}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`w-2 h-2 rounded-full ${member.isOnline ? "bg-green-400" : "bg-gray-400"}`} />
              <span className="text-xs text-white/70">{member.isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{member.tagihanCount}</p>
          <p className="text-xs text-gray-500">Total Tagihan</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-amber-600">{member.pendingCount}</p>
          <p className="text-xs text-gray-500">Belum Lunas</p>
        </div>
      </div>

      {/* Profile Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Data Profil</h3>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-red-600 text-xs font-medium hover:underline"
          >
            {editMode ? "Batal" : "Edit"}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleUpdateProfile} className="p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500">Region</label>
              <input
                name="region"
                defaultValue={member.region || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Contoh: Jabodetabek, Jawa Timur..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Nama Lengkap</label>
              <input
                name="namaLengkap"
                defaultValue={member.namaLengkap || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Nama Panggilan</label>
              <input
                name="namaPanggilan"
                defaultValue={member.namaPanggilan || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Jenis Kendaraan</label>
              <select
                name="jenisMobil"
                defaultValue={member.jenisMobil || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
              >
                <option value="">Pilih jenis kendaraan</option>
                <option value="Xenia">Xenia</option>
                <option value="Non Xenia">Non Xenia</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">No. WhatsApp</label>
              <input
                name="noWa"
                defaultValue={member.noWa || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={member.email || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Tempat Lahir</label>
              <input
                name="tempatLahir"
                defaultValue={member.tempatLahir || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Kota tempat lahir"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Tanggal Lahir</label>
              <input
                name="tanggalLahir"
                type="date"
                defaultValue={member.tanggalLahir ? new Date(member.tanggalLahir).toISOString().split("T")[0] : ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Golongan Darah</label>
              <select
                name="golonganDarah"
                defaultValue={member.golonganDarah || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
              >
                <option value="">Pilih golongan darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Ukuran Kaos</label>
              <input
                name="ukuranKaos"
                defaultValue={member.ukuranKaos || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Contoh: L, XL, XXL, 5XL, dst."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Alamat Lengkap</label>
              <textarea
                name="alamatLengkap"
                defaultValue={member.alamatLengkap || ""}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Kota/Kabupaten</label>
              <input
                name="kotaKabupaten"
                defaultValue={member.kotaKabupaten || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Provinsi</label>
              <input
                name="provinsi"
                defaultValue={member.provinsi || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">No. Polisi</label>
              <input
                name="noPolisi"
                defaultValue={member.noPolisi || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none uppercase"
                placeholder="Contoh: B 1234 XYZ"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Warna</label>
              <input
                name="warna"
                defaultValue={member.warna || ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Contoh: Hitam, Putih, Silver"
              />
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-100 pt-3 mt-2">
              <h4 className="text-xs font-semibold text-gray-700 mb-3">Ubah Password</h4>
              <p className="text-xs text-gray-400 mb-3">Kosongkan jika tidak ingin mengubah password</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Password Baru</label>
                  <input
                    name="password"
                    type="password"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Min 6 karakter"
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Konfirmasi Password</label>
                  <input
                    name="passwordConfirm"
                    type="password"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Ulangi password baru"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Upload Foto */}
            <div className="border-t border-gray-100 pt-3 mt-2">
              <h4 className="text-xs font-semibold text-gray-700 mb-3">Upload Foto</h4>
              <ImageUpload value={foto || member.foto} onChange={setFoto} label="Foto Diri" hint="Rekomendasi: 400×400px (persegi), foto wajah jelas" />
            </div>

            {saveMsg && (
              <p className={`text-xs ${saveMsg.includes("berhasil") ? "text-green-600" : "text-red-600"}`}>
                {saveMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full dxic-gradient text-white py-2.5 rounded-xl font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        ) : (
          <div className="divide-y divide-gray-50">
            <ProfileRow label="Nama Lengkap" value={member.namaLengkap} />
            <ProfileRow label="Nama Panggilan" value={member.namaPanggilan || "-"} />
            <ProfileRow label="ID Member" value={member.memberId || "-"} />
            <ProfileRow label="No. WhatsApp" value={member.noWa || "-"} />
            <ProfileRow label="Email" value={member.email || "-"} />
            <ProfileRow label="Provinsi" value={member.provinsi || "-"} />
            <ProfileRow label="Kota/Kabupaten" value={member.kotaKabupaten || "-"} />
            <ProfileRow label="Region" value={member.region || "-"} />
            <ProfileRow label="Mobil" value={`${member.jenisMobil} ${member.tipeMobil} (${member.tahunProduksi || "-"})`} />
            <ProfileRow label="No. Polisi" value={member.noPolisi || "-"} />
            <ProfileRow label="Warna" value={member.warna || "-"} />
            <ProfileRow label="Ukuran Kaos" value={member.ukuranKaos || "-"} />
            {member.statusMember && <ProfileRow label="Status Member" value={member.statusMember} />}
          </div>
        )}
      </div>

      {/* Location Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Lokasi Login
        </h3>

        {member.lastLocationLabel ? (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700">{member.lastLocationLabel}</p>
            <p className="text-xs text-gray-400 mt-1">
              Terakhir: {member.lastLocationAt ? new Date(member.lastLocationAt).toLocaleString("id-ID") : "-"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-3">Belum ada data lokasi</p>
        )}

        {locationUpdateMsg && (
          <p className={`text-xs mb-2 ${locationUpdateMsg.includes("berhasil") ? "text-green-600" : "text-blue-600"}`}>
            {locationUpdateMsg}
          </p>
        )}

        <MemberGPS
          onLocationCapture={handleLocationCapture}
          buttonLabel="Refresh Lokasi"
          showLabel={false}
        />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
      >
        Keluar
      </button>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}
