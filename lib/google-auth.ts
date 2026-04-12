import { createHash, randomBytes } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GOOGLE_SESSION_COOKIE = "jobarm_google_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createToken(): string {
  return randomBytes(32).toString("base64url");
}

export function setGoogleSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(GOOGLE_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearGoogleSessionCookie(res: NextResponse) {
  res.cookies.set(GOOGLE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function createGoogleSession(googleUserId: string): Promise<string> {
  const token = createToken();
  await prisma.googleSession.create({
    data: {
      googleUserId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return token;
}

export async function getCurrentGoogleUser(req: NextRequest) {
  const token = req.cookies.get(GOOGLE_SESSION_COOKIE)?.value;
  return getGoogleUserFromToken(token);
}

export async function getGoogleUserFromToken(token?: string) {
  if (!token) return null;

  const session = await prisma.googleSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { googleUser: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.googleSession.delete({ where: { id: session.id } }).catch(() => null);
    }
    return null;
  }

  return session.googleUser;
}

export async function deleteGoogleSession(req: NextRequest) {
  const token = req.cookies.get(GOOGLE_SESSION_COOKIE)?.value;
  if (!token) return;
  await prisma.googleSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getRedirectUri() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}/api/auth/google/callback`;
}

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    state,
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForUser(code: string): Promise<{
  googleId: string;
  email: string;
  name: string | null;
  picture: string | null;
} | null> {
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return null;
  const tokens = await tokenRes.json();

  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) return null;
  const profile = await userRes.json();

  return {
    googleId: profile.id,
    email: profile.email,
    name: profile.name || null,
    picture: profile.picture || null,
  };
}
