import { prisma } from "@/lib/prisma"
import { BukuMemberManager } from "./buku-member-manager"

export default async function AdminBukuMemberPage() {
  const items = await prisma.bukuMember.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buku Member</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kelola pencatatan transaksi pembelian produk/layanan dari mitra oleh member.
      </p>
      <BukuMemberManager items={items} />
    </div>
  )
}
