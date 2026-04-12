import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import ResumeList from "@/components/ResumeList";
import { getGoogleUserFromToken, GOOGLE_SESSION_COOKIE } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

const RESUME_CATEGORIES = ["loader", "restaurant_food", "services", "craft", "other"] as const;

function isResumeCategory(v: unknown): v is (typeof RESUME_CATEGORIES)[number] {
  return typeof v === "string" && RESUME_CATEGORIES.includes(v as (typeof RESUME_CATEGORIES)[number]);
}

export default async function ResumesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = isResumeCategory(params.category) ? params.category : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const cookieStore = await cookies();
  const googleUser = await getGoogleUserFromToken(cookieStore.get(GOOGLE_SESSION_COOKIE)?.value);
  const now = new Date();
  const where = { expiresAt: { gt: now }, ...(category ? { category } : {}) };

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

  const serialized = resumes.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    isMine: Boolean(googleUser && r.googleUserId === googleUser.id),
  }));

  return (
    <ResumeList
      resumes={serialized}
      activeCategory={category ?? "all"}
      pagination={{
        page,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        total,
        basePath: "/resumes",
        category,
      }}
    />
  );
}
