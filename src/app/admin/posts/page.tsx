import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { PostDeleteButton } from "./post-delete-button"

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: { author: { select: { name: true } }, category: true, _count: { select: { tags: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Postingan</h1>
        <Link
          href="/admin/posts/create"
          className="dxic-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Postingan
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Judul</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden md:table-cell">Kategori</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden md:table-cell">Penulis</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden sm:table-cell">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden lg:table-cell">Tanggal</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.image && (
                          <img src={post.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        )}
                        <div>
                          <Link href={`/admin/posts/${post.id}/edit`} className="font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-1">
                            {post.title}
                          </Link>
                          {post.featured && <span className="text-xs text-yellow-600 font-medium">⭐ Unggulan</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {post.category ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: post.category.color }}>
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{post.author.name}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.status === "published" ? "bg-green-100 text-green-700" :
                        post.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {post.status === "published" ? "Terbit" : post.status === "draft" ? "Draft" : "Arsip"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden lg:table-cell text-xs">
                      {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <PostDeleteButton id={post.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-500 mb-4">Belum ada postingan</p>
            <Link href="/admin/posts/create" className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Postingan Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
