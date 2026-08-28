import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"
import { BeritaKegiatanTabs } from "./berita-kegiatan-tabs"

export const dynamic = "force-dynamic"

export default async function MemberBeritaPage() {
  const member = await getMemberSession()

  const [posts, kegiatan] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published" },
      include: {
        author: { select: { name: true } },
        category: true,
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.kegiatan.findMany({
      orderBy: { tanggal: "desc" },
    }),
  ])

  return (
    <BeritaKegiatanTabs
      posts={posts}
      kegiatan={kegiatan}
      canAddKegiatan={!!member?.canUpdateKegiatan}
    />
  )
}
