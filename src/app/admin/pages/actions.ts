"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function createPage(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as string || "draft";
  const layout = formData.get("layout") as string || "default";
  const order = Number(formData.get("order")) || 0;

  await prisma.page.create({
    data: { title, slug: slugify(title), content, status, layout, order },
  });

  revalidatePath("/admin/pages");
}

export async function updatePage(id: number, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as string;
  const layout = formData.get("layout") as string;
  const order = Number(formData.get("order")) || 0;

  await prisma.page.update({
    where: { id },
    data: { title, content, status, layout, order, slug: slugify(title) },
  });

  revalidatePath("/admin/pages");
}

export async function deletePage(id: number) {
  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
}
