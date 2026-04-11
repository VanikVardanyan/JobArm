import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  // Vercel Cron signs requests with the CRON_SECRET as a bearer token.
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await prisma.task.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return NextResponse.json({ deleted: result.count });
}
