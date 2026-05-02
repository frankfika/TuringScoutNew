import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { optionalValidHttpUrl, sha256 } from "@/lib/validators";

const allowedEvents = new Set([
  "leaderboard_view",
  "opportunity_impression",
  "opportunity_detail_view",
  "outbound_click",
  "filter_apply",
  "submit_url",
  "submit_social_proof",
  "share_card_click",
  "creator_credit_view",
  "subscribe_submit",
  "report_issue",
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const eventName = typeof body?.eventName === "string" ? body.eventName : "";
  if (!allowedEvents.has(eventName)) return NextResponse.json({ error: "Unsupported eventName" }, { status: 400 });
  if (!optionalValidHttpUrl(body.targetUrl)) return NextResponse.json({ error: "Invalid targetUrl" }, { status: 400 });

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";
  const [visitorIdHash, sessionIdHash] = await Promise.all([sha256(ip), sha256(`${ip}:${userAgent}`)]);

  const event = await prisma.analyticsEvent.create({
    data: {
      eventName,
      opportunityId: body.opportunityId ? String(body.opportunityId) : undefined,
      projectId: body.projectId ? String(body.projectId) : undefined,
      creatorId: body.creatorId ? String(body.creatorId) : undefined,
      sourceModule: body.sourceModule ? String(body.sourceModule) : undefined,
      targetUrl: body.targetUrl ? String(body.targetUrl) : undefined,
      ctaType: body.ctaType ? String(body.ctaType) : undefined,
      category: body.category ? String(body.category) : undefined,
      props: body.props && typeof body.props === "object" ? body.props : undefined,
      visitorIdHash,
      sessionIdHash,
    },
  });

  return NextResponse.json({ ok: true, eventId: event.id });
}
