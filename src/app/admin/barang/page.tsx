import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { BarangManager } from "./barang-manager"

export default async function AdminBarangPage() {
  const barangs = await prisma.barang.findMany({
    orderBy: { nama: "asc" },
    include: { _count: { select: { transaksis: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Master Barang</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola data barang (properti): nama, harga beli, harga jual, stok, dan lokasi
        penyimpanan. Stok berubah otomatis melalui menu{" "}
        <Link href="/admin/barang-masuk-keluar" className="text-red-600 font-medium hover:underline">
          Masuk/Keluar Barang
        </Link>
        .
      </p>
      <BarangManager barangs={barangs} />
    </div>
  )
}
