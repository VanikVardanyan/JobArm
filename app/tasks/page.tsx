import { prisma } from "@/lib/prisma";
import TaskList from "@/components/TaskList";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const now = new Date();
  const tasks = await prisma.task.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      description: true,
      budget: true,
      phone: true,
      createdAt: true,
    },
  });

  const serialized = tasks.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return <TaskList tasks={serialized} />;
}
