"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AREAS, GROUPS, areaHref, groupLabel, groupsOf, localeOf, pageHref, pageLabel,
  type GroupId, type Locale, type NotebookGroup,
} from "@/lib/notebook";
import { useUnlocked } from "@/lib/unlock";

const UI = {
  vi: { nav: "Câu hỏi phỏng vấn", all: "Tất cả chủ đề", close: "Đóng danh mục" },
  en: { nav: "Interview questions", all: "All topics", close: "Close contents" },
};

/** Where the current path sits in the notebook: area, group and page slug (any may be missing) */
function locate(pathname: string) {
  const locale = localeOf(pathname);
  const [, first, slug] = (locale === "en" ? pathname.slice(3) || "/" : pathname).split("/");
  const group = GROUPS.find(g => g.id === first);
  const area = group ? group.area : AREAS.find(a => a.id === first)?.id;
  return { locale, area, group: group?.id, slug };
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className="sn-chev" data-open={open} viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M4 2.5 7.5 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GroupPages({ group, slug, locale }: { group: NotebookGroup; slug?: string; locale: Locale }) {
  const main = group.pages.filter(p => !p.aside);
  const aside = group.pages.filter(p => p.aside);
  const item = (p: NotebookGroup["pages"][number]) => (
    <li key={p.slug}>
      <Link href={pageHref(group.id, p.slug, locale)} aria-current={p.slug === slug ? "page" : undefined}>
        {pageLabel(p, locale)}
      </Link>
    </li>
  );
  return (
    <ul className="sn-pages">
      {main.map(p => [
        p.section && <li key={`s-${p.slug}`} className="sn-section">{locale === "en" ? p.sectionEn ?? p.section : p.section}</li>,
        item(p),
      ])}
      {aside.length > 0 && <li className="sn-divider" aria-hidden="true" />}
      {aside.map(item)}
    </ul>
  );
}

/** Sidebar for the interview area: every interview group and page, so topics are one click apart */
function InterviewNav({ here }: { here: ReturnType<typeof locate> }) {
  const t = UI[here.locale];
  const groups = groupsOf("interview");
  // All groups start open (there are only a handful); the reader can fold any of them
  const [closed, setClosed] = useState<Set<GroupId>>(() => new Set());
  const [drawer, setDrawer] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Navigating closes the phone drawer and keeps the active link in view
  useEffect(() => {
    setDrawer(false);
    if (here.group) setClosed(s => { if (!s.has(here.group!)) return s; const n = new Set(s); n.delete(here.group!); return n; });
    navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [here.group, here.slug]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  return (
    <>
      <button type="button" className="sn-fab" aria-expanded={drawer} aria-controls="sitenav" onClick={() => setDrawer(true)}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {t.nav}
      </button>
      {drawer && <div className="sn-backdrop" onClick={() => setDrawer(false)} aria-hidden="true" />}

      <nav id="sitenav" ref={navRef} className="sitenav" data-open={drawer} aria-label={t.nav}>
        <div className="sn-head">
          <span>{t.nav}</span>
          <button type="button" className="sn-close" onClick={() => setDrawer(false)} aria-label={t.close}>×</button>
        </div>
        <Link href={areaHref("interview", here.locale)} className="sn-area-link" aria-current={!here.group ? "page" : undefined}>
          {t.all}
        </Link>
        <ul className="sn-groups">
          {groups.map(g => {
            const open = !closed.has(g.id);
            return (
              <li key={g.id}>
                <button type="button" className="sn-group" aria-expanded={open} data-active={here.group === g.id}
                  onClick={() => setClosed(s => { const n = new Set(s); if (n.has(g.id)) n.delete(g.id); else n.add(g.id); return n; })}>
                  <Chevron open={open} />
                  <i className={`dot ${g.tone}`} />
                  {groupLabel(g, here.locale)}
                </button>
                {open && <GroupPages group={g} slug={here.group === g.id ? here.slug : undefined} locale={here.locale} />}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

/** Wraps every page; only the (unlocked) interview area gets the sidebar layout, other areas render as before */
export function Shell({ children }: { children: ReactNode }) {
  const here = locate(usePathname());
  const unlocked = useUnlocked();
  if (here.area !== "interview" || !unlocked) return <>{children}</>;
  return (
    <div className="shell">
      <InterviewNav here={here} />
      <div className="shell-main">{children}</div>
    </div>
  );
}
