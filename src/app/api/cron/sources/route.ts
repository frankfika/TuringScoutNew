import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSource } from "@/lib/automation";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && new URL(request.url).searchParams.get("secret") !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const source = await prisma.source.findFirst({ where: { enabled: true, frequency: { in: ["daily", "weekly"] }, fetchMethod: { in: ["api", "rss", "public_page", "manual"] } }, orderBy: { priority: "asc" } });
  if (!source) return NextResponse.json({ ok: true, message: "No enabled scheduled sources" });
  const run = await runSource(source.id, "scheduled");
  return NextResponse.json({ ok: true, run });
}
