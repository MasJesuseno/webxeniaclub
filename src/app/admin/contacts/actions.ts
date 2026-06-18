"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markContactRead(id: number) {
  await prisma.contact.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/admin/contacts");
}

export async function deleteContact(id: number) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/admin/contacts");
}
