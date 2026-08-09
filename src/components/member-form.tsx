"use client"

import { useActionState, useState, useEffect, useRef } from "react"
import { submitMemberRegistration } from "@/lib/actions"
import { MathCaptcha } from "@/components/math-captcha"
import { ImageUpload } from "@/components/image-upload"

interface MemberFormProps {
  bankName?: string | null
  bankAccount?: string | null
  bankAccountName?: string | null
}

export function MemberForm({ bankName, bankAccount, bankAccountName }: MemberFormProps) {
  const [state, formAction, pending] = useActionState(submitMemberRegistration, null)
  const [captchaKey, setCaptchaKey] = useState(0)
  const [foto, setFoto] = useState("")
  const [fotoSim, setFotoSim] = useState("")
  const [fotoMobilDepan, setFotoMobilDepan] = useState("")
  const [fotoMobilSamping, setFotoMobilSamping] = useState("")
  const [fotoBuktiTransfer, setFotoBuktiTransfer] = useState("")
  const prevStateRef = useRef(state)

  // Watch state changes to refresh captcha on error or success
  useEffect(() => {
    if (state !== prevStateRef.current) {
      prevStateRef.current = state
      if (state && ("captchaError" in state || "success" in state)) {
        setCaptchaKey((k) => k + 1)
      }
    }
  }, [state])

  if (state?.success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Terkirim!</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Terima kasih! Data calon member Anda sudah kami terima. 
          Tim kami akan memproses dan menghubungi Anda melalui WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Data Pribadi */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Data Pribadi
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" name="namaLengkap" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Nama lengkap sesuai KTP" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Panggilan</label>
            <input type="text" name="namaPanggilan" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Nama panggilan sehari-hari" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin <span className="text-red-500">*</span></label>
            <select name="jenisKelamin" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white">
              <option value="">Pilih jenis kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tempat Lahir</label>
            <input type="text" name="tempatLahir" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Kota tempat lahir" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Lahir</label>
            <input type="date" name="tanggalLahir" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Golongan Darah</label>
            <select name="golonganDarah" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white">
              <option value="">Pilih golongan darah</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">No. WhatsApp <span className="text-red-500">*</span></label>
            <input type="tel" name="noWa" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="08xxxxx" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input type="email" name="email" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ukuran Kaos</label>
            <select name="ukuranKaos" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white">
              <option value="">Pilih ukuran</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alamat */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Alamat
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap</label>
            <textarea name="alamatLengkap" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kota/Kabupaten</label>
            <input type="text" name="kotaKabupaten" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Kota tinggal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi</label>
            <input type="text" name="provinsi" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Provinsi" />
          </div>
        </div>
      </div>

      {/* Data Mobil */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          Data Mobil
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Mobil <span className="text-red-500">*</span></label>
            <select name="jenisMobil" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white">
              <option value="">Pilih jenis mobil</option>
              <option value="Xenia">Xenia</option>
              <option value="Non Xenia">Non Xenia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Mobil <span className="text-red-500">*</span></label>
            <input type="text" name="tipeMobil" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Xenia 1.3 Deluxe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun Produksi <span className="text-red-500">*</span></label>
            <input type="number" name="tahunProduksi" required min="2004" max="2030" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: 2015" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna</label>
            <input type="text" name="warna" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Warna mobil" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Polisi <span className="text-red-500">*</span></label>
            <input type="text" name="noPolisi" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm uppercase" placeholder="Contoh: B 1234 XYZ" />
          </div>
        </div>
      </div>

      {/* Alasan Bergabung */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Alasan Bergabung
        </h4>
        <textarea name="alasanBergabung" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" placeholder="Ceritakan alasan Anda ingin bergabung dengan DXIC..." />
      </div>

      {/* Uploads */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload Dokumen
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input type="hidden" name="foto" value={foto} />
            <ImageUpload value={foto} onChange={setFoto} label="Foto Diri" hint="Rekomendasi: 400×400px (persegi), foto wajah jelas" />
          </div>
          <div>
            <input type="hidden" name="fotoSim" value={fotoSim} />
            <ImageUpload value={fotoSim} onChange={setFotoSim} label="Upload SIM" hint="Foto SIM (depan & belakang digabung)" />
          </div>
          <div>
            <input type="hidden" name="fotoMobilDepan" value={fotoMobilDepan} />
            <ImageUpload value={fotoMobilDepan} onChange={setFotoMobilDepan} label="Foto Mobil Tampak Depan" hint="Foto mobil dari depan, pastikan plat nomor terlihat" />
          </div>
          <div>
            <input type="hidden" name="fotoMobilSamping" value={fotoMobilSamping} />
            <ImageUpload value={fotoMobilSamping} onChange={setFotoMobilSamping} label="Foto Mobil Tampak Samping" hint="Foto mobil dari samping, pastikan plat nomor terlihat" />
          </div>
        </div>

        {/* Biaya Pendaftaran */}
        <div className="mt-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 shrink-0 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h2m4 0h4M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="text-sm font-bold text-amber-900">Biaya Pendaftaran</div>
              <div className="text-2xl font-extrabold text-amber-700">Rp 285.000,-</div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Biaya pendaftaran tersebut akan mendapatkan <span className="font-semibold">starter kit</span> berupa:
              </p>
              <ul className="text-xs text-amber-800 space-y-1.5">
                {["Kaos DXIC", "Sticker Depan", "Sticker Belakang"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              {bankAccount && (
                <div className="pt-2 mt-1 border-t border-amber-200 text-xs text-amber-900">
                  <span className="font-semibold">Transfer ke:</span> {bankName || "Bank"} — {bankAccount}
                  {bankAccountName ? ` a.n. ${bankAccountName}` : ""}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Bukti Transfer */}
        <div className="mt-4">
          <input type="hidden" name="fotoBuktiTransfer" value={fotoBuktiTransfer} />
          <ImageUpload
            value={fotoBuktiTransfer}
            onChange={setFotoBuktiTransfer}
            label="Upload Bukti Transfer"
            hint="Screenshot atau foto bukti transfer biaya pendaftaran (Rp 285.000,-)"
          />
        </div>
      </div>

      {/* Captcha */}
      <div>
        <MathCaptcha key={captchaKey} />
      </div>

      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full dxic-gradient text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
      >
        {pending ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Mengirim...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Kirim Pendaftaran
          </>
        )}
      </button>
    </form>
  )
}
