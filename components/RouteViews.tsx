import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupCards } from "@/components/AreaCards";
import { PAGES } from "@/content";
import { PAGES as PAGES_EN } from "@/content/en";
import { AREAS, allRoutes, areaHint, findArea, findPage, groupLabel, pageLabel, type Locale } from "@/lib/notebook";

// Shared by the Vietnamese routes at the root and the English routes under /en
const registry = (locale: Locale) => (locale === "en" ? PAGES_EN : PAGES);
const NOT_FOUND = { vi: "Không tìm thấy", en: "Not found" };
// The root layout's title template is Vietnamese, so English pages set an absolute title
const title = (text: string, locale: Locale): Metadata["title"] =>
  locale === "en" ? { absolute: `${text} · Programming notebook` } : text;

export const areaParams = () => AREAS.map(a => ({ group: a.id }));
export const pageParams = () => allRoutes();

export function areaMetadata(id: string, locale: Locale): Metadata {
  const area = findArea(id);
  return { title: title(area ? `${area.label} · ${areaHint(area, locale)}` : NOT_FOUND[locale], locale) };
}

export function pageMetadata(group: string, slug: string, locale: Locale): Metadata {
  const found = findPage(group, slug);
  return { title: title(found ? `${pageLabel(found.page, locale)} · ${groupLabel(found.group, locale)}` : NOT_FOUND[locale], locale) };
}

export function AreaView({ id, locale }: { id: string; locale: Locale }) {
  const area = findArea(id);
  if (!area) notFound();

  // An area can have a hand-written overview in content/<area>.tsx
  const Overview = registry(locale)[area.id];
  if (Overview) return <Overview />;

  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">{area.label.toLowerCase()} · {locale === "en" ? "overview" : "tổng quan"}</div>
          <h1>{areaHint(area, locale)}</h1>
        </header>
        <section>
          <GroupCards area={area.id} locale={locale} />
        </section>
      </main>
    </div>
  );
}

export function PageView({ group, slug, locale }: { group: string; slug: string; locale: Locale }) {
  const Page = registry(locale)[`${group}/${slug}`];
  if (!Page) notFound();
  return <Page />;
}
