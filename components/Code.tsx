import { codeToHtml } from "shiki";

/** Server component: highlights a code sample at build time with the One Dark theme */
export async function Code({ lang = "ts", children }: { lang?: string; children: string }) {
  const html = await codeToHtml(children, {
    lang,
    theme: "one-dark-pro",
    transformers: [{ pre(node) { this.addClassToHast(node, "code"); } }],
  });
  return <div className="code-wrap" dangerouslySetInnerHTML={{ __html: html }} />;
}
