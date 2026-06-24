import { prisma } from "@/lib/prisma"
import { CategoryManager } from "./category-manager"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kategori</h1>
      <CategoryManager categories={categories} />
    </div>
  )
}
