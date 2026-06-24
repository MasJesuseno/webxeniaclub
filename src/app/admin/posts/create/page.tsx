import { prisma } from "@/lib/prisma"
import { PostForm } from "../post-form"

export default async function CreatePostPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tulis Postingan Baru</h1>
      <PostForm categories={categories} />
    </div>
  )
}
