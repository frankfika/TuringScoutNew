import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin";

export async function POST(request: Request) {
  await clearAdminCookie();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
