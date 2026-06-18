import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { id } = await params;
  await prisma.post.delete({ where: { id: Number(id) } });
  return NextResponse.redirect(new URL("/admin/posts", request.url));
}
