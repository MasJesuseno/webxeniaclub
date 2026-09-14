"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [memberId, setMemberId] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [shortName, setShortName] = useState("DXIC")

  // Load logo sekali
  useEffect(() => {
    fetch("/api/logo")
      .then((r) => r.json())
      .then((d) => {
        if (d.logoUrl) setLogoUrl(d.logoUrl)
        if (d.shortName) setShortName(d.shortName)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/member/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: memberId.trim(), email: email.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Gagal mengirim kode OTP")
      }
    } catch {
      setError("Terjadi kesalahan jaringan")
    } finally {
      setLoading(false)
    }
  }

  // Jika OTP sudah terkirim, tampilkan form reset
  if (success) {
    return <ResetPasswordForm memberId={memberId.trim()} shortName={shortName} logoUrl={logoUrl} />
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={shortName} className="w-20 h-20 object-contain mx-auto mb-4" />
          ) : (
            <div className="w-16 h-16 dxic-gradient rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
              {shortName.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Lupa Password?</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan ID Member dan email untuk menerima kode OTP reset password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-1.5">
              ID Member
            </label>
            <input
              type="text"
              id="memberId"
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              autoCapitalize="characters"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Masukkan ID Member Anda"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Terdaftar
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Masukkan email yang terdaftar"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full dxic-gradient text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengirim...
              </>
            ) : (
              "Kirim Kode OTP"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/member/login" className="text-sm text-red-600 hover:underline font-medium">
            ← Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ====================== */
/* Komumen Form Reset OTP */
/* ====================== */
function ResetPasswordForm({
  memberId,
  shortName,
  logoUrl,
}: {
  memberId: string
  shortName: string
  logoUrl: string | null
}) {
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok")
      return
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/member/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, otp: otp.trim(), newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        // Hapus remembered credentials
        try {
          localStorage.removeItem("member_remembered_credentials")
        } catch {}
        setSuccess(true)
      } else {
        setError(data.error || "Gagal reset password")
      }
    } catch {
      setError("Terjadi kesalahan jaringan")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-full text-center">
          {logoUrl ? (
            <img src={logoUrl} alt={shortName} className="w-20 h-20 object-contain mx-auto mb-4" />
          ) : (
            <div className="w-16 h-16 dxic-gradient rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
              {shortName.charAt(0)}
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Silakan login dengan password baru Anda.
            </p>
            <Link
              href="/member/login"
              className="block w-full dxic-gradient text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all text-center"
            >
              Login Sekarang
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full">
        <div className="text-center mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={shortName} className="w-20 h-20 object-contain mx-auto mb-4" />
          ) : (
            <div className="w-16 h-16 dxic-gradient rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
              {shortName.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan kode OTP yang dikirim ke email Anda
          </p>
        </div>

        <form onSubmit={handleReset} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1.5">
              Kode OTP (6 digit)
            </label>
            <input
              type="text"
              id="otp"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="000000"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="Min 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Ulangi password baru"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full dxic-gradient text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/member/login" className="text-sm text-red-600 hover:underline font-medium">
            ← Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}
