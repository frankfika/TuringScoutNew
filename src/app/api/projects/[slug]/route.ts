import { NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || project.status !== "published") return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}
