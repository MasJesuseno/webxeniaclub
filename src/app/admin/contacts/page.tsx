import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContactsManager } from "./contacts-manager";

export default async function ContactsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ContactsManager contacts={contacts} />;
}
