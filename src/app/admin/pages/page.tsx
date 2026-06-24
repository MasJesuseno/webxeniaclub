import { prisma } from "@/lib/prisma"
import { PageManager } from "./page-manager"

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Halaman Statis</h1>
      <PageManager pages={pages} />
    </div>
  )
}
