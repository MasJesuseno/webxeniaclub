"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const data: any = {};
  const fields = [
    "schoolName", "shortName", "slogan", "description",
    "address", "phone", "email", "website", "logo", "favicon",
    "vision", "mission", "about", "history",
    "primaryColor", "homeBanner", "homeBannerBrightness",
    "feature1Title", "feature1Description",
    "feature2Title", "feature2Description",
    "feature3Title", "feature3Description",
    "headingFont", "bodyFont", "baseFontSize", "headingWeight",
    "teacherCount", "studentCount", "establishedYears", "achievementCount",
    "youtubeUrl", "instagramUrl", "facebookUrl", "twitterUrl",
    "operationalHours",
    "ppdbUrl",
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) {
      // Convert integer fields to number
      if (field === "homeBannerBrightness") {
        data[field] = parseInt(value as string, 10);
      } else {
        data[field] = value;
      }
    }
  }

  await prisma.siteProfile.upsert({
    where: { id: 1 },
    update: data,
    create: { ...data },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/profil");
}
