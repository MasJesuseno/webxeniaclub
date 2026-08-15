"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MemberGPS } from "@/components/member-gps"

interface GPSData {
  latitude: number
  longitude: number
  accuracy: number
  label?: string
}

const REMEMBER_KEY = "member_remembered_credentials"
const LOGOUT_FLAG_KEY = "member_logged_out"

interface RememberedCredentials {
  memberId: string
  password: string
}

function loadRememberedCredentials(): RememberedCredentials | null {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (typeof data?.memberId === "string" && typeof data?.password === "string") {
      return data
    }
  } catch {
    // ignore
  }
  return null
}

function saveRememberedCredentials(creds: RememberedCredentials | null) {
  try {
    if (creds) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify(creds))
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
  } catch {
    // ignore
  }
}

export default function MemberLoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [gpsLocation, setGpsLocation] = useState<GPSData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [shortName, setShortName] = useState("DXIC")
  const [rememberMe, setRememberMe] = useState(false)
  const [memberId, setMemberId] = useState("")
  const [password, setPassword] = useState("")
  const autoLoginAttempted = useRef(false)

  useEffect(() => {
    fetch("/api/logo")
      .then((res) => res.json())
      .then((data) => {
        if (data.logoUrl) setLogoUrl(data.logoUrl)
        if (data.shortName) setShortName(data.shortName)
      })
      .catch(() => {})

    ;(async () => {
      // Muat kredensial tersimpan & isi otomatis form
      const remembered = loadRememberedCredentials()
      if (!remembered) return
      setRememberMe(true)
      setMemberId(remembered.memberId)
      setPassword(remembered.password)

      // Login otomatis — kecuali user baru saja logout di tab ini
      if (autoLoginAttempted.current) return
      autoLoginAttempted.current = true
      try {
        if (sessionStorage.getItem(LOGOUT_FLAG_KEY) === "1") return
      } catch {
        // ignore
      }

      setLoading(true)
      try {
        const res = await fetch("/api/member/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: remembered.memberId, password: remembered.password }),
        })
        const data = await res.json()
        if (res.ok) {
          router.push("/member")
          router.refresh()
          return
        }
        setError(data.error || "Login gagal")
      } catch {
        setError("Terjadi kesalahan saat login otomatis")
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const memberIdValue = formData.get("memberId") as string
    const passwordValue = formData.get("password") as string

    // Login first
    const res = await fetch("/api/member/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: memberIdValue, password: passwordValue }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Login gagal")
      setLoading(false)
      return
    }

    // Simpan / hapus kredensial sesuai opsi "Ingat ID & Password"
    if (rememberMe) {
      saveRememberedCredentials({ memberId: memberIdValue, password: passwordValue })
    } else {
      saveRememberedCredentials(null)
    }

    // Update location after successful login
    if (gpsLocation) {
      await fetch("/api/member/location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          locationLabel: gpsLocation.label,
        }),
      }).catch(() => {})
    }

    router.push("/member")
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={shortName}
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
          ) : (
            <div className="w-16 h-16 dxic-gradient rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
              {shortName.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            Member {shortName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Masuk untuk mengakses area member
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
              name="memberId"
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Masukkan ID Member"
              autoCapitalize="characters"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="Masukkan password"
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

          {/* Ingat ID & Password */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              <span className="font-medium">Ingat ID &amp; Password</span>
              <span className="block text-xs text-gray-400">
                Simpan di perangkat ini agar login berikutnya otomatis tanpa mengetik ulang
              </span>
            </span>
          </label>

          {/* GPS Location Capture */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ambil lokasi Anda untuk absensi login dan fitur Near Me
            </p>
            <MemberGPS
              onLocationCapture={setGpsLocation}
              buttonLabel="Ambil Lokasi Login"
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
              "Masuk"
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Belum punya akun?{" "}
            <a href="/" className="text-red-600 hover:underline font-medium">
              Hubungi admin
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
