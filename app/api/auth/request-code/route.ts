import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/validation";
import { devOtpCode, getTwilioClient, isDevOtpMode, isTwilioConfigured, verifyServiceSid } from "@/lib/twilio";

const GLOBAL_SMS_PER_DAY = 20;
const PHONE_SMS_PER_DAY = 5;
const IP_SMS_PER_HOUR = 10;
const MAX_CODE_FAILURES_PER_DAY = 2;
const PHONE_COOLDOWN_MS = 60 * 1000;

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || null;
}

export async function POST(req: NextRequest) {
  let body: { phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : null;
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const now = Date.now();
  const ip = getClientIp(req);
  const dayStart = new Date(now - 24 * 60 * 60 * 1000);
  const hourStart = new Date(now - 60 * 60 * 1000);
  const cooldownStart = new Date(now - PHONE_COOLDOWN_MS);

  const [globalToday, phoneToday, ipThisHour, phoneRecent, failuresToday] = await Promise.all([
    prisma.smsSendLog.count({ where: { createdAt: { gte: dayStart } } }),
    prisma.smsSendLog.count({ where: { phone, createdAt: { gte: dayStart } } }),
    ip ? prisma.smsSendLog.count({ where: { ip, createdAt: { gte: hourStart } } }) : 0,
    prisma.smsSendLog.count({ where: { phone, createdAt: { gte: cooldownStart } } }),
    prisma.authFailureLog.count({ where: { phone, createdAt: { gte: dayStart } } }),
  ]);

  if (failuresToday >= MAX_CODE_FAILURES_PER_DAY) {
    return NextResponse.json({ error: "too_many_code_failures" }, { status: 429 });
  }
  if (globalToday >= GLOBAL_SMS_PER_DAY) {
    return NextResponse.json({ error: "daily_limit_reached" }, { status: 429 });
  }
  if (phoneToday >= PHONE_SMS_PER_DAY) {
    return NextResponse.json({ error: "phone_limit_reached" }, { status: 429 });
  }
  if (ipThisHour >= IP_SMS_PER_HOUR) {
    return NextResponse.json({ error: "ip_limit_reached" }, { status: 429 });
  }
  if (phoneRecent > 0) {
    return NextResponse.json({ error: "cooldown" }, { status: 429 });
  }

  if (!isTwilioConfigured && !isDevOtpMode) {
    return NextResponse.json({ error: "sms_not_configured" }, { status: 500 });
  }

  if (isTwilioConfigured) {
    try {
      await getTwilioClient().verify.v2.services(verifyServiceSid!).verifications.create({
        to: phone,
        channel: "sms",
      });
    } catch (error) {
      console.error("Twilio verification request failed", error);
      return NextResponse.json({ error: "sms_failed" }, { status: 502 });
    }
  } else {
    console.info(`Dev OTP for ${phone}: ${devOtpCode}`);
  }

  await prisma.smsSendLog.create({
    data: { phone, ip },
  });

  return NextResponse.json({ ok: true, devCode: isDevOtpMode ? devOtpCode : undefined });
}
