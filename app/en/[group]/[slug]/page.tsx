import type { Metadata } from "next";
import { PageView, pageMetadata, pageParams } from "@/components/RouteViews";

type Params = { group: string; slug: string };

// Every notebook page is generated at build time
export const dynamicParams = false;
export const generateStaticParams = pageParams;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { group, slug } = await params;
  return pageMetadata(group, slug, "en");
}

export default async function NotebookPage({ params }: { params: Promise<Params> }) {
  const { group, slug } = await params;
  return <PageView group={group} slug={slug} locale="en" />;
}
