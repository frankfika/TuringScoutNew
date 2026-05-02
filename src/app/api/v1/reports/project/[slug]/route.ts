import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectReport } from "@/lib/automation";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });
  const report = await createProjectReport(project.id);
  return NextResponse.json({ version: "v1", report });
}
