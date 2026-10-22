import { Code } from "@/components/Code";

/** Server component: Go sample on the left, the Node.js equivalent on the right (stacked on narrow screens) */
export function CodeCompare({ go, js, goLang = "go", jsLang = "js" }: { go: string; js: string; goLang?: string; jsLang?: string }) {
  return (
    <div className="cmp code-cmp">
      <div><div className="code-lbl">Go</div><Code lang={goLang}>{go}</Code></div>
      <div><div className="code-lbl">Node.js</div><Code lang={jsLang}>{js}</Code></div>
    </div>
  );
}
