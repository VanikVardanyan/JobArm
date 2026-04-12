import { NextRequest, NextResponse } from "next/server";
import { getCurrentGoogleUser } from "@/lib/google-auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentGoogleUser(req);
  return NextResponse.json({
    user: user
      ? { id: user.id, email: user.email, name: user.name, picture: user.picture }
      : null,
  });
}
