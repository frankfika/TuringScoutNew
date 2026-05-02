import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({ where: { status: "published" }, include: { opportunities: { where: { status: "published" } }, creatorContent: { where: { status: "visible" } }, evidence: { where: { status: "active" } } }, take: 100 });
  return NextResponse.json({ version: "v1", items: projects });
}
