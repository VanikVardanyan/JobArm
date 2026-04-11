import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import {
  MAX_ACTIVE_PER_PHONE,
  TASK_TTL_MS,
  validateTaskInput,
} from "@/lib/validation";

// GET /api/tasks — list all active tasks (phone included for the Call button)
export async function GET() {
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
  return NextResponse.json(tasks);
}

// POST /api/tasks — create a task
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = validateTaskInput(body as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ error: "validation", fields: result.errors }, { status: 400 });
  }
  const { description, budget, phone } = result.data;

  const now = new Date();

  const activeCount = await prisma.task.count({
    where: { phone, expiresAt: { gt: now } },
  });

  if (activeCount >= MAX_ACTIVE_PER_PHONE) {
    return NextResponse.json({ error: "limit_reached" }, { status: 429 });
  }

  const manageToken = uuidv4();
  const expiresAt = new Date(now.getTime() + TASK_TTL_MS);

  const task = await prisma.task.create({
    data: { description, budget, phone, manageToken, expiresAt },
  });

  return NextResponse.json({ id: task.id, manageToken }, { status: 201 });
}
