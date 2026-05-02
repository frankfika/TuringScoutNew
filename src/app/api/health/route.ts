import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicEnvSnapshot } from "@/lib/env";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const env = publicEnvSnapshot();
    return NextResponse.json({ ok: env.ok, database: "ok", latencyMs: Date.now() - started, env });
  } catch (error) {
    return NextResponse.json({ ok: false, database: "error", error: error instanceof Error ? error.message : "unknown" }, { status: 500 });
  }
}
