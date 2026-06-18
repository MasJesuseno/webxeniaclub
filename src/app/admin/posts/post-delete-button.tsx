"use client";

export function PostDeleteButton({ postId, postTitle }: { postId: number; postTitle: string }) {
  return (
    <form action={`/api/admin/posts/${postId}/delete`} method="POST">
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Hapus "${postTitle}"?`)) {
            e.preventDefault();
          }
        }}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Hapus"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  );
}
