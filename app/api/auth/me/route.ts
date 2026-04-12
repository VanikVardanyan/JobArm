import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  return NextResponse.json({
    user: user ? { id: user.id, phone: user.phone } : null,
  });
}
