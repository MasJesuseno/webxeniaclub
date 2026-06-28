"use client"

import { approveComment, deleteComment } from "@/lib/actions"

export function CommentApproveButton({ commentId, isApproved }: { commentId: string; isApproved: boolean }) {
  return (
    <form action={approveComment.bind(null, commentId) as unknown as (formData: FormData) => void}>
      <button
        type="submit"
        className={`p-2 rounded-lg transition-all ${
          isApproved
            ? "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
            : "text-green-600 hover:bg-green-50"
        }`}
        title={isApproved ? "Batalkan persetujuan" : "Setujui komentar"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </form>
  )
}

export function CommentDeleteButton({ commentId }: { commentId: string }) {
  return (
    <form
      action={deleteComment.bind(null, commentId) as unknown as (formData: FormData) => void}
      onSubmit={(e) => {
        if (!confirm("Hapus komentar ini?")) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
        title="Hapus"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  )
}
