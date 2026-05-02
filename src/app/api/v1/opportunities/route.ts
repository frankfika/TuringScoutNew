import { NextResponse } from "next/server";
import { listOpportunities } from "@/lib/data";
import { publicOpportunity } from "@/lib/public-shapes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await listOpportunities({ category: searchParams.get("category") ?? undefined, limit: Number(searchParams.get("limit") ?? 50), sort: searchParams.get("sort") ?? "rank" });
  return NextResponse.json({ version: "v1", items: result.items.map(publicOpportunity), nextCursor: result.nextCursor });
}
