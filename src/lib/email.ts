import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"
import { prisma } from "@/lib/prisma"

// Kunci-kunci pengaturan SMTP yang disimpan di tabel Setting (key-value).
export const EMAIL_SETTING_KEYS = [
  "smtp_host",
  "smtp_port",
  "smtp_secure",
  "smtp_user",
  "smtp_password",
  "smtp_from_email",
  "smtp_from_name",
] as const

export interface EmailSettings {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  fromEmail: string
  fromName: string
}

/** Ambil pengaturan SMTP dari database. */
export async function getEmailSettings(): Promise<EmailSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...EMAIL_SETTING_KEYS] } },
  })
  const map = new Map(rows.map((r) => [r.key, r.value]))

  const port = parseInt(map.get("smtp_port") || "", 10)

  return {
    host: map.get("smtp_host") || "",
    port: Number.isFinite(port) && port > 0 ? port : 587,
    secure: map.get("smtp_secure") === "true",
    user: map.get("smtp_user") || "",
    password: map.get("smtp_password") || "",
    fromEmail: map.get("smtp_from_email") || "",
    fromName: map.get("smtp_from_name") || "",
  }
}

/** Simpan pengaturan SMTP ke database (nilai kosong = tidak diubah). */
export async function saveEmailSettings(settings: Partial<EmailSettings>) {
  const entries: [string, string][] = []

  if (settings.host !== undefined) entries.push(["smtp_host", settings.host])
  if (settings.port !== undefined) entries.push(["smtp_port", String(settings.port)])
  if (settings.secure !== undefined) entries.push(["smtp_secure", String(settings.secure)])
  if (settings.user !== undefined) entries.push(["smtp_user", settings.user])
  if (settings.password) entries.push(["smtp_password", settings.password])
  if (settings.fromEmail !== undefined) entries.push(["smtp_from_email", settings.fromEmail])
  if (settings.fromName !== undefined) entries.push(["smtp_from_name", settings.fromName])

  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }
}

/** Buat transporter nodemailer dari pengaturan yang diberikan (boleh belum disimpan). */
export function createSmtpTransport(settings: EmailSettings): Transporter {
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.user ? { user: settings.user, pass: settings.password } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  })
}

export interface SendEmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

/**
 * Kirim email via SMTP yang dikonfigurasi di database.
 * Dipakai untuk fitur notifikasi (mis. pemberitahuan pembayaran ke Bendahara).
 */
export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; message: string }> {
  const settings = await getEmailSettings()

  if (!settings.host) {
    return { success: false, message: "Konfigurasi SMTP belum diatur. Buka Menu Pengaturan → Email SMTP." }
  }
  if (!settings.fromEmail) {
    return { success: false, message: "Email pengirim (From) belum diatur di pengaturan SMTP." }
  }
  if (!opts.to) {
    return { success: false, message: "Alamat email penerima kosong." }
  }

  const transporter = createSmtpTransport(settings)

  try {
    await transporter.sendMail({
      from: settings.fromName
        ? `"${settings.fromName}" <${settings.fromEmail}>`
        : settings.fromEmail,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    })
    return { success: true, message: `Email terkirim ke ${opts.to}` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, message: `Gagal mengirim email: ${msg}` }
  }
}
