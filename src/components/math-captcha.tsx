"use client"

import { useState, useEffect, useCallback } from "react"

type CaptchaData = {
  token: string
  question: string
}

type MathCaptchaProps = {
  onCaptchaChange?: (captcha: CaptchaData | null) => void
}

export function MathCaptcha({ onCaptchaChange }: MathCaptchaProps) {
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [captchaError, setCaptchaError] = useState(false)

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    setCaptchaError(false)
    setCaptchaAnswer("")
    try {
      const res = await fetch("/api/captcha")
      if (!res.ok) throw new Error("Failed to fetch captcha")
      const data = await res.json()
      setCaptcha({ token: data.token, question: data.question })
      onCaptchaChange?.({ token: data.token, question: data.question })
    } catch {
      setCaptchaError(true)
      setCaptcha(null)
      onCaptchaChange?.(null)
    } finally {
      setCaptchaLoading(false)
    }
  }, [onCaptchaChange])

  useEffect(() => {
    fetchCaptcha()
  }, [fetchCaptcha])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Verifikasi Keamanan <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-3">
        {/* Question display */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-300 rounded-xl min-w-[120px]">
          {captchaLoading ? (
            <span className="text-sm text-gray-400">Memuat...</span>
          ) : captchaError ? (
            <span className="text-sm text-red-500">Gagal memuat</span>
          ) : captcha ? (
            <span className="text-lg font-bold text-gray-800 tracking-widest select-none">
              {captcha.question} = ?
            </span>
          ) : (
            <span className="text-sm text-gray-400">Tidak tersedia</span>
          )}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={captchaLoading}
          className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
          title="Muat ulang soal"
        >
          <svg
            className={`w-5 h-5 ${captchaLoading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Answer input */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        name="captchaAnswer"
        value={captchaAnswer}
        onChange={(e) => setCaptchaAnswer(e.target.value)}
        placeholder="Masukkan jawaban..."
        required
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
      />

      {/* Hidden input for captcha token */}
      {captcha && (
        <input type="hidden" name="captchaToken" value={captcha.token} />
      )}
    </div>
  )
}
