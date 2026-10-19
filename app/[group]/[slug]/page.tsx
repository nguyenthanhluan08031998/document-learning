import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotebookContent } from "@/components/NotebookContent";
import { allRoutes, findPage } from "@/lib/notebook";

type Params = { group: string; slug: string };

// Every notebook page is generated at build time
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return allRoutes();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { group, slug } = await params;
  const found = findPage(group, slug);
  return { title: found ? `${found.page.label} · ${found.group.label}` : "Không tìm thấy" };
}

export default async function NotebookPage({ params }: { params: Promise<Params> }) {
  const { group, slug } = await params;
  if (!findPage(group, slug)) notFound();
  return <NotebookContent name={`${group}__${slug}`} />;
}
