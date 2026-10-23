// Single source of truth for areas, groups, pages and their routes (Vietnamese at the root, English under /en)

export type Locale = "vi" | "en";

export type AreaId = "fe" | "be" | "database" | "cicd" | "git" | "ai" | "lang";

export interface Area {
  id: AreaId;
  label: string;
  hint: string;
  hintEn: string;
}

// Top-level sections; an area without groups is shown as "no content yet"
export const AREAS: Area[] = [
  { id: "fe", label: "FE", hint: "Frontend", hintEn: "Frontend" },
  { id: "be", label: "BE", hint: "Backend", hintEn: "Backend" },
  { id: "database", label: "Database", hint: "Cơ sở dữ liệu", hintEn: "Databases" },
  { id: "cicd", label: "CI/CD", hint: "Build, deploy", hintEn: "Build, deploy" },
  { id: "git", label: "Git", hint: "Quản lý mã nguồn", hintEn: "Source control" },
  { id: "ai", label: "AI", hint: "LLM, RAG, agent", hintEn: "LLM, RAG, agents" },
  { id: "lang", label: "Language", hint: "Ngôn ngữ lập trình", hintEn: "Programming languages" },
];

export type GroupId = "api" | "messaging" | "design" | "concurrency" | "operations" | "deploy" | "git" | "db" | "ai" | "golang" | "js";

export interface NotebookPage {
  slug: string;
  label: string;
  labelEn?: string;
  /** Comparison and cheat-sheet tabs are pushed to the right of the tab bar */
  aside?: boolean;
}

export interface NotebookGroup {
  id: GroupId;
  area: AreaId;
  label: string;
  hint: string;
  labelEn: string;
  hintEn: string;
  /** CSS class suffix used for the coloured dot and active tab */
  tone: "api" | "msg" | "design" | "conc" | "ops" | "deploy" | "git" | "db" | "ai" | "go" | "js";
  pages: NotebookPage[];
}

