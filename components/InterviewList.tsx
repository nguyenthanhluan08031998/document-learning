import type { ReactNode } from "react";
import { Code } from "@/components/Code";
import { ExpandAll } from "@/components/ExpandAll";
import type { Locale } from "@/lib/notebook";

export interface Sample { lang: string; src: string }

export interface Item {
  q: string;
  /** Short answer */
  a: string;
  /** Optional diagram, e.g. <Flow/> */
  diagram?: ReactNode;
  /** Optional worked example(s) */
  code?: Sample | Sample[];
  href: string;
  label: string;
}

export interface InterviewData { eyebrow: string; title: string; lede: string; items: Item[] }

const T = {
  vi: { toc: "Mục lục", section: "Câu hỏi thường gặp", diagram: "sơ đồ", example: "ví dụ", exTitle: "Ví dụ", src: "Tài liệu chính thức", open: "Mở tất cả", close: "Đóng tất cả" },
  en: { toc: "Contents", section: "Common questions", diagram: "diagram", example: "example", exTitle: "Example", src: "Official docs", open: "Expand all", close: "Collapse all" },
};

export function InterviewList({ locale, eyebrow, title, lede, items }: { locale: Locale } & InterviewData) {
  const t = T[locale];
  return (
    <div className="wrap">
      <nav className="toc" aria-label={title}>
        <div className="label">{t.toc}</div>
        <ol>
          <li><a href="#iv-qa"><span>01</span>{t.section}</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
        </header>

        <section id="iv-qa">
          <h2><span className="n">01</span>{t.section}</h2>
          <ExpandAll open={t.open} close={t.close} />
          <div className="qa-list">
            {items.map((it, i) => {
              const samples = it.code ? (Array.isArray(it.code) ? it.code : [it.code]) : [];
              return (
                <details className="qa" key={it.q}>
                  <summary>
                    <span className="qn">{String(i + 1).padStart(2, "0")}</span>
                    <span className="qt">
                      {it.q}
                      {it.diagram && <span className="tag">{t.diagram}</span>}
                      {samples.length > 0 && <span className="tag">{t.example}</span>}
                    </span>
                  </summary>
                  <div className="qa-body">
                    <p>{it.a}</p>
                    {it.diagram}
                    {samples.length > 0 && <div className="qa-label">{t.exTitle}</div>}
                    {samples.map((s, k) => <Code key={k} lang={s.lang}>{s.src}</Code>)}
                    <p className="qa-src">{t.src}: <a href={it.href} target="_blank" rel="noreferrer">{it.label}</a></p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
