import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicProject, publicCreatorContent, publicEvidence, publicOpportunity } from "@/lib/public-shapes";

export async function GET() {
  const projects = await prisma.project.findMany({ where: { status: "published" }, include: { opportunities: { where: { status: "published" } }, creatorContent: { where: { status: "visible" } }, evidence: { where: { status: "active" } } }, take: 100 });
  return NextResponse.json({ version: "v1", items: projects.map((project) => ({ ...publicProject(project), opportunities: project.opportunities.map(publicOpportunity), creatorContent: project.creatorContent.map(publicCreatorContent), evidence: project.evidence.map(publicEvidence) })) });
}
