import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { runSource } from "@/lib/automation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await runSource(id, "manual");
  return NextResponse.redirect(new URL("/admin/sources", request.url), { status: 303 });
}
