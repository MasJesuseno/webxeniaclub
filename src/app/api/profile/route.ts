import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await prisma.siteProfile.findFirst({ where: { id: 1 } });
    return NextResponse.json(profile || {});
  } catch {
    return NextResponse.json({});
  }
}
