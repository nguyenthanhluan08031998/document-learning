import type { Metadata } from "next";
import { AreaView, areaMetadata, areaParams } from "@/components/RouteViews";

// One-segment routes are areas (/en/be/, /en/fe/ ...); the folder is shared with [group]/[slug]
type Params = { group: string };

export const dynamicParams = false;
export const generateStaticParams = areaParams;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return areaMetadata((await params).group, "en");
}

export default async function AreaPage({ params }: { params: Promise<Params> }) {
  return <AreaView id={(await params).group} locale="en" />;
}
