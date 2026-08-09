import { prisma } from "@/lib/prisma"
import { buildBarangTransaksiWhere } from "@/lib/barang-filter"
import { BarangMasukKeluarManager } from "./barang-masuk-keluar-manager"

const PAGE_SIZE = 10

export default async function AdminBarangMasukKeluarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; jenis?: string; barangId?: string; dari?: string; sampai?: string }>
}) {
  const params = await searchParams

  const requestedPage = Math.max(1, parseInt(params.page || "", 10) || 1)
  const jenis = params.jenis === "Masuk" || params.jenis === "Keluar" ? params.jenis : ""
  const barangId = params.barangId || ""
  const dari = params.dari || ""
  const sampai = params.sampai || ""

  // Filter server-side agar riwayat tidak diambil semua sekaligus
  const where = buildBarangTransaksiWhere({ jenis, barangId, dari, sampai })

  const [barangs, totalCount, totalMasukAgg, totalKeluarAgg] = await Promise.all([
    prisma.barang.findMany({ orderBy: { nama: "asc" } }),
    prisma.barangTransaksi.count({ where }),
    prisma.barangTransaksi.aggregate({ _sum: { jumlah: true }, where: { ...where, jenis: "Masuk" } }),
    prisma.barangTransaksi.aggregate({ _sum: { jumlah: true }, where: { ...where, jenis: "Keluar" } }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)

  const transaksis = await prisma.barangTransaksi.findMany({
    where,
    include: { barang: { select: { nama: true } } },
    orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Masuk / Keluar Barang</h1>
      <p className="text-sm text-gray-500 mb-6">
        Catat pergerakan stok barang. Jika barang <span className="font-medium text-emerald-600">Masuk</span>, stok
        bertambah; jika <span className="font-medium text-red-600">Keluar</span>, stok berkurang. Stok tidak akan
        berkurang melebihi stok yang tersedia.
      </p>
      <BarangMasukKeluarManager
        barangs={barangs}
        transaksis={transaksis}
        totalCount={totalCount}
        page={currentPage}
        totalPages={totalPages}
        filterJenis={jenis}
        filterBarangId={barangId}
        filterDari={dari}
        filterSampai={sampai}
        totalMasuk={totalMasukAgg._sum.jumlah || 0}
        totalKeluar={totalKeluarAgg._sum.jumlah || 0}
      />
    </div>
  )
}
