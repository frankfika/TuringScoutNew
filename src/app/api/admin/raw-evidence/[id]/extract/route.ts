import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { extractCandidateFromRawEvidence } from "@/lib/automation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await extractCandidateFromRawEvidence(id);
  return NextResponse.redirect(new URL("/admin/review", request.url), { status: 303 });
}
