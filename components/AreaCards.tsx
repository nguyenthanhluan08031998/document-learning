import Link from "next/link";
import { PAGES } from "@/content";
import { AREAS, areaHref, groupsOf, pageHref, type AreaId } from "@/lib/notebook";

const Empty = () => <p className="empty">Chưa có nội dung.</p>;

/** Home page: one card per area with links to its groups */
export function AreaCards() {
  return (
    <div className="groups">
      {AREAS.map(a => {
        const groups = groupsOf(a.id);
        return (
          <div key={a.id} className="group">
            <div className="g-head">
              <span className="g-tag">{a.hint}</span>
              <h2><Link href={areaHref(a.id)} className="g-title">{a.label}</Link></h2>
            </div>
            {groups.length || PAGES[a.id] ? (
              <div className="g-list">
                {PAGES[a.id] && (
                  <Link className="g-item" href={areaHref(a.id)}>
                    <b>Tổng quan {a.label}</b>
                    <span>Trang giới thiệu của mảng {a.hint}</span>
                  </Link>
                )}
                {groups.map(g => (
                  <Link key={g.id} className="g-item" href={pageHref(g.id, g.pages[0].slug)}>
                    <b><i className={`dot ${g.tone}`} /> {g.label}</b>
                    <span>{g.pages.map(p => p.label).join(" · ")}</span>
                  </Link>
                ))}
              </div>
            ) : <Empty />}
          </div>
        );
      })}
    </div>
  );
}

/** Area page without a hand-written overview: one card per group with links to its pages */
export function GroupCards({ area }: { area: AreaId }) {
  const groups = groupsOf(area);
  if (!groups.length) return <Empty />;
  return (
    <div className="groups">
      {groups.map(g => (
        <div key={g.id} className={`group g-${g.tone}`}>
          <div className="g-head"><span className="g-tag">{g.hint}</span><h2>{g.label}</h2></div>
          <div className="g-list">
            {g.pages.map(p => (
              <Link key={p.slug} className={p.aside ? "g-item g-cmp" : "g-item"} href={pageHref(g.id, p.slug)}>
                <b>{p.label}</b>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
