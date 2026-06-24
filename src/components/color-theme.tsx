"use client"

import { useEffect } from "react"

export function ColorTheme({ primaryColor = "#DC2626" }: { primaryColor?: string }) {
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", primaryColor)
    document.documentElement.style.setProperty("--primary-dark", adjustColor(primaryColor, -20))
    document.documentElement.style.setProperty("--primary-light", primaryColor + "20")
  }, [primaryColor])

  return null
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent))
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
