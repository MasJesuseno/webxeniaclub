import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuManager } from "./menu-manager";

export type MenuItemWithChildren = {
  id: number;
  label: string;
  url: string | null;
  pageId: number | null;
  icon: string | null;
  target: string;
  order: number;
  isActive: boolean;
  parentId: number | null;
  menuId: number;
  createdAt: Date;
  updatedAt: Date;
  page: { id: number; title: string; slug: string } | null;
  children: MenuItemWithChildren[];
};

export type MenuWithItems = {
  id: number;
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
  items: MenuItemWithChildren[];
};

export default async function MenusPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const rawMenus = await prisma.menu.findMany({
    include: {
      items: {
        include: {
          children: { include: { page: true } },
          page: true,
        },
        orderBy: { order: "asc" },
        where: { parentId: null },
      },
    },
    orderBy: { name: "asc" },
  });

  const menus: MenuWithItems[] = JSON.parse(JSON.stringify(rawMenus));

  const pages = await prisma.page.findMany({
    where: { status: "published" },
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true },
  });

  return <MenuManager menus={menus} pages={pages} />;
}
