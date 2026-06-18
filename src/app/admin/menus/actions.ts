"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMenu(formData: FormData) {
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;

  await prisma.menu.create({ data: { name, location } });
  revalidatePath("/admin/menus");
}

export async function deleteMenu(id: number) {
  await prisma.menu.delete({ where: { id } });
  revalidatePath("/admin/menus");
}

export async function addMenuItem(formData: FormData) {
  const label = formData.get("label") as string;
  const url = formData.get("url") as string;
  const pageId = formData.get("pageId")
    ? Number(formData.get("pageId"))
    : null;
  const menuId = Number(formData.get("menuId"));
  const order = Number(formData.get("order")) || 0;

  await prisma.menuItem.create({
    data: { label, url: url || null, pageId, menuId, order },
  });

  revalidatePath("/admin/menus");
}

export async function updateMenuItem(id: number, formData: FormData) {
  const label = formData.get("label") as string;
  const url = formData.get("url") as string;
  const pageId = formData.get("pageId")
    ? Number(formData.get("pageId"))
    : null;
  const order = Number(formData.get("order")) || 0;
  const isActive = formData.get("isActive") === "on";

  await prisma.menuItem.update({
    where: { id },
    data: { label, url, pageId, order, isActive },
  });

  revalidatePath("/admin/menus");
}

export async function deleteMenuItem(id: number) {
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/menus");
}
