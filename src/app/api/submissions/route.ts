import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, isValidHttpUrl, optionalValidHttpUrl, sha256 } from "@/lib/validators";

const allowedTypes = new Set(["project", "opportunity", "free_credits", "github_repo", "agent", "bounty", "creator_content", "correction", "risk_report", "sponsored_interest"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  if (body.website) return NextResponse.json({ ok: true, submissionId: "received", status: "received" });

  const url = String(body.url ?? "").trim();
  const type = String(body.type ?? "").trim();
  const contentUrl = body.contentUrl ? String(body.contentUrl).trim() : undefined;
  const contactEmail = body.contactEmail ? String(body.contactEmail).trim() : undefined;

  if (!isValidHttpUrl(url)) return NextResponse.json({ error: "A valid http(s) URL is required." }, { status: 400 });
  if (!allowedTypes.has(type)) return NextResponse.json({ error: "Unsupported submission type." }, { status: 400 });
  if (!optionalValidHttpUrl(contentUrl)) return NextResponse.json({ error: "Creator/content URL must be http(s)." }, { status: 400 });
  if (!isValidEmail(contactEmail)) return NextResponse.json({ error: "Invalid email address." }, { status: 400 });

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";
  const [submitterIpHash, userAgentHash] = await Promise.all([sha256(ip), sha256(userAgent)]);

  const submission = await prisma.submission.create({
    data: {
      url,
      type,
      note: body.note ? String(body.note).slice(0, 4000) : undefined,
      contactEmail,
      socialHandle: body.socialHandle ? String(body.socialHandle).slice(0, 120) : undefined,
      contentUrl,
      publicCreditOptIn: Boolean(body.publicCreditOptIn),
      submitterIpHash,
      userAgentHash,
      status: "received",
    },
  });

  await prisma.analyticsEvent.create({ data: { eventName: type === "creator_content" ? "submit_social_proof" : "submit_url", props: { type } } });
  return NextResponse.json({ ok: true, submissionId: submission.id, status: submission.status });
}
