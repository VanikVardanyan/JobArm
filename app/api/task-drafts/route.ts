import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PENDING_TASK_TTL_MS, validateTaskDraftInput } from "@/lib/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = validateTaskDraftInput(body as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ error: "validation", fields: result.errors }, { status: 400 });
  }

  const draft = await prisma.pendingTask.create({
    data: {
      ...result.data,
      expiresAt: new Date(Date.now() + PENDING_TASK_TTL_MS),
    },
    select: { id: true },
  });

  return NextResponse.json({ id: draft.id }, { status: 201 });
}
