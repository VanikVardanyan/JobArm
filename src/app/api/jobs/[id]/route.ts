import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { normalizeContactMethod } from "@/lib/contact-links";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/** Тип поля `data` для `job.update` без `Prisma.JobUpdateInput` (он только внутри `namespace Prisma`). */
type JobUpdateArgs = Parameters<typeof prisma.job.update>[0];
type JobUpdatePayload = JobUpdateArgs extends { data: infer D } ? D : never;

function buildJobUpdateData(body: Record<string, unknown>): JobUpdatePayload {
  const data: Record<string, unknown> = {};

  if (body.title && typeof body.title === "string") {
    data.title = body.title;
  }
  if (body.description !== undefined) {
    data.description = body.description === null ? null : String(body.description);
  }
  if (body.category && typeof body.category === "string") {
    data.category = body.category;
  }
  if (body.price !== undefined) {
    data.price = body.price === null ? null : String(body.price);
  }
  if (body.priceType && typeof body.priceType === "string") {
    data.priceType = body.priceType;
  }
  if (body.region && typeof body.region === "string") {
    data.region = body.region;
  }
  if (body.address && typeof body.address === "string") {
    data.address = body.address;
  }
  if (body.isUrgent !== undefined && typeof body.isUrgent === "boolean") {
    data.isUrgent = body.isUrgent;
  }
  if (body.date !== undefined) {
    data.date = body.date === null ? null : String(body.date);
  }
  if (body.time !== undefined) {
    data.time = body.time === null ? null : String(body.time);
  }
  if (body.status && typeof body.status === "string") {
    data.status = body.status;
  }
  if (body.contactPhone && typeof body.contactPhone === "string") {
    data.contactPhone = body.contactPhone;
  }
  if (body.contactMethod !== undefined) {
    data.contactMethod = normalizeContactMethod(
      typeof body.contactMethod === "string" ? body.contactMethod : undefined
    );
  }

  return data as JobUpdatePayload;
}

// GET /api/jobs/[id] — публичная страница заявки
export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: { author: { select: { name: true, image: true } } },
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

// PATCH /api/jobs/[id] — редактировать / изменить статус (только автор)
export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user || job.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    body = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = buildJobUpdateData(body);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const updated = await prisma.job.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[PATCH /api/jobs/[id]]", e);
    const message = e instanceof Error ? e.message : String(e);
    const payload =
      process.env.NODE_ENV === "development"
        ? { error: "Update failed", details: message }
        : { error: "Update failed" };
    return NextResponse.json(payload, { status: 500 });
  }
}

// DELETE /api/jobs/[id] — удалить заявку (только автор)
export async function DELETE(_: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user || job.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.job.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