export const GROUPS: NotebookGroup[] = [
  {
    id: "js", area: "lang", label: "JS / TS", hint: "javascript, typescript", labelEn: "JS / TS", hintEn: "javascript, typescript", tone: "js",
    pages: [
      { slug: "core", label: "JS cốt lõi", labelEn: "Core JS" },
      { slug: "async", label: "Bất đồng bộ", labelEn: "Async" },
      { slug: "toolbox", label: "Công cụ hằng ngày", labelEn: "Everyday toolbox" },
      { slug: "typescript", label: "TypeScript" },
    ],
  },
  {
    id: "api", area: "be", label: "API", hint: "đồng bộ", labelEn: "API", hintEn: "synchronous", tone: "api",
    pages: [
      { slug: "rest", label: "REST" },
      { slug: "graphql", label: "GraphQL" },
      { slug: "grpc", label: "gRPC" },
      { slug: "compare", label: "So sánh", labelEn: "Compare", aside: true },
    ],
  },
  {
    id: "messaging", area: "be", label: "Messaging", hint: "bất đồng bộ", labelEn: "Messaging", hintEn: "asynchronous", tone: "msg",
    pages: [
      { slug: "kafka", label: "Kafka" },
      { slug: "rabbitmq", label: "RabbitMQ" },
      { slug: "nats", label: "NATS" },
      { slug: "compare", label: "So sánh", labelEn: "Compare", aside: true },
    ],
  },
  {
    id: "design", area: "be", label: "Thiết kế", hint: "pattern", labelEn: "Design", hintEn: "patterns", tone: "design",
    pages: [
      { slug: "oop", label: "OOP" },
      { slug: "principles", label: "Nguyên tắc", labelEn: "Principles" },
      { slug: "creational", label: "Creational" },
      { slug: "structural", label: "Structural" },
      { slug: "behavioral", label: "Behavioral" },
      { slug: "microservice", label: "Microservice" },
      { slug: "sso", label: "SSO & Microservice" },
      { slug: "edge", label: "Proxy, Gateway, LB" },
      { slug: "clean-architecture", label: "Clean Architecture" },
      { slug: "cheat-sheet", label: "Tra nhanh", labelEn: "Cheat sheet", aside: true },
    ],
  },
  {
    id: "concurrency", area: "be", label: "Đồng thời", hint: "lock", labelEn: "Concurrency", hintEn: "locks", tone: "conc",
    pages: [
      { slug: "overview", label: "Tổng quan", labelEn: "Overview" },
      { slug: "db-lock", label: "Lock trong DB", labelEn: "Locks in the DB" },
      { slug: "distributed-lock", label: "Distributed lock" },
      { slug: "compare", label: "So sánh", labelEn: "Compare", aside: true },
    ],
  },
  {
    id: "operations", area: "be", label: "Vận hành", hint: "logging", labelEn: "Operations", hintEn: "logging", tone: "ops",
    pages: [
      { slug: "logging", label: "Logging cơ bản", labelEn: "Logging basics" },
      { slug: "structured-logging", label: "Structured & context" },
      { slug: "build-logger", label: "Tự viết logger", labelEn: "Build a logger" },
      { slug: "observability", label: "Observability" },
    ],
  },
  {
    id: "golang", area: "lang", label: "Go", hint: "golang", labelEn: "Go", hintEn: "golang", tone: "go",
    pages: [
      { slug: "versions", label: "Phiên bản", labelEn: "Versions" },
      { slug: "vs-nodejs", label: "Go vs Node.js" },
      { slug: "runtime", label: "Runtime & GMP" },
      { slug: "concurrency", label: "Channel & Context" },
      { slug: "memory", label: "Bộ nhớ & GC", labelEn: "Memory & GC" },
      { slug: "data-structures", label: "Slice, Map, Interface" },
      { slug: "production", label: "Production" },
      { slug: "interview", label: "Phỏng vấn", labelEn: "Interview", aside: true },
    ],
  },
  {
    id: "deploy", area: "cicd", label: "Triển khai", hint: "docker, ci/cd", labelEn: "Deployment", hintEn: "docker, ci/cd", tone: "deploy",
    pages: [
      { slug: "docker", label: "Docker" },
      { slug: "cicd-ec2", label: "CI/CD lên EC2", labelEn: "CI/CD to EC2" },
    ],
  },
  {
    id: "git", area: "git", label: "Git", hint: "branch, merge", labelEn: "Git", hintEn: "branch, merge", tone: "git",
    pages: [
      { slug: "workflow", label: "Branching workflow" },
      { slug: "merge-rebase", label: "Merge vs Rebase" },
    ],
  },
  {
    id: "db", area: "database", label: "Database", hint: "SQL, NoSQL", labelEn: "Database", hintEn: "SQL, NoSQL", tone: "db",
    pages: [
      { slug: "postgresql", label: "PostgreSQL" },
      { slug: "mysql", label: "MySQL" },
      { slug: "mongodb", label: "MongoDB" },
      { slug: "dynamodb", label: "DynamoDB" },
      { slug: "compare", label: "So sánh", labelEn: "Compare", aside: true },
    ],
  },
  {
    id: "ai", area: "ai", label: "LLM", hint: "rag, agent", labelEn: "LLM", hintEn: "rag, agents", tone: "ai",
    pages: [
      { slug: "rag", label: "RAG vs Agentic RAG" },
    ],
  },
];

const prefix = (locale: Locale) => (locale === "en" ? "/en" : "");

export const areaHref = (area: AreaId, locale: Locale = "vi") => `${prefix(locale)}/${area}/`;
export const groupsOf = (area: AreaId) => GROUPS.filter(g => g.area === area);
export const findArea = (id: string) => AREAS.find(a => a.id === id);

export const pageHref = (group: GroupId, slug: string, locale: Locale = "vi") => `${prefix(locale)}/${group}/${slug}/`;
export const homeHref = (locale: Locale = "vi") => `${prefix(locale)}/`;

// Localized labels
export const areaHint = (a: Area, locale: Locale) => (locale === "en" ? a.hintEn : a.hint);
export const groupLabel = (g: NotebookGroup, locale: Locale) => (locale === "en" ? g.labelEn : g.label);
export const groupHint = (g: NotebookGroup, locale: Locale) => (locale === "en" ? g.hintEn : g.hint);
export const pageLabel = (p: NotebookPage, locale: Locale) => (locale === "en" ? p.labelEn ?? p.label : p.label);

// Locale from a pathname, and the same page in the other language
export const localeOf = (pathname: string): Locale => (pathname === "/en" || pathname.startsWith("/en/") ? "en" : "vi");
export function switchLocale(pathname: string, to: Locale): string {
  const bare = localeOf(pathname) === "en" ? pathname.slice(3) || "/" : pathname;
  return to === "en" ? `/en${bare === "/" ? "/" : bare}` : bare;
}

export function findPage(group: string, slug: string) {
  const g = GROUPS.find(x => x.id === group);
  const p = g?.pages.find(x => x.slug === slug);
  return g && p ? { group: g, page: p } : null;
}

export function allRoutes() {
  return GROUPS.flatMap(g => g.pages.map(p => ({ group: g.id, slug: p.slug })));
}
