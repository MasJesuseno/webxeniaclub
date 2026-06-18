import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Postingan tidak ditemukan
      </h2>
      <p className="text-gray-500 mb-4">
        Postingan yang Anda cari tidak ada atau telah dihapus.
      </p>
      <Link
        href="/admin/posts"
        className="text-primary-600 hover:text-primary-800 font-medium"
      >
        Kembali ke daftar postingan
      </Link>
    </div>
  );
}
