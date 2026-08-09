import { Prisma } from "@prisma/client"

export interface BarangFilterParams {
  jenis?: string
  barangId?: string
  dari?: string
  sampai?: string
}

/**
 * Bangun filter Prisma untuk BarangTransaksi dari param query/form.
 * Dipakai bersama oleh halaman riwayat (page.tsx) dan action export
 * agar filter keduanya selalu konsisten. Tanggal tidak valid diabaikan.
 */
export function buildBarangTransaksiWhere(p: BarangFilterParams): Prisma.BarangTransaksiWhereInput {
  const where: Prisma.BarangTransaksiWhereInput = {}
  if (p.jenis === "Masuk" || p.jenis === "Keluar") where.jenis = p.jenis
  if (p.barangId) where.barangId = p.barangId

  const validDari = p.dari && !Number.isNaN(new Date(p.dari).getTime()) ? new Date(p.dari) : null
  const sampaiFull = p.sampai ? p.sampai + "T23:59:59.999" : ""
  const validSampai = p.sampai && !Number.isNaN(new Date(sampaiFull).getTime()) ? new Date(sampaiFull) : null
  if (validDari || validSampai) {
    where.tanggal = {
      ...(validDari ? { gte: validDari } : {}),
      ...(validSampai ? { lte: validSampai } : {}),
    }
  }
  return where
}
