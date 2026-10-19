"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GROUPS, pageHref, type GroupId } from "@/lib/notebook";

const STORAGE_KEY = "notebook-last-page";

// Remembers the last page opened in each group so the group button returns there
function readLast(): Partial<Record<GroupId, string>> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function NotebookHeader() {
  const pathname = usePathname();
  const [, groupSeg, slugSeg] = pathname.split("/");
  const active = GROUPS.find(g => g.id === groupSeg);
  const [last, setLast] = useState<Partial<Record<GroupId, string>>>({});

  useEffect(() => {
    const stored = readLast();
    if (active && slugSeg) {
      stored[active.id] = slugSeg;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch { /* storage unavailable */ }
    }
    setLast(stored);
  }, [active, slugSeg]);

  return (
    <header className="appbar">
      <div className="appbar-in">
        <div className="bar1">
          <Link href="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
            Sổ tay Backend <small>API · Messaging · Thiết kế · Đồng thời · Vận hành</small>
          </Link>
          <nav className="groups-nav" aria-label="Nhóm">
            <Link href="/" aria-current={!active ? "page" : undefined} data-pressed={!active}>
              Tổng quan
            </Link>
            {GROUPS.map(g => (
              <Link
                key={g.id}
                href={pageHref(g.id, last[g.id] ?? g.pages[0].slug)}
                data-pressed={active?.id === g.id}
              >
                <i className={`dot ${g.tone}`} />
                {g.label}
                <span className="gsub">· {g.hint}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="spacer" />
        {active && (
          <nav className="subnav" data-group={active.tone} aria-label={`Sổ tay ${active.label}`}>
            {active.pages.map(p => (
              <Link
                key={p.slug}
                href={pageHref(active.id, p.slug)}
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
