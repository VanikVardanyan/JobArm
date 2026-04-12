import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getGoogleAuthUrl } from "@/lib/google-auth";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const url = getGoogleAuthUrl(state);

  const res = NextResponse.redirect(url);
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
