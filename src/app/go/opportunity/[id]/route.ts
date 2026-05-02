import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/validators";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({ where: { id }, include: { project: true } });
  if (!opportunity || opportunity.status !== "published") return NextResponse.redirect(new URL("/", request.url));

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";
  const [visitorIdHash, sessionIdHash] = await Promise.all([sha256(ip), sha256(`${ip}:${userAgent}`)]);
  const sourceModule = new URL(request.url).searchParams.get("module") ?? "unknown";

  await prisma.outboundClick.create({
    data: {
      opportunityId: opportunity.id,
      projectId: opportunity.projectId,
      targetUrl: opportunity.primaryCtaUrl,
      ctaType: opportunity.primaryCtaLabel,
      sourceModule,
      category: opportunity.project.category,
      visitorIdHash,
      sessionIdHash,
      isSponsored: Boolean(opportunity.commercialLabel),
    },
  });

  await prisma.analyticsEvent.create({
    data: {
      eventName: "outbound_click",
      opportunityId: opportunity.id,
      projectId: opportunity.projectId,
      targetUrl: opportunity.primaryCtaUrl,
      ctaType: opportunity.primaryCtaLabel,
      sourceModule,
      category: opportunity.project.category,
      visitorIdHash,
      sessionIdHash,
    },
  });

  return NextResponse.redirect(opportunity.primaryCtaUrl);
}
