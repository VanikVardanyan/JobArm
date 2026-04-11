import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { locale } = await req.json();
  const valid = ["hy", "ru", "en"];
  if (!valid.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
