// Single source of truth for areas, groups, pages and their routes

export type AreaId = "fe" | "be" | "database" | "cicd" | "git";

export interface Area {
  id: AreaId;
  label: string;
  hint: string;
}

// Top-level sections; an area without groups is shown as "no content yet"
export const AREAS: Area[] = [
  { id: "fe", label: "FE", hint: "Frontend" },
  { id: "be", label: "BE", hint: "Backend" },
  { id: "database", label: "Database", hint: "Cơ sở dữ liệu" },
  { id: "cicd", label: "CI/CD", hint: "Build, deploy" },
  { id: "git", label: "Git", hint: "Quản lý mã nguồn" },
];

export type GroupId = "api" | "messaging" | "design" | "concurrency" | "operations" | "deploy" | "git" | "db";

export interface NotebookPage {
  slug: string;
  label: string;
  /** Comparison and cheat-sheet tabs are pushed to the right of the tab bar */
  aside?: boolean;
}

export interface NotebookGroup {
  id: GroupId;
  area: AreaId;
  label: string;
  hint: string;
  /** CSS class suffix used for the coloured dot and active tab */
  tone: "api" | "msg" | "design" | "conc" | "ops" | "deploy" | "git" | "db";
  pages: NotebookPage[];
}

export const GROUPS: NotebookGroup[] = [
  {
    id: "api", area: "be", label: "API", hint: "đồng bộ", tone: "api",
    pages: [
      { slug: "rest", label: "REST" },
      { slug: "graphql", label: "GraphQL" },
      { slug: "grpc", label: "gRPC" },
      { slug: "compare", label: "So sánh", aside: true },
    ],
  },
  {
    id: "messaging", area: "be", label: "Messaging", hint: "bất đồng bộ", tone: "msg",
    pages: [
      { slug: "kafka", label: "Kafka" },
      { slug: "rabbitmq", label: "RabbitMQ" },
      { slug: "nats", label: "NATS" },
      { slug: "compare", label: "So sánh", aside: true },
    ],
  },
  {
    id: "design", area: "be", label: "Thiết kế", hint: "pattern", tone: "design",
    pages: [
      { slug: "oop", label: "OOP" },
      { slug: "principles", label: "Nguyên tắc" },
      { slug: "creational", label: "Creational" },
      { slug: "structural", label: "Structural" },
      { slug: "behavioral", label: "Behavioral" },
      { slug: "microservice", label: "Microservice" },
      { slug: "clean-architecture", label: "Clean Architecture" },
      { slug: "cheat-sheet", label: "Tra nhanh", aside: true },
    ],
  },
  {
    id: "concurrency", area: "be", label: "Đồng thời", hint: "lock", tone: "conc",
    pages: [
      { slug: "overview", label: "Tổng quan" },
      { slug: "db-lock", label: "Lock trong DB" },
      { slug: "distributed-lock", label: "Distributed lock" },
      { slug: "compare", label: "So sánh", aside: true },
    ],
  },
  {
    id: "operations", area: "be", label: "Vận hành", hint: "logging", tone: "ops",
    pages: [
      { slug: "logging", label: "Logging cơ bản" },
      { slug: "structured-logging", label: "Structured & context" },
      { slug: "build-logger", label: "Tự viết logger" },
      { slug: "observability", label: "Observability" },
    ],
  },
  {
    id: "deploy", area: "cicd", label: "Triển khai", hint: "docker, ci/cd", tone: "deploy",
    pages: [
      { slug: "docker", label: "Docker" },
      { slug: "cicd-ec2", label: "CI/CD lên EC2" },
    ],
  },
  {
    id: "git", area: "git", label: "Git", hint: "branch, merge", tone: "git",
    pages: [
      { slug: "workflow", label: "Branching workflow" },
      { slug: "merge-rebase", label: "Merge vs Rebase" },
    ],
  },
  {
    id: "db", area: "database", label: "Database", hint: "SQL, NoSQL", tone: "db",
    pages: [
      { slug: "postgresql", label: "PostgreSQL" },
      { slug: "mysql", label: "MySQL" },
      { slug: "mongodb", label: "MongoDB" },
      { slug: "dynamodb", label: "DynamoDB" },
      { slug: "compare", label: "So sánh", aside: true },
    ],
  },
];

export const areaHref = (area: AreaId) => `/${area}/`;
export const groupsOf = (area: AreaId) => GROUPS.filter(g => g.area === area);
export const findArea = (id: string) => AREAS.find(a => a.id === id);

export const pageHref = (group: GroupId, slug: string) => `/${group}/${slug}/`;

export function findPage(group: string, slug: string) {
  const g = GROUPS.find(x => x.id === group);
  const p = g?.pages.find(x => x.slug === slug);
  return g && p ? { group: g, page: p } : null;
}

export function allRoutes() {
  return GROUPS.flatMap(g => g.pages.map(p => ({ group: g.id, slug: p.slug })));
}
