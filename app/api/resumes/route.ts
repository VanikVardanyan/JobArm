import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentGoogleUser } from "@/lib/google-auth";

const RESUME_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DESCRIPTION_MAX = 1000;
const MAX_ACTIVE_RESUMES = 1;
const PAGE_SIZE = 30;

const RESUME_CATEGORIES = [
  "loader",
  "restaurant_food",
  "services",
  "craft",
  "other",
] as const;

type ResumeCategory = (typeof RESUME_CATEGORIES)[number];

function isResumeCategory(v: unknown): v is ResumeCategory {
  return typeof v === "string" && RESUME_CATEGORIES.includes(v as ResumeCategory);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const now = new Date();

  const where = {
    expiresAt: { gt: now },
    ...(category && isResumeCategory(category) ? { category } : {}),
  };

  const [resumes, total] = await Promise.all([
    prisma.resume.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        description: true,
        category: true,
        phone: true,
        googleUserId: true,
        createdAt: true,
        googleUser: { select: { name: true, picture: true } },
      },
    }),
    prisma.resume.count({ where }),
  ]);

  return NextResponse.json({ resumes, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentGoogleUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description || description.length > DESCRIPTION_MAX) {
    return NextResponse.json({ error: "invalid_description" }, { status: 400 });
  }

  const category = isResumeCategory(body.category) ? body.category : "other";
  const phone = typeof body.phone === "string" ? body.phone.trim() : null;

  // Check limit
  const activeCount = await prisma.resume.count({
    where: { googleUserId: user.id, expiresAt: { gt: new Date() } },
  });
  if (activeCount >= MAX_ACTIVE_RESUMES) {
    return NextResponse.json({ error: "limit_reached" }, { status: 429 });
  }

  const resume = await prisma.resume.create({
    data: {
      description,
      category,
      phone: phone || null,
      googleUserId: user.id,
      expiresAt: new Date(Date.now() + RESUME_TTL_MS),
    },
  });

  return NextResponse.json({ id: resume.id }, { status: 201 });
}
