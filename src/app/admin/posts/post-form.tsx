"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "./actions";
import { ImageUpload } from "@/components/image-upload";
import { ContentEditor } from "@/components/content-editor";

type Category = { id: number; name: string; color: string };
type Tag = { id: number; name: string };
type User = { id: number; name: string };
type Post = {
  id: number;
  title: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  status: string;
  featured: boolean;
  categoryId: number | null;
  authorId: number;
  tags: { tag: Tag }[];
};

export function PostForm({
  categories,
  tags,
  users,
  post,
  currentUserId,
}: {
  categories: Category[];
  tags: Tag[];
  users: User[];
  post?: Post;
  currentUserId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(post?.content || "");
  const isEditing = !!post;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("content", content);

    if (!isEditing) {
      formData.set("authorId", String(currentUserId));
    }

    try {
      if (isEditing) {
        await updatePost(post!.id, formData);
      } else {
        await createPost(formData);
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Postingan" : "Tambah Postingan"}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditing ? "Edit postingan yang sudah ada" : "Buat postingan baru"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={post?.title}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Masukkan judul postingan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konten
            </label>
            <input type="hidden" name="content" value={content} />
            <ContentEditor
              value={content}
              onChange={setContent}
              placeholder="Tulis konten di sini... (HTML didukung)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt / Ringkasan
              </label>
              <textarea
                name="excerpt"
                rows={3}
                defaultValue={post?.excerpt || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ringkasan singkat (opsional)"
              />
            </div>
            <div>
              <ImageUpload
                name="image"
                label="Gambar"
                defaultValue={post?.image}
                recommendedResolution="1920 × 1080 px (16:9)"
                aspectRatio="16/10"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Pengaturan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                name="categoryId"
                defaultValue={post?.categoryId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Tidak ada kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue={post?.status || "draft"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Terbitkan</option>
                <option value="archived">Arsip</option>
              </select>
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penulis
                </label>
                <select
                  name="authorId"
                  defaultValue={currentUserId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={post?.tags?.some((t) => t.tag.id === tag.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={post?.featured}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Jadikan sebagai postingan unggulan
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
