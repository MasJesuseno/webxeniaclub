import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlbumManager } from "./album-manager";

export default async function AlbumsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const albums = await prisma.album.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { title: "asc" },
  });

  return <AlbumManager albums={albums} />;
}
