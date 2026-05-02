import { NextResponse } from "next/server";
import { getOpportunityBySlug } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity || opportunity.status !== "published") return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(opportunity);
}
