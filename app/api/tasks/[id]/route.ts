import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DESCRIPTION_MAX, BUDGET_MAX } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id] — fetch single active task (used by edit form)
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    select: { id: true, description: true, budget: true, expiresAt: true },
  });
  if (!task || task.expiresAt < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ id: task.id, description: task.description, budget: task.budget });
}

// PUT /api/tasks/[id] — update description/budget (phone/manageToken immutable)
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  let body: { description?: unknown; budget?: unknown; manageToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.expiresAt < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (typeof body.manageToken !== "string" || task.manageToken !== body.manageToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description || description.length > DESCRIPTION_MAX) {
    return NextResponse.json({ error: "validation", field: "description" }, { status: 400 });
  }

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
    data: { description, budget },
  });

  return NextResponse.json({ id: updated.id });
}

// DELETE /api/tasks/[id]
export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  let body: { manageToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (typeof body.manageToken !== "string" || task.manageToken !== body.manageToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
