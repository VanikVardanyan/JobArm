import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  exchangeCodeForUser,
  createGoogleSession,
  setGoogleSessionCookie,
} from "@/lib/google-auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = req.cookies.get("google_oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/resumes/create", req.url));
  }

  const profile = await exchangeCodeForUser(code);
  if (!profile) {
    return NextResponse.redirect(new URL("/resumes/create", req.url));
  }

  // Upsert Google user
  const googleUser = await prisma.googleUser.upsert({
    where: { googleId: profile.googleId },
    update: { email: profile.email, name: profile.name, picture: profile.picture },
    create: {
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    },
  });

  const token = await createGoogleSession(googleUser.id);
  const res = NextResponse.redirect(new URL("/resumes/create", req.url));
  setGoogleSessionCookie(res, token);
  res.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });
  return res;
}
