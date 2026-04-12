import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Lightweight count for the home hero (avoids blocking the main page RSC). */
export async function GET() {
  const now = new Date();
  const count = await prisma.task.count({
    where: { expiresAt: { gt: now } },
  });
  return NextResponse.json({ count });
}
