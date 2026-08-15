export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length).replace(/\s+\S*$/, "") + "..."
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "")
}

/** Escape nilai agar aman disisipkan ke dalam HTML (mis. template email). */
export function escapeHtml(value: string | null | undefined): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Format tanggal aman: kembalikan label "—" bila tanggal tidak valid. */
export function formatDateSafe(value: string | Date | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

/** Format "waktu relatif" dalam Bahasa Indonesia (mis. "5 menit lalu"). */
export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return "Baru saja"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
