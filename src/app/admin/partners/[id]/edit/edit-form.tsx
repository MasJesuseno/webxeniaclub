"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { updatePartner } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"

interface Partner {
  id: string
  name: string
  logo: string
  description: string | null
  website: string | null
  locationLink: string | null
  benefit: string | null
  region: string | null
  order: number
  isActive: boolean
}

export function EditPartnerForm({ partner }: { partner: Partner }) {
  const router = useRouter()
  const [logo, setLogo] = useState(partner.logo || "")
  const updateWithId = updatePartner.bind(null, partner.id)
  const [state, formAction, pending] = useActionState(updateWithId, null)

  return (
    <form action={formAction} className="max-w-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
            <h3 className="font-semibold text-gray-900 text-lg">Informasi Mitra</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Mitra</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={partner.name}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Nama perusahaan/organisasi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input
                  type="url"
                  name="website"
                  defaultValue={partner.website || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={partner.description || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
                placeholder="Deskripsi singkat tentang mitra..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wilayah</label>
                <input
                  type="text"
                  name="region"
                  defaultValue={partner.region || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Contoh: Jabodetabek, Jawa Timur, Sumatera"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi</label>
                <input
                  type="text"
                  name="locationLink"
                  defaultValue={partner.locationLink || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Contoh: Semua cabang bengkel resmi di kota anda"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Benefit untuk Member</label>
                <input
                  type="text"
                  name="benefit"
                  defaultValue={partner.benefit || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Mis: Diskon 20% service"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <input type="hidden" name="logo" value={logo} />
            <ImageUpload
              value={logo}
              onChange={setLogo}
              label="Logo Mitra"
              hint="Rekomendasi: 400×400px (persegi) dengan latar transparan"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Pengaturan</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Urutan</label>
              <input
                type="number"
                name="order"
                defaultValue={partner.order}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={partner.isActive}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Tampilkan di halaman public</span>
              </label>
            </div>
          </div>

          {state?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={pending}
              className="w-full dxic-gradient text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
            <a
              href="/admin/partners"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Batal
            </a>
          </div>
        </div>
      </div>
    </form>
  )
}
