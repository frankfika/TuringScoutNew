import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const evidence = await prisma.rawEvidence.findMany({
    where: {
      sourceId: searchParams.get("sourceId") ?? undefined,
      fetchStatus: searchParams.get("fetchStatus") ?? undefined,
      reviewStatus: searchParams.get("reviewStatus") ?? undefined,
    },
    include: { source: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ evidence });
}
