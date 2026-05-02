import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { importRawEvidence } from "@/lib/automation";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  await importRawEvidence({
    sourceId: String(form.get("sourceId") ?? "") || undefined,
    sourceUrl: String(form.get("sourceUrl") ?? ""),
    rawTitle: String(form.get("rawTitle") ?? "") || undefined,
    rawTextExcerpt: String(form.get("rawTextExcerpt") ?? "") || undefined,
    sourceType: "manual",
    sourceName: "Admin import",
  });
  return NextResponse.redirect(new URL("/admin/raw-evidence", request.url), { status: 303 });
}
