"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addAlumni(formData: FormData) {
  const name = formData.get("name") as string;
  const photo = formData.get("photo") as string;
  const testimonial = formData.get("testimonial") as string;
  const graduationYear = formData.get("graduationYear") as string;

  await prisma.alumni.create({
    data: {
      name,
      photo: photo || null,
      testimonial,
      graduationYear: graduationYear || null,
    },
  });

  revalidatePath("/admin/alumni");
  revalidatePath("/");
}

export async function updateAlumni(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const photo = formData.get("photo") as string;
  const testimonial = formData.get("testimonial") as string;
  const graduationYear = formData.get("graduationYear") as string;

  await prisma.alumni.update({
    where: { id },
    data: {
      name,
      photo: photo || null,
      testimonial,
      graduationYear: graduationYear || null,
    },
  });

  revalidatePath("/admin/alumni");
  revalidatePath("/");
}

export async function deleteAlumni(id: number) {
  await prisma.alumni.delete({ where: { id } });
  revalidatePath("/admin/alumni");
  revalidatePath("/");
}
