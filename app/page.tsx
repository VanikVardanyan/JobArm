import { prisma } from "@/lib/prisma";
import TaskList from "@/components/TaskList";
import Hero from "@/components/Hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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

  return (
    <div className="flex flex-col gap-8">
      <Hero count={serialized.length} />
      <TaskList tasks={serialized} />
    </div>
  );
}
