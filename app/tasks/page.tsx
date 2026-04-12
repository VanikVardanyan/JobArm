import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import TaskList from "@/components/TaskList";
import { getUserFromSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { isTaskCategory } from "@/lib/validation";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = isTaskCategory(params.category) ? params.category : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const cookieStore = await cookies();
  const user = await getUserFromSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const now = new Date();
  const where = { expiresAt: { gt: now }, ...(category ? { category } : {}) };
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        description: true,
        category: true,
        budget: true,
        phone: true,
        userId: true,
        createdAt: true,
      },
    }),
    prisma.task.count({ where }),
  ]);

  const serialized = tasks.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    isMine: Boolean(user && t.userId === user.id),
  }));

  return (
    <TaskList
      tasks={serialized}
      activeCategory={category ?? "all"}
      pagination={{
        page,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        total,
        basePath: "/tasks",
        category,
      }}
    />
  );
}
