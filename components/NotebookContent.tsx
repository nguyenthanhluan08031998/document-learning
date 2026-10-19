import { loadPageHtml } from "@/lib/content";

/** Server component: renders one pre-rendered notebook page */
export async function NotebookContent({ name }: { name: string }) {
  const html = await loadPageHtml(name);
  return <div className="notebook-page" dangerouslySetInnerHTML={{ __html: html }} />;
}
