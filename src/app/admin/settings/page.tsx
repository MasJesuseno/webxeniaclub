import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await prisma.siteProfile.findFirst({ where: { id: 1 } });

  return <SettingsForm profile={profile} />;
}
