import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const sources = await prisma.source.findMany({ include: { jobRuns: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { rawEvidence: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ sources });
}

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  await prisma.source.create({
    data: {
      name: String(form.get("name") ?? "Untitled source"),
      sourceType: String(form.get("sourceType") ?? "manual"),
      urlOrQuery: String(form.get("urlOrQuery") ?? ""),
      categoryHint: String(form.get("categoryHint") ?? "") || null,
      priority: String(form.get("priority") ?? "medium"),
      frequency: String(form.get("frequency") ?? "manual"),
      fetchMethod: String(form.get("fetchMethod") ?? "manual"),
      allowedUseNotes: String(form.get("allowedUseNotes") ?? "") || null,
      enabled: form.get("enabled") !== "off",
    },
  });
  return NextResponse.redirect(new URL("/admin/sources", request.url), { status: 303 });
}
