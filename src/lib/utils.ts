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
