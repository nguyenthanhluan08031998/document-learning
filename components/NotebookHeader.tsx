"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AREAS, GROUPS, areaHref, findArea, groupHint, groupLabel, groupsOf, homeHref, localeOf, pageHref, pageLabel, switchLocale,
  type GroupId,
} from "@/lib/notebook";

const STORAGE_KEY = "notebook-last-page";

const UI = {
  vi: { brand: "Sổ tay lập trình", overview: "Tổng quan", areas: "Mảng", groupsIn: "Nhóm trong", notebook: "Sổ tay", language: "Ngôn ngữ" },
  en: { brand: "Programming notebook", overview: "Overview", areas: "Areas", groupsIn: "Groups in", notebook: "Notebook", language: "Language" },
};

// Remembers the last page opened in each group so the group button returns there
function readLast(): Partial<Record<GroupId, string>> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function NotebookHeader() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const t = UI[locale];
  // Path without the /en prefix: first segment is a group (/api/rest/) or an area (/be/)
  const [, firstSeg, slugSeg] = (locale === "en" ? pathname.slice(3) || "/" : pathname).split("/");
  const activeGroup = GROUPS.find(g => g.id === firstSeg);
  const activeArea = activeGroup ? findArea(activeGroup.area) : findArea(firstSeg);
  const [last, setLast] = useState<Partial<Record<GroupId, string>>>({});

  useEffect(() => {
    document.documentElement.lang = locale;
    const stored = readLast();
    if (activeGroup && slugSeg) {
      stored[activeGroup.id] = slugSeg;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch { /* storage unavailable */ }
    }
    setLast(stored);
  }, [activeGroup, slugSeg, locale]);

  const areaGroups = activeArea ? groupsOf(activeArea.id) : [];

  return (
    <header className="appbar">
      <div className="appbar-in">
        <div className="bar1">
          <Link href={homeHref(locale)} className="brand" style={{ color: "inherit", textDecoration: "none" }}>
            {t.brand} <small>FE · BE · Database · CI/CD · Git</small>
          </Link>
          <div className="bar1-right">
            <nav className="groups-nav" aria-label={t.areas}>
              <Link href={homeHref(locale)} aria-current={!activeArea ? "page" : undefined} data-pressed={!activeArea}>
                {t.overview}
              </Link>
              {AREAS.map(a => (
                <Link key={a.id} href={areaHref(a.id, locale)} data-pressed={activeArea?.id === a.id}>
                  {a.label}
                </Link>
              ))}
            </nav>
            <nav className="lang-switch" aria-label={t.language}>
              <Link href={switchLocale(pathname, "vi")} hrefLang="vi" aria-current={locale === "vi" ? "true" : undefined}>VI</Link>
              <Link href={switchLocale(pathname, "en")} hrefLang="en" aria-current={locale === "en" ? "true" : undefined}>EN</Link>
            </nav>
          </div>
        </div>
        <div className="spacer" />
        {areaGroups.length > 0 && (
          <nav className="areanav" aria-label={`${t.groupsIn} ${activeArea!.label}`}>
            {areaGroups.map(g => (
              <Link
                key={g.id}
                href={pageHref(g.id, last[g.id] ?? g.pages[0].slug, locale)}
                aria-current={activeGroup?.id === g.id ? "true" : undefined}
              >
                <i className={`dot ${g.tone}`} />
                {groupLabel(g, locale)}
                <span className="gsub">· {groupHint(g, locale)}</span>
              </Link>
            ))}
          </nav>
        )}
        {activeGroup && (
          <nav className="subnav" data-group={activeGroup.tone} aria-label={`${t.notebook} ${groupLabel(activeGroup, locale)}`}>
            {activeGroup.pages.map(p => (
              <Link
                key={p.slug}
                href={pageHref(activeGroup.id, p.slug, locale)}
                className={p.aside ? "cmpbtn" : undefined}
                aria-current={p.slug === slugSeg ? "page" : undefined}
              >
                {pageLabel(p, locale)}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
