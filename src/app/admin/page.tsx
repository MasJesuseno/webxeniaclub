import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { timeAgo } from "@/lib/utils"

export default async function AdminDashboard() {
  const [
    postCount,
    publishedCount,
    categoryCount,
    albumCount,
    testimonialCount,
    partnerCount,
    contactCount,
    unreadCount,
    userCount,
    prospectiveTotalCount,
    prospectiveDiajukanCount,
    prospectiveDiterimaCount,
    memberLoggedInCount,
    memberNeverLoggedInCount,
    memberOnlineCount,
    registrationWaitingCount,
    recentLogins,
    recentRegistrationWaiting,
    recentPosts,
    recentContacts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "published" } }),
    prisma.category.count(),
    prisma.album.count(),
    prisma.testimonial.count(),
    prisma.partner.count(),
    prisma.contact.count(),
    prisma.contact.count({ where: { isRead: false } }),
    prisma.user.count(),
    prisma.prospectiveMember.count(),
    prisma.prospectiveMember.count({ where: { status: "Diajukan" } }),
    prisma.prospectiveMember.count({ where: { status: "Diterima" } }),
    prisma.prospectiveMember.count({ where: { lastLoginAt: { not: null } } }),
    prisma.prospectiveMember.count({ where: { lastLoginAt: null } }),
    prisma.prospectiveMember.count({ where: { isOnline: true } }),
    prisma.registrationData.count({ where: { status: "Menunggu Verifikasi" } }),
    prisma.prospectiveMember.findMany({
      where: { lastLoginAt: { not: null } },
      orderBy: { lastLoginAt: "desc" },
      take: 8,
      select: { id: true, memberId: true, namaLengkap: true, region: true, lastLoginAt: true, isOnline: true },
    }),
    prisma.registrationData.findMany({
      where: { status: "Menunggu Verifikasi" },
      include: {
        registrationPeriod: { select: { period: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.post.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } }),
    prisma.contact.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ])

  const stats = [
    { label: "Data Member", value: prospectiveTotalCount, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", color: "bg-red-500" },
    { label: "Diajukan", value: prospectiveDiajukanCount, icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-yellow-500" },
    { label: "Disetujui", value: prospectiveDiterimaCount, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-green-500" },
    { label: "Registrasi Menunggu Verifikasi", value: registrationWaitingCount, icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-amber-500" },
    { label: "Sudah Login", value: memberLoggedInCount, icon: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1", color: "bg-blue-500" },
    { label: "Belum Login", value: memberNeverLoggedInCount, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-gray-400" },
    { label: "Online Sekarang", value: memberOnlineCount, icon: "M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z", color: "bg-emerald-500" },
    { label: "Total Postingan", value: postCount, icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", color: "bg-blue-500" },
    { label: "Dipublikasikan", value: publishedCount, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-green-500" },
    { label: "Kategori", value: categoryCount, icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", color: "bg-blue-500" },
    { label: "Album Galeri", value: albumCount, icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "bg-purple-500" },
    { label: "Testimoni", value: testimonialCount, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", color: "bg-yellow-500" },
    { label: "Mitra", value: partnerCount, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "bg-teal-500" },
    { label: "Pesan Masuk", value: contactCount, details: `${unreadCount} belum dibaca`, icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "bg-indigo-500" },
    { label: "Pengguna", value: userCount, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", color: "bg-pink-500" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.details && <p className="text-xs text-red-600 mt-1">{stat.details}</p>}
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registrasi Menunggu Verifikasi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Registrasi Menunggu Verifikasi</h3>
          <Link href="/admin/registration-data" className="text-sm text-red-600 hover:text-red-700">Lihat Semua</Link>
        </div>
        {recentRegistrationWaiting.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-500">Tidak ada registrasi yang menunggu verifikasi</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentRegistrationWaiting.map((reg) => (
              <Link key={reg.id} href="/admin/registration-data" className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-2.5 h-2.5 shrink-0 rounded-full bg-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{reg.namaMember}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-mono">{reg.memberId || "—"}</span>
                      {reg.registrationPeriod?.period && <span> · {reg.registrationPeriod.period}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Menunggu Verifikasi
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(reg.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Member Logins */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Aktivitas Login Member</h3>
          <Link href="/admin/prospective-members" className="text-sm text-red-600 hover:text-red-700">Lihat Semua</Link>
        </div>
        {recentLogins.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-500">Belum ada member yang pernah login</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentLogins.map((login) => (
              <Link key={login.id} href="/admin/prospective-members" className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`relative flex w-2.5 h-2.5 shrink-0 ${login.isOnline ? "" : "opacity-40"}`}>
                    {login.isOnline && (
                      <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    )}
                    <span className={`relative inline-flex w-2.5 h-2.5 rounded-full ${login.isOnline ? "bg-emerald-500" : "bg-gray-400"}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{login.namaLengkap}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-mono">{login.memberId || "—"}</span>
                      {login.region && <span> · {login.region}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm text-gray-700">{timeAgo(login.lastLoginAt)}</p>
                  <p className="text-xs text-gray-400">
                    {login.lastLoginAt ? new Date(login.lastLoginAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Postingan Terbaru</h3>
            <Link href="/admin/posts" className="text-sm text-red-600 hover:text-red-700">Lihat Semua</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/admin/posts/${post.id}/edit`} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.author.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  post.status === "published" ? "bg-green-100 text-green-700" :
                  post.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {post.status}
                </span>
              </Link>
            ))}
            {recentPosts.length === 0 && (
              <p className="px-6 py-4 text-sm text-gray-500">Belum ada postingan</p>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Pesan Terbaru</h3>
            <Link href="/admin/contacts" className="text-sm text-red-600 hover:text-red-700">Lihat Semua</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentContacts.map((contact) => (
              <div key={contact.id} className="px-6 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    contact.isRead ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"
                  }`}>
                    {contact.isRead ? "Dibaca" : "Baru"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{contact.message}</p>
                <p className="text-xs text-gray-400 mt-1">{contact.email}</p>
              </div>
            ))}
            {recentContacts.length === 0 && (
              <p className="px-6 py-4 text-sm text-gray-500">Belum ada pesan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
