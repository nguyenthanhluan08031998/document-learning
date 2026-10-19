import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupCards } from "@/components/AreaCards";
import { PAGES } from "@/content";
import { AREAS, findArea } from "@/lib/notebook";

// One-segment routes are areas (/be/, /fe/ ...); the folder is shared with [group]/[slug]
type Params = { group: string };

export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return AREAS.map(a => ({ group: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const area = findArea((await params).group);
  return { title: area ? `${area.label} · ${area.hint}` : "Không tìm thấy" };
}

export default async function AreaPage({ params }: { params: Promise<Params> }) {
  const area = findArea((await params).group);
  if (!area) notFound();

  // An area can have a hand-written overview in content/<area>.tsx
  const Overview = PAGES[area.id];
  if (Overview) return <Overview />;

  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">{area.label.toLowerCase()} · tổng quan</div>
          <h1>{area.hint}</h1>
        </header>
        <section>
          <GroupCards area={area.id} />
        </section>
      </main>
    </div>
  );
}
