import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const source = await prisma.source.update({
    where: { id },
    data: {
      name: body.name,
      sourceType: body.sourceType,
      urlOrQuery: body.urlOrQuery,
      categoryHint: body.categoryHint,
      priority: body.priority,
      frequency: body.frequency,
      fetchMethod: body.fetchMethod,
      allowedUseNotes: body.allowedUseNotes,
      enabled: body.enabled,
    },
  });
  return NextResponse.json({ source });
}
