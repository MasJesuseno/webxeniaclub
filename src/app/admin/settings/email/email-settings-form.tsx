"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveEmailSettingsAction, testEmailSmtpAction } from "@/lib/actions"

interface EmailSettingsFormData {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  fromEmail: string
  fromName: string
}

interface StatusMessage {
  type: "success" | "error"
  text: string
}

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function EmailSettingsForm({
  settings,
  hasPassword,
  adminEmail,
}: {
  settings: EmailSettingsFormData
  hasPassword: boolean
  adminEmail: string
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<StatusMessage | null>(null)
  // Default penerima uji = alamat email pengirim SMTP (mis. info@xeniaclub.or.id)
  const [recipient, setRecipient] = useState(settings.fromEmail || adminEmail)

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const res = await saveEmailSettingsAction(new FormData(e.currentTarget))
      if (res?.error) {
        setStatus({ type: "error", text: res.error })
      } else {
        setStatus({ type: "success", text: res?.message || "Pengaturan email berhasil disimpan" })
        router.refresh()
      }
    } catch (err) {
      setStatus({ type: "error", text: "Gagal menyimpan: " + errorText(err) })
    }
    setSaving(false)
  }

  async function handleTest(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const form = e.currentTarget.form
    if (!form) return
    setTesting(true)
    setStatus(null)
    try {
      const formData = new FormData(form)
      formData.set("recipient", recipient)
      const res = await testEmailSmtpAction(formData)
      if (res?.error) {
        setStatus({ type: "error", text: res.error })
      } else {
        setStatus({ type: "success", text: res?.message || "Email uji berhasil terkirim" })
      }
    } catch (err) {
      setStatus({ type: "error", text: "Gagal menguji: " + errorText(err) })
    }
    setTesting(false)
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Konfigurasi SMTP */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Mail Server (SMTP)
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Gunakan akun mail server Anda (mis. Gmail: smtp.gmail.com, atau server email hosting).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>SMTP Host</label>
            <input type="text" name="smtp_host" defaultValue={settings.host} required placeholder="smtp.gmail.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Port</label>
            <input type="number" name="smtp_port" defaultValue={settings.port || 587} required min={1} max={65535} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">465 = SSL, 587 = STARTTLS</p>
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input type="text" name="smtp_user" defaultValue={settings.user} autoComplete="off" placeholder="email@domain.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              name="smtp_password"
              autoComplete="new-password"
              placeholder={hasPassword ? "•••••••• (sudah disimpan — kosongkan jika tidak diubah)" : "Password SMTP"}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email Pengirim (From)</label>
            <input type="email" name="smtp_from_email" defaultValue={settings.fromEmail} required placeholder="no-reply@xeniaclub.or.id" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nama Pengirim</label>
            <input type="text" name="smtp_from_name" defaultValue={settings.fromName} placeholder="DXIC Xeniaclub" className={inputClass} />
          </div>
        </div>

        <div className="mt-5">
          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              name="smtp_secure"
              value="true"
              defaultChecked={settings.secure}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Gunakan koneksi aman (SSL/TLS)</span>
          </label>
        </div>
      </section>

      {/* Uji SMTP */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Uji Koneksi SMTP
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Kirim email uji untuk memastikan konfigurasi SMTP berfungsi. Pengujian memakai nilai form di atas
          (belum perlu disimpan dulu). Penerima diisi otomatis dengan alamat email pengirim (SMTP).
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className={labelClass}>Kirim ke alamat email</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              className={inputClass}
              placeholder="info@xeniaclub.or.id"
            />
          </div>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 shrink-0"
          >
            {testing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menguji...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Kirim Email Uji
              </>
            )}
          </button>
        </div>
      </section>

      {/* Status */}
      {status && (
        <div className={`p-4 rounded-xl text-sm ${
          status.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          <p className="whitespace-pre-wrap break-words">{status.text}</p>
        </div>
      )}

      {/* Save */}
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
    </form>
  )
}
