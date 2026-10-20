import Link from "next/link";
import { PAGES } from "@/content";
import {
  AREAS, areaHint, areaHref, groupHint, groupLabel, groupsOf, pageHref, pageLabel, type AreaId, type Locale,
} from "@/lib/notebook";

const UI = {
  vi: { empty: "Chưa có nội dung.", overview: "Tổng quan", intro: "Trang giới thiệu của mảng" },
  en: { empty: "No content yet.", overview: "Overview of", intro: "Introduction to" },
};

const Empty = ({ locale }: { locale: Locale }) => <p className="empty">{UI[locale].empty}</p>;

/** Home page: one card per area with links to its groups */
export function AreaCards({ locale = "vi" }: { locale?: Locale }) {
  const t = UI[locale];
  return (
    <div className="groups">
      {AREAS.map(a => {
        const groups = groupsOf(a.id);
        return (
          <div key={a.id} className="group">
            <div className="g-head">
              <span className="g-tag">{areaHint(a, locale)}</span>
              <h2><Link href={areaHref(a.id, locale)} className="g-title">{a.label}</Link></h2>
            </div>
            {groups.length || PAGES[a.id] ? (
              <div className="g-list">
                {PAGES[a.id] && (
                  <Link className="g-item" href={areaHref(a.id, locale)}>
                    <b>{t.overview} {a.label}</b>
                    <span>{t.intro} {areaHint(a, locale)}</span>
                  </Link>
                )}
                {groups.map(g => (
                  <Link key={g.id} className="g-item" href={pageHref(g.id, g.pages[0].slug, locale)}>
                    <b><i className={`dot ${g.tone}`} /> {groupLabel(g, locale)}</b>
                    <span>{g.pages.map(p => pageLabel(p, locale)).join(" · ")}</span>
                  </Link>
                ))}
              </div>
            ) : <Empty locale={locale} />}
          </div>
        );
      })}
    </div>
  );
}

/** Area page without a hand-written overview: one card per group with links to its pages */
export function GroupCards({ area, locale = "vi" }: { area: AreaId; locale?: Locale }) {
  const groups = groupsOf(area);
  if (!groups.length) return <Empty locale={locale} />;
  return (
    <div className="groups">
      {groups.map(g => (
        <div key={g.id} className={`group g-${g.tone}`}>
          <div className="g-head"><span className="g-tag">{groupHint(g, locale)}</span><h2>{groupLabel(g, locale)}</h2></div>
          <div className="g-list">
            {g.pages.map(p => (
              <Link key={p.slug} className={p.aside ? "g-item g-cmp" : "g-item"} href={pageHref(g.id, p.slug, locale)}>
                <b>{pageLabel(p, locale)}</b>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
