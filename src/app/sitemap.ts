import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [opportunities, projects] = await Promise.all([
    prisma.opportunity.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: siteUrl("/"), lastModified: new Date() },
    { url: siteUrl("/leaderboards"), lastModified: new Date() },
    { url: siteUrl("/methodology"), lastModified: new Date() },
    { url: siteUrl("/scouts"), lastModified: new Date() },
    { url: siteUrl("/submit"), lastModified: new Date() },
    ...categories.map((category) => ({ url: siteUrl(`/leaderboards/${category.slug}`), lastModified: new Date() })),
    ...opportunities.map((opportunity) => ({ url: siteUrl(`/opportunities/${opportunity.slug}`), lastModified: opportunity.updatedAt })),
    ...projects.map((project) => ({ url: siteUrl(`/projects/${project.slug}`), lastModified: project.updatedAt })),
  ];
}
