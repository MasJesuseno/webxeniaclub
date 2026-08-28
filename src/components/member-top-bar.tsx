"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"

export function MemberTopBar({
  shortName,
  sosOpenCount: initialCount,
}: {
  shortName: string
  sosOpenCount: number
}) {
  const [sosCount, setSosCount] = useState(initialCount)

  const fetchSosCount = useCallback(async () => {
    try {
      const res = await fetch("/api/member/sos/count")
      if (res.ok) {
        const data = await res.json()
        setSosCount(data.count ?? 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    // Polling setiap 30 detik
    const interval = setInterval(fetchSosCount, 30_000)
    return () => clearInterval(interval)
  }, [fetchSosCount])

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm no-print">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold">
          {shortName.charAt(0)}
        </div>
        <span className="font-semibold text-sm">Member Area</span>
      </div>
      <div className="flex items-center gap-3">
        {/* SOS Notification */}
        {sosCount > 0 && (
          <Link
            href="/member/sos"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-lg px-2.5 py-1.5 transition-all"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
            </span>
            <span className="text-xs font-bold">{sosCount}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </Link>
        )}
        <div className="text-[10px] text-white/70">
          {shortName}
        </div>
      </div>
    </div>
  )
}
