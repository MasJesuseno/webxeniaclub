import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditPostForm } from "./edit-form"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await prisma.post.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!post) notFound()

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Postingan</h1>
      <p className="text-sm text-gray-500 mb-6">Mengedit: {post.title}</p>
      <EditPostForm post={post} categories={categories} />
    </div>
  )
}
