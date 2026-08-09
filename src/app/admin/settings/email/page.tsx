import { auth } from "@/lib/auth"
import { getEmailSettings } from "@/lib/email"
import { EmailSettingsForm } from "./email-settings-form"

export default async function AdminEmailSettingsPage() {
  const [settings, session] = await Promise.all([
    getEmailSettings(),
    auth(),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Email SMTP</h1>
      <p className="text-sm text-gray-500 mb-6">
        Konfigurasi mail server untuk pengiriman email notifikasi (mis. pemberitahuan pembayaran ke Bendahara).
      </p>
      {/* Password tidak dikirim ke browser — form hanya tahu apakah sudah tersimpan */}
      <EmailSettingsForm
        settings={{ ...settings, password: "" }}
        hasPassword={!!settings.password}
        adminEmail={session?.user?.email || ""}
      />
    </div>
  )
}
