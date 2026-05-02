import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setUserCookie } from "@/lib/session";
import { isValidEmail } from "@/lib/validators";

function normalizeHandle(input: string) {
  return input.trim().replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) || "scout";
}

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const displayName = String(form.get("displayName") ?? "Scout").trim().slice(0, 80) || "Scout";
  const handle = normalizeHandle(String(form.get("handle") ?? displayName));
  if (!isValidEmail(email)) return NextResponse.redirect(new URL("/auth?error=email", request.url), { status: 303 });

  const creator = await prisma.creator.upsert({
    where: { id: `creator-${handle}` },
    update: { displayName, handle: `@${handle}`, status: "visible" },
    create: { id: `creator-${handle}`, displayName, handle: `@${handle}`, platform: "other", role: "scout", status: "visible", qualityScore: 50 },
  });
  const user = await prisma.publicUser.upsert({
    where: { email },
    update: { displayName, creatorId: creator.id },
    create: { email, displayName, role: "scout", creatorId: creator.id },
  });
  await setUserCookie(user.id);
  return NextResponse.redirect(new URL("/me", request.url), { status: 303 });
}
