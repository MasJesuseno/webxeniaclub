import { prisma } from "@/lib/prisma"
import { KegiatanManager } from "./kegiatan-manager"

export default async function AdminKegiatanPage() {
  const [items, regions] = await Promise.all([
    prisma.kegiatan.findMany({
      orderBy: { tanggal: "desc" },
    }),
    prisma.region.findMany({
      orderBy: { region: "asc" },
    }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kegiatan</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola daftar kegiatan. Tambahkan, edit, atau hapus data kegiatan beserta informasi tanggal, region, lokasi, dan kontak person.
      </p>
      <KegiatanManager items={items} regions={regions} />
    </div>
  )
}
