import { prisma } from "@/lib/prisma"
import { MenuManager } from "./menu-manager"

export default async function AdminMenusPage() {
  const menus = await prisma.menu.findMany({
    include: {
      items: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          children: {
            orderBy: { order: "asc" },
            include: {
              page: { select: { title: true, slug: true } },
              children: { include: { page: { select: { title: true, slug: true } } } },
            },
          },
          page: { select: { title: true, slug: true } },
        },
      },
    },
  })

  const pages = await prisma.page.findMany({
    where: { status: "published" },
    orderBy: { title: "asc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu Navigasi</h1>
      <MenuManager menus={menus} pages={pages} />
    </div>
  )
}
