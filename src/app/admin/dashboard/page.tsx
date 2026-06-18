import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [
    totalPosts,
    totalPages,
    totalUsers,
    totalContacts,
    totalGallery,
    recentPosts,
    recentContacts,
    publishedPosts,
    draftPosts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.user.count(),
    prisma.contact.count(),
    prisma.galleryItem.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: true, category: true },
    }),
    prisma.contact.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { isRead: false },
    }),
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.count({ where: { status: "draft" } }),
  ]);

  return {
    totalPosts,
    totalPages,
    totalUsers,
    totalContacts,
    totalGallery,
    recentPosts,
    recentContacts,
    publishedPosts,
    draftPosts,
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const stats = await getStats();

  const statCards = [
    {
      label: "Total Postingan",
      value: stats.totalPosts,
      sub: `${stats.publishedPosts} terbit, ${stats.draftPosts} draft`,
      color: "bg-primary-500",
      href: "/admin/posts",
    },
    {
      label: "Halaman",
      value: stats.totalPages,
      color: "bg-purple-500",
      href: "/admin/pages",
    },
    {
      label: "Galeri",
      value: stats.totalGallery,
      color: "bg-green-500",
      href: "/admin/gallery",
    },
    {
      label: "Pesan Masuk",
      value: stats.totalContacts,
      sub: `${stats.recentContacts.length} belum dibaca`,
      color: "bg-orange-500",
      href: "/admin/contacts",
    },
    {
      label: "Pengguna",
      value: stats.totalUsers,
      color: "bg-indigo-500",
      href: "/admin/users",
    },
  ];

  function formatDate(date: Date) {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang kembali, {session.user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                {card.label}
              </span>
              <div className={`w-3 h-3 rounded-full ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            {card.sub && (
              <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Postingan Terbaru
            </h2>
            <Link
              href="/admin/posts"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentPosts.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada postingan</p>
            ) : (
              stats.recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}/edit`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {post.author.name} &middot; {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : post.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {post.status === "published"
                      ? "Terbit"
                      : post.status === "draft"
                      ? "Draft"
                      : "Arsip"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pesan Baru
            </h2>
            <Link
              href="/admin/contacts"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentContacts.length === 0 ? (
              <p className="text-gray-400 text-sm">Tidak ada pesan baru</p>
            ) : (
              stats.recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-lg bg-yellow-50 border border-yellow-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {contact.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDate(contact.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    {contact.subject}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {contact.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
