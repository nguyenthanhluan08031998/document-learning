// Single source of truth for groups, pages and their routes

export type GroupId = "api" | "messaging" | "design" | "concurrency" | "operations" | "deploy";

export interface NotebookPage {
  slug: string;
  label: string;
  /** Comparison and cheat-sheet tabs are pushed to the right of the tab bar */
  aside?: boolean;
}

export interface NotebookGroup {
  id: GroupId;
  label: string;
  hint: string;
  /** CSS class suffix used for the coloured dot and active tab */
  tone: "api" | "msg" | "design" | "conc" | "ops" | "deploy";
  pages: NotebookPage[];
}

export const GROUPS: NotebookGroup[] = [
  {
    id: "api", label: "API", hint: "đồng bộ", tone: "api",
    pages: [
      { slug: "rest", label: "REST" },
      { slug: "graphql", label: "GraphQL" },
      { slug: "grpc", label: "gRPC" },
      { slug: "compare", label: "So sánh", aside: true },
    ],
  },
  {
    id: "messaging", label: "Messaging", hint: "bất đồng bộ", tone: "msg",
    pages: [
      { slug: "kafka", label: "Kafka" },
      { slug: "rabbitmq", label: "RabbitMQ" },
      { slug: "nats", label: "NATS" },
      { slug: "compare", label: "So sánh", aside: true },
    ],
  },
  {
    id: "design", label: "Thiết kế", hint: "pattern", tone: "design",
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
    id: "concurrency", label: "Đồng thời", hint: "lock", tone: "conc",
    pages: [
      { slug: "overview", label: "Tổng quan" },
      { slug: "db-lock", label: "Lock trong DB" },
      { slug: "distributed-lock", label: "Distributed lock" },
      { slug: "compare", label: "So sánh", aside: true },
    ],
  },
  {
    id: "operations", label: "Vận hành", hint: "logging", tone: "ops",
    pages: [
      { slug: "logging", label: "Logging cơ bản" },
      { slug: "structured-logging", label: "Structured & context" },
      { slug: "build-logger", label: "Tự viết logger" },
      { slug: "observability", label: "Observability" },
    ],
  },
  {
    id: "deploy", label: "Triển khai", hint: "docker, ci/cd", tone: "deploy",
    pages: [
      { slug: "docker", label: "Docker" },
      { slug: "cicd-ec2", label: "CI/CD lên EC2" },
    ],
  },
];

export const pageHref = (group: GroupId, slug: string) => `/${group}/${slug}/`;

export function findPage(group: string, slug: string) {
  const g = GROUPS.find(x => x.id === group);
  const p = g?.pages.find(x => x.slug === slug);
  return g && p ? { group: g, page: p } : null;
}

export function allRoutes() {
  return GROUPS.flatMap(g => g.pages.map(p => ({ group: g.id, slug: p.slug })));
}
