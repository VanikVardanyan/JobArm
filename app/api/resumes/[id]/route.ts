import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentGoogleUser } from "@/lib/google-auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentGoogleUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.googleUserId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.resume.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
