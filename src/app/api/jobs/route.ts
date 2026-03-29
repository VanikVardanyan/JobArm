import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { JOBS_PAGE_SIZE, parseJobsPage, parseJobsSortOrder } from "@/lib/jobs-list";
import { validateCreateJobInput } from "@/lib/job-input";
import { parseCommaListParam } from "@/lib/query-filters";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";

// GET /api/jobs — публичная лента заявок (пагинация и сортировка как на странице /jobs)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") ?? undefined;
  const region = searchParams.get("region") ?? undefined;
  const urgent = searchParams.get("urgent");
  const search = searchParams.get("search") ?? undefined;
  const page = parseJobsPage(searchParams.get("page") ?? undefined);
  const sortParam = searchParams.get("sort");
  const sortOrder = parseJobsSortOrder(sortParam === "old" ? "old" : undefined);

  const categoryList = parseCommaListParam(category);
  const regionList = parseCommaListParam(region);

  const where = {
    status: "active" as const,
    ...(categoryList.length > 0 && { category: { in: categoryList } }),
    ...(regionList.length > 0 && { region: { in: regionList } }),
    ...(urgent === "true" && { isUrgent: true }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const total = await prisma.job.count({ where });
  const totalPages = total === 0 ? 0 : Math.ceil(total / JOBS_PAGE_SIZE);
  const safePage =
    totalPages > 0 ? Math.min(page, totalPages) : 1;
  const skip = (safePage - 1) * JOBS_PAGE_SIZE;

  const jobs = await prisma.job.findMany({
    where,
    include: {
      author: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: sortOrder },
    skip,
    take: JOBS_PAGE_SIZE,
  });

  return NextResponse.json({
    jobs,
    total,
    page: safePage,
    pageSize: JOBS_PAGE_SIZE,
    totalPages,
  });
}

// POST /api/jobs — создать заявку (только авторизованным)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: `jobs:create:${getRequestIp(request)}:${session.user.email}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many create attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateCreateJobInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: { ...parsed.data, authorId: user.id },
  });

  return NextResponse.json(job, { status: 201 });
}
