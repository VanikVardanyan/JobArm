import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import {
  MAX_ACTIVE_PER_PHONE,
  TASK_TTL_MS,
  validateTaskInput,
  validateTaskDraftInput,
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
      category: true,
      budget: true,
      phone: true,
      createdAt: true,
    },
  });
  return NextResponse.json(tasks);
}

// POST /api/tasks — create a task
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const draftId = typeof raw.draftId === "string" ? raw.draftId : null;
  const draft = draftId
    ? await prisma.pendingTask.findUnique({ where: { id: draftId } })
    : null;

  if (draftId && (!draft || draft.expiresAt < new Date())) {
    return NextResponse.json({ error: "draft_not_found" }, { status: 404 });
  }

  const result = draft
    ? validateTaskDraftInput(draft)
    : validateTaskInput({ ...raw, phone: user.phone });
  if (!result.ok) {
    return NextResponse.json({ error: "validation", fields: result.errors }, { status: 400 });
  }
  const { description, category, budget } = result.data;
  const phone = user.phone;

  const now = new Date();

  const activeCount = await prisma.task.count({
    where: { phone, expiresAt: { gt: now } },
  });

  if (activeCount >= MAX_ACTIVE_PER_PHONE) {
    return NextResponse.json({ error: "limit_reached" }, { status: 429 });
  }

  const manageToken = uuidv4();
  const expiresAt = new Date(now.getTime() + TASK_TTL_MS);

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: { description, category, budget, phone, userId: user.id, manageToken, expiresAt },
    });
    if (draft) await tx.pendingTask.delete({ where: { id: draft.id } });
    return created;
  });

  return NextResponse.json({ id: task.id, manageToken }, { status: 201 });
}
