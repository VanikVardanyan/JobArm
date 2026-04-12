import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie, deleteCurrentSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await deleteCurrentSession(req);
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
