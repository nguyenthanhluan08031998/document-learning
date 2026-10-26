import { SystemDiagram, type DiagramText } from "@/components/SystemDiagram";
import { UI_EN, INFO_EN } from "@/components/systemInfo.en";

// English labels for the shared diagram
const EN: DiagramText = {
  aria: "Nested system design: users pass through the edge (GeoDNS, CDN, WAF, waiting room, rented infrastructure) and then enter your region; an L4 NLB spreads connections over the Nginx Ingress; inside the Application frame (Kubernetes cluster) sit the Ingress, the Next.js and admin/seller frontends, the API Gateway, the user, catalog, cart, order and payment services and the notification, search, inventory and shipping workers; below is the data layer with Kafka, Redis, PgBouncer, a database per service (orders split into 16 shards), S3, Elasticsearch and a shared warehouse_db. On the right: observability, CI/CD and secrets across everything; external payment gateways and carriers",
  users: { title: "Users", sub: "customer devices", items: [["Web storefront", "Next.js"], ["Mobile app", "iOS · Android"], ["Admin portal", "ops, support"], ["Seller center", "sellers"]] },
  edge: { title: "Edge", sub: "rented", items: [["GeoDNS", "geo routing"], ["CDN · L7", "static files"], ["WAF · L7", "blocks bots"], ["Waiting room", "sale queue"], ["Miss → S3", "skips the VPC"]] },
  region: { title: "Region ap-southeast-1 · your VPC", sub: "every region has one full set like this" },
  nlb: { row: ["Public subnet", "only way in"], lines: ["NLB · Network Load Balancer · L4", "1 public IP, many AZs · spreads TCP connections, does not read HTTP"], arrow: "TCP :443 → spread over the Ingress pods" },
  app: { title: "Application · Kubernetes cluster", sub: "your code, built into images, running as pods" },
  rows: { ingress: ["Cluster entry", "reverse proxy"], frontend: ["Frontend", "renders the UI"], gateway: ["Gateway", "API front door"], service: ["Services", "business logic"], worker: ["Workers", "background jobs"] },
  ingress: ["Ingress · Nginx ×3 pods · L7", "SSL · reads path: / → Next.js · /gateway/api → BFF · /admin → internal FE"],
  routes: ["/", "/admin, /seller", "/gateway/api", "SSR calls BFF"],
  next: ["Next.js ×10 pods", "SSR, returns HTML"],
  fe: ["Admin + Seller FE ×4", "internal UI"],
  gw: ["API Gateway · BFF ×50 pods · L7", "JWT · rate limit · routing · REST / GraphQL"],
  services: [["user-svc", "×20 pods"], ["catalog-svc", "×100 pods"], ["cart-svc", "×60 pods"], ["order-svc", "×200 pods"], ["payment-svc", "×80 pods"]],
  workers: [["notification", "×30 consumers"], ["search", "×20 consumers"], ["inventory", "×100 consumers"], ["shipping", "×50 consumers"]],
  data: { title: "Data layer", sub: "" },
  dataRows: { events: ["Events", "asynchronous"], cache: ["Cache", "fast reads"], store: ["Durable", "source of truth"], other: ["Other", "search, warehouse"] },
  kafka: ["Kafka · 200 partitions · key = orderId", "OrderCreated · PaymentSucceeded · ProductUpdated"],
  redis: ["Redis Cluster · 6 shards", "products, prices, carts · stock (DECR) · sessions"],
  pgb: ["PgBouncer", "connection pool"],
  stores: [["users", "Postgres"], ["products", "MongoDB"], ["S3", "images, files"], ["orders", "16 shards"], ["payments", "Postgres"]],
  es: ["Elasticsearch", "search index"],
  wh: ["warehouse_db · shared DB", "inventory + shipping"],
  side: { cross: "CROSS-CUTTING", obs: ["Observability", "log · metric · trace"], cicd: ["CI/CD", "build image · deploy"], cfg: ["Config · secrets", "Vault, K8s secret"], ext: "EXTERNAL", pay: ["Payment gateway", "VNPay · MoMo · Stripe"], ship: ["Shipping", "GHN · GHTK"] },
  legend: "Blue: request · Dashed orange: Kafka events · Yellow: storage · Red: shared DB · Stacked: many pods",
  ui: UI_EN,
  info: INFO_EN,
};

export function SystemDesignEn() {
  return <SystemDiagram t={EN} />;
}
