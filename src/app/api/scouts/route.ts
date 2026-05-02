import { NextResponse } from "next/server";
import { getVisibleCreators } from "@/lib/data";

export async function GET() {
  const creators = await getVisibleCreators();
  return NextResponse.json({
    items: creators.map((creator) => ({
      id: creator.id,
      displayName: creator.displayName,
      handle: creator.handle,
      platform: creator.platform,
      role: creator.role,
      qualityScore: creator.qualityScore,
      contributions: creator.creatorContent.map((content) => ({
        contentUrl: content.contentUrl,
        label: content.publicCreditLabel,
        projectName: content.project?.name,
        opportunityTitle: content.opportunity?.title,
      })),
    })),
  });
}
