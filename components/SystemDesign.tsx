import { SystemDiagram, type DiagramText } from "@/components/SystemDiagram";
import { UI_VI, INFO_VI } from "@/components/systemInfo.vi";

// Vietnamese labels for the shared diagram
const VI: DiagramText = {
  aria: "System design lồng nhau: người dùng đi qua hạ tầng edge (GeoDNS, CDN, WAF, waiting room, thuê ngoài) rồi vào region của bạn; NLB L4 chia kết nối cho Ingress Nginx; bên trong khung Application (cluster Kubernetes) có Ingress, frontend Next.js và admin/seller, API Gateway, các service user, catalog, cart, order, payment và worker notification, search, inventory, shipping; bên dưới là tầng data gồm Kafka, Redis, PgBouncer, các database riêng từng service (orders chia 16 shard), S3, Elasticsearch và warehouse_db dùng chung. Bên phải: observability, CI/CD, secrets xuyên suốt; cổng thanh toán và đơn vị vận chuyển bên ngoài",
  users: { title: "Người dùng", sub: "thiết bị khách", items: [["Web storefront", "Next.js"], ["Mobile app", "iOS · Android"], ["Admin portal", "vận hành, CSKH"], ["Seller center", "người bán"]] },
  edge: { title: "Hạ tầng edge", sub: "thuê ngoài", items: [["GeoDNS", "region gần"], ["CDN · L7", "ảnh, JS, CSS"], ["WAF · L7", "chặn bot, DDoS"], ["Waiting room", "xếp hàng sale"], ["Miss → S3", "không vào VPC"]] },
  region: { title: "Region ap-southeast-1 · VPC của bạn", sub: "mỗi region có một bộ như dưới" },
  nlb: { row: ["Public subnet", "cửa duy nhất"], lines: ["NLB · Network Load Balancer · L4", "1 IP public, nhiều AZ · chỉ chia kết nối TCP, không đọc HTTP"], arrow: "TCP :443 → rải cho các pod Ingress" },
  app: { title: "Application · cluster Kubernetes", sub: "code của bạn, build thành image, chạy thành pod" },
  rows: { ingress: ["Cửa vào cluster", "reverse proxy"], frontend: ["Frontend", "render giao diện"], gateway: ["Gateway", "cửa vào API"], service: ["Service", "nghiệp vụ"], worker: ["Worker", "xử lý nền"] },
  ingress: ["Ingress · Nginx ×3 pod · L7", "SSL · đọc path: / → Next.js · /gateway/api → BFF · /admin → FE nội bộ"],
  routes: ["/", "/admin, /seller", "/gateway/api", "SSR gọi BFF"],
  next: ["Next.js ×10 pod", "SSR, trả HTML"],
  fe: ["Admin + Seller FE ×4", "giao diện nội bộ"],
  gw: ["API Gateway · BFF ×50 pod · L7", "JWT · rate limit · routing · REST / GraphQL"],
  services: [["user-svc", "×20 pod"], ["catalog-svc", "×100 pod"], ["cart-svc", "×60 pod"], ["order-svc", "×200 pod"], ["payment-svc", "×80 pod"]],
  workers: [["notification", "×30 consumer"], ["search", "×20 consumer"], ["inventory", "×100 consumer"], ["shipping", "×50 consumer"]],
  data: { title: "Tầng data", sub: "" },
  dataRows: { events: ["Sự kiện", "bất đồng bộ"], cache: ["Cache", "đọc nhanh"], store: ["Lưu bền", "nguồn sự thật"], other: ["Khác", "tìm kiếm, kho"] },
  kafka: ["Kafka · 200 partition · key = orderId", "OrderCreated · PaymentSucceeded · ProductUpdated"],
  redis: ["Redis Cluster · 6 shard", "cache SP, giá, giỏ · trừ tồn kho (DECR) · session"],
  pgb: ["PgBouncer", "gom kết nối"],
  stores: [["users", "Postgres"], ["products", "MongoDB"], ["S3", "ảnh, file"], ["orders", "PG · 16 shard"], ["payments", "Postgres"]],
  es: ["Elasticsearch", "chỉ mục tìm kiếm"],
  wh: ["warehouse_db · DB dùng chung", "inventory + shipping"],
  side: { cross: "XUYÊN SUỐT", obs: ["Observability", "log · metric · trace"], cicd: ["CI/CD", "build image · deploy"], cfg: ["Config · secrets", "Vault, K8s secret"], ext: "BÊN NGOÀI", pay: ["Cổng thanh toán", "VNPay · MoMo · Stripe"], ship: ["Vận chuyển", "GHN · GHTK"] },
  legend: "Xanh: request · Cam nét đứt: sự kiện Kafka · Ô vàng: lưu trữ · Ô đỏ: DB dùng chung · Ô xếp chồng: nhiều pod",
  ui: UI_VI,
  info: INFO_VI,
};

export function SystemDesign() {
  return <SystemDiagram t={VI} />;
}
