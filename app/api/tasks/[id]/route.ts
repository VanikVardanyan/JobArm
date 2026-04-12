import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DESCRIPTION_MAX, BUDGET_MAX, isTaskCategory } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id] — fetch single active task (used by edit form)
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser(req);
  const task = await prisma.task.findUnique({
    where: { id },
    select: { id: true, description: true, category: true, budget: true, userId: true, expiresAt: true },
  });
  if (!task || task.expiresAt < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    id: task.id,
    description: task.description,
    category: task.category,
    budget: task.budget,
    canEdit: Boolean(user && task.userId === user.id),
  });
}

// PUT /api/tasks/[id] — update description/budget (phone/manageToken immutable)
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser(req);
  let body: { description?: unknown; category?: unknown; budget?: unknown; manageToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.expiresAt < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const tokenMatches = typeof body.manageToken === "string" && task.manageToken === body.manageToken;
  const userOwnsTask = Boolean(user && task.userId === user.id);
  if (!tokenMatches && !userOwnsTask) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description || description.length > DESCRIPTION_MAX) {
    return NextResponse.json({ error: "validation", field: "description" }, { status: 400 });
  }
  const category = isTaskCategory(body.category) ? body.category : task.category;

  let budget: number | null = null;
  if (body.budget !== undefined && body.budget !== null && body.budget !== "") {
    const n = typeof body.budget === "number" ? body.budget : parseInt(String(body.budget), 10);
    if (Number.isNaN(n) || n < 0 || n > BUDGET_MAX) {
      return NextResponse.json({ error: "validation", field: "budget" }, { status: 400 });
    }
    budget = n;
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { description, category, budget },
  });

  return NextResponse.json({ id: updated.id });
}

// DELETE /api/tasks/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser(req);
  let body: { manageToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const tokenMatches = typeof body.manageToken === "string" && task.manageToken === body.manageToken;
  const userOwnsTask = Boolean(user && task.userId === user.id);
  if (!tokenMatches && !userOwnsTask) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
