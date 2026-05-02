import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createCategoryTrendSnapshots, createProjectReport } from "@/lib/automation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const projectId = String(form.get("projectId") ?? "");
  if (projectId) await createProjectReport(projectId);
  else {
    const projects = await prisma.project.findMany({ where: { status: "published" }, take: 20 });
    for (const project of projects) await createProjectReport(project.id);
  }
  await createCategoryTrendSnapshots();
  return NextResponse.redirect(new URL("/admin/reports", request.url), { status: 303 });
}
