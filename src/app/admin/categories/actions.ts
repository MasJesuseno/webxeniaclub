"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string || "#3B82F6";

  await prisma.category.create({
    data: { name, slug: slugify(name), description, color },
  });

  revalidatePath("/admin/categories");
}

export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string || "#3B82F6";

  await prisma.category.update({
    where: { id },
    data: { name, slug: slugify(name), description, color },
  });

  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
