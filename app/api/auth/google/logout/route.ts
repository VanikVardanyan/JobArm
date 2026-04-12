import { NextRequest, NextResponse } from "next/server";
import { deleteGoogleSession, clearGoogleSessionCookie } from "@/lib/google-auth";

export async function POST(req: NextRequest) {
  await deleteGoogleSession(req);
  const res = NextResponse.json({ ok: true });
  clearGoogleSessionCookie(res);
  return res;
}
