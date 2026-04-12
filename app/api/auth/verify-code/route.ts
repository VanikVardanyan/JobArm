import { NextResponse, type NextRequest } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { devOtpCode, getTwilioClient, isDevOtpMode, isTwilioConfigured, verifyServiceSid } from "@/lib/twilio";
import { normalizePhone } from "@/lib/validation";

const MAX_CODE_FAILURES_PER_DAY = 2;

export async function POST(req: NextRequest) {
  let body: { phone?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : null;
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!phone || !/^\d{4,8}$/.test(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const failureWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const failuresToday = await prisma.authFailureLog.count({
    where: { phone, createdAt: { gte: failureWindowStart } },
  });
  if (failuresToday >= MAX_CODE_FAILURES_PER_DAY) {
    return NextResponse.json({ error: "too_many_code_failures" }, { status: 429 });
  }

  let approved = false;
  if (isTwilioConfigured) {
    try {
      const verification = await getTwilioClient().verify.v2
        .services(verifyServiceSid!)
        .verificationChecks.create({ to: phone, code });
      approved = verification.status === "approved";
    } catch {
      approved = false;
    }
  } else if (isDevOtpMode) {
    approved = code === devOtpCode;
  }

  if (!approved) {
    await prisma.authFailureLog.create({ data: { phone } });
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  await prisma.authFailureLog.deleteMany({ where: { phone } });

  const now = new Date();
  const user = await prisma.user.upsert({
    where: { phone },
    update: { phoneVerifiedAt: now },
    create: { phone, phoneVerifiedAt: now },
  });
  const sessionToken = await createSession(user.id);

  const res = NextResponse.json({ ok: true, user: { id: user.id, phone: user.phone } });
  setSessionCookie(res, sessionToken);
  return res;
}
