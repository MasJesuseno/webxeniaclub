"use client"

import { useActionState, useState, useEffect, useRef } from "react"
import { submitComment } from "@/lib/actions"
import { MathCaptcha } from "@/components/math-captcha"

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(submitComment, null)
  const [captchaKey, setCaptchaKey] = useState(0)
  const prevStateRef = useRef(state)

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
      <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-200">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-1">Komentar Terkirim!</h4>
        <p className="text-sm text-gray-500">Komentar Anda akan muncul setelah disetujui oleh admin.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="postId" value={postId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nama <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="cf-name"
            name="name"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
            placeholder="Nama Anda"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="cf-email"
            name="email"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
            placeholder="email@anda.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-content" className="block text-sm font-medium text-gray-700 mb-1">
          Komentar <span className="text-red-500">*</span>
        </label>
        <textarea
          id="cf-content"
          name="content"
          required
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm resize-none"
          placeholder="Tulis komentar Anda..."
        />
      </div>

      <MathCaptcha key={captchaKey} />

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="dxic-gradient text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
      >
        {pending ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Mengirim...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Kirim Komentar
          </>
        )}
      </button>
    </form>
  )
}
