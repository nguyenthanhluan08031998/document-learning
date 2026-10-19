import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content", "pages");
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Loads a pre-rendered notebook page (text, SVG diagrams and highlighted code).
 * Runs only at build time because the site is statically exported.
 */
export async function loadPageHtml(name: string): Promise<string> {
  const html = await readFile(path.join(CONTENT_DIR, `${name}.html`), "utf8");
  // Cross-page links are stored as {{BASE}}/group/slug#anchor; add base path and trailing slash
  return html.replace(/href="\{\{BASE\}\}(\/[^"#]*)(#[^"]*)?"/g, (_m, p: string, hash: string = "") => {
    const route = p === "/" ? "/" : `${p.replace(/\/$/, "")}/`;
    return `href="${BASE_PATH}${route}${hash}"`;
  });
}
