import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryManager } from "./gallery-manager";

export default async function GalleryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const items = await prisma.galleryItem.findMany({
    include: { album: true },
    orderBy: { createdAt: "desc" },
  });

  const albums = await prisma.album.findMany({
    orderBy: { title: "asc" },
  });

  return <GalleryManager items={items} albums={albums} />;
}
