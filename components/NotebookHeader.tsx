"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AREAS, GROUPS, areaHref, findArea, groupsOf, pageHref, type GroupId } from "@/lib/notebook";

const STORAGE_KEY = "notebook-last-page";

// Remembers the last page opened in each group so the group button returns there
function readLast(): Partial<Record<GroupId, string>> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function NotebookHeader() {
  const pathname = usePathname();
  const [, firstSeg, slugSeg] = pathname.split("/");
  // First segment is either a group (/api/rest/) or an area (/be/)
  const activeGroup = GROUPS.find(g => g.id === firstSeg);
  const activeArea = activeGroup ? findArea(activeGroup.area) : findArea(firstSeg);
  const [last, setLast] = useState<Partial<Record<GroupId, string>>>({});

  useEffect(() => {
    const stored = readLast();
    if (activeGroup && slugSeg) {
      stored[activeGroup.id] = slugSeg;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch { /* storage unavailable */ }
    }
    setLast(stored);
  }, [activeGroup, slugSeg]);

  const areaGroups = activeArea ? groupsOf(activeArea.id) : [];

  return (
    <header className="appbar">
      <div className="appbar-in">
        <div className="bar1">
          <Link href="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
            Sổ tay lập trình <small>FE · BE · Database · CI/CD · Git</small>
          </Link>
          <nav className="groups-nav" aria-label="Mảng">
            <Link href="/" aria-current={!activeArea ? "page" : undefined} data-pressed={!activeArea}>
              Tổng quan
            </Link>
            {AREAS.map(a => (
              <Link key={a.id} href={areaHref(a.id)} data-pressed={activeArea?.id === a.id}>
                {a.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="spacer" />
        {areaGroups.length > 0 && (
          <nav className="areanav" aria-label={`Nhóm trong ${activeArea!.label}`}>
            {areaGroups.map(g => (
              <Link
                key={g.id}
                href={pageHref(g.id, last[g.id] ?? g.pages[0].slug)}
                aria-current={activeGroup?.id === g.id ? "true" : undefined}
              >
                <i className={`dot ${g.tone}`} />
                {g.label}
                <span className="gsub">· {g.hint}</span>
              </Link>
            ))}
          </nav>
        )}
        {activeGroup && (
          <nav className="subnav" data-group={activeGroup.tone} aria-label={`Sổ tay ${activeGroup.label}`}>
            {activeGroup.pages.map(p => (
              <Link
                key={p.slug}
                href={pageHref(activeGroup.id, p.slug)}
                className={p.aside ? "cmpbtn" : undefined}
                aria-current={p.slug === slugSeg ? "page" : undefined}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
