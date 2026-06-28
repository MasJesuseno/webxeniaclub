import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { CommentApproveButton, CommentDeleteButton } from "@/components/comment-actions"

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    include: { post: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  })

  const pendingCount = comments.filter((c) => !c.isApproved).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Komentar</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-red-600 mt-1">{pendingCount} komentar menunggu persetujuan</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {comments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <div key={comment.id} className={`p-6 hover:bg-gray-50 transition-colors ${!comment.isApproved ? "bg-yellow-50/50" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <span className="text-red-600 font-bold text-xs">
                          {comment.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-sm ${!comment.isApproved ? "font-bold" : "font-medium"} text-gray-900`}>
                          {comment.name}
                        </h3>
                        <span className="text-xs text-gray-400">{comment.email}</span>
                      </div>
                      {!comment.isApproved && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 ml-2">
                          Menunggu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>{formatDate(comment.createdAt)}</span>
                      <span>•</span>
                      <span>
                        Pada: <a href={`/berita/${comment.post.slug}`} target="_blank" className="text-red-600 hover:underline">{comment.post.title}</a>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CommentApproveButton commentId={comment.id} isApproved={comment.isApproved} />
                    <CommentDeleteButton commentId={comment.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500">Belum ada komentar</p>
          </div>
        )}
      </div>
    </div>
  )
}
