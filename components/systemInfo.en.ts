// English notes shown in the side panel when a diagram box is clicked
import type { Info } from "@/components/SystemDiagram";

export const UI_EN = {
  hintTitle: "Notes",
  hint: "Click any box in the diagram to see what it is, what it does and how to configure it. Click it again (or the × button) to close.",
  what: "What it is",
  jobs: "What it does",
  cfg: "How to configure (illustrative example)",
  close: "Close notes",
};

export const INFO_EN: Record<string, Info> = {
  web: {
    title: "Web storefront (Next.js)",
    what: "The shopping UI running in the customer's browser. The first page is rendered on the server by Next.js (SSR), then JavaScript in the browser takes over.",
    jobs: ["Shows products, the cart and checkout", "Calls the BFF at shopbanhang.com/gateway/api/... with a JWT (JSON Web Token) in the Authorization header"],
  },
  mobile: {
    title: "Mobile app",
    what: "The iOS and Android apps. No SSR, they only call the API.",
    jobs: ["Calls the same API Gateway as the web", "Stores the login token in the Keychain (iOS) or Keystore (Android)"],
  },
  admin: {
    title: "Admin portal",
    what: "Internal UI for operations and customer support, served under /admin.",
    jobs: ["Looks up and handles orders, refunds, account locks", "Staff only: restrict it with SSO, a VPN or an IP allowlist"],
  },
  seller: {
    title: "Seller center",
    what: "The UI where sellers manage products and orders, served under /seller.",
    jobs: ["Create products, update prices and stock", "Uploads images straight to S3 with a presigned URL, the file never passes through a pod"],
  },
  geodns: {
    title: "GeoDNS",
    what: "DNS that answers with different addresses depending on where the asker is, so customers reach the nearest region.",
    jobs: ["Lower latency for distant customers", "Fails over to another region when one is down (via health checks)"],
    cfg: `# Route 53 latency-based record (Terraform)
resource "aws_route53_record" "shop_sg" {
  zone_id        = var.zone_id
  name           = "shopbanhang.com"
  type           = "A"
  set_identifier = "ap-southeast-1"                 # one record per region
  latency_routing_policy { region = "ap-southeast-1" }
  alias {
    name                   = aws_lb.nlb.dns_name
    zone_id                = aws_lb.nlb.zone_id
    evaluate_target_health = true                   # a failed region is dropped from answers
  }
}`,
  },
  cdn: {
    title: "CDN edge (L7)",
    what: "A network of cache servers around the world. Customers fetch static files from the nearest point instead of from your servers.",
    jobs: ["Caches images, JS, CSS and pre-built pages: 80 to 90% of requests never reach your system", "Does not cache /gateway/api, forwards it to the origin", "On a cache miss it reads from S3 or the origin"],
    cfg: `# Cache rules (idea; syntax depends on the provider)
/images/*          → cache 30 days, ignore cookies
/_next/static/*    → cache 1 year (file names carry a hash, so new content means a new name)
/gateway/api/*     → do NOT cache, forward to the origin
# Send Cache-Control: public, max-age=..., immutable for hashed files`,
  },
  waf: {
    title: "WAF · Web Application Firewall (L7)",
    what: "An application-layer firewall that reads HTTP content to block malicious requests before they enter your system.",
    jobs: ["Blocks SQL injection, XSS, bots and scrapers", "Coarse rate limiting per IP", "Reduces layer-7 DDoS"],
    cfg: `# Example rules (idea; syntax depends on the provider)
managed ruleset : OWASP Core Rule Set      → blocks common attack patterns
rate limit      : 100 requests / 10 s / IP on /gateway/api/auth/*   → block for 10 minutes
country block   : list of countries you do not serve           → block
bot challenge   : requests that look like bots                 → challenge`,
  },
  waiting: {
    title: "Waiting room",
    what: "A virtual queue. When traffic exceeds what the system can handle (flash sale), late arrivals are queued and let in gradually at a fixed rate, instead of all hitting the backend at once.",
    jobs: [
      "Sits at the edge (next to the CDN and WAF) so the crowd is stopped before the NLB, Ingress and pods",
      "Lets N people per minute through; the rest see a queue page with their position",
      "Issues a cookie or token to admitted users; it expires after a few idle minutes",
      "Keeps order fair (first come, first served)",
    ],
    cfg: `# Typical settings (for example Cloudflare Waiting Room or Queue-it; field names vary by provider)
host + path           : shopbanhang.com/checkout*   # protect the heavy paths, not the whole site
total_active_users    : 5000                         # max people inside the system at once
new_users_per_minute  : 600                          # rate at which new people are let in
session_duration      : 5                            # idle minutes before a spot is lost
queueing_method       : fifo                         # first in, first out
# Turn it on by schedule or when a threshold is crossed; prepare a branded waiting page`,
  },
  s3miss: {
    title: "CDN miss → S3",
    what: "When an image is not in the CDN cache, the CDN reads it straight from S3. This request never goes through the NLB or the cluster, so it costs your system nothing.",
    jobs: ["S3 stays private and only the CDN can read it (Origin Access Control)", "Sellers upload images straight to S3 with a presigned URL"],
    cfg: `# Bucket policy: only CloudFront (through OAC) may read
{
  "Effect": "Allow",
  "Principal": { "Service": "cloudfront.amazonaws.com" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::shop-media/*",
  "Condition": { "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::<account>:distribution/<id>" } }
}`,
  },
  nlb: {
    title: "NLB · Network Load Balancer (L4)",
    what: "A layer-4 load balancer. It keeps one public IP and spreads TCP connections over the Ingress pods. It does not read HTTP, so it is very fast.",
    jobs: ["One stable public IP across several AZs (Availability Zones)", "Health-checks the Ingress pods and drops broken ones", "Spreads TCP connections; it does not decrypt TLS in passthrough mode"],
    cfg: `# A Kubernetes Service that creates the NLB (AWS Load Balancer Controller)
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "external"
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "ip"   # target pod IPs directly
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
spec:
  type: LoadBalancer
  ports: [{ port: 443, targetPort: 443 }]
  selector: { app.kubernetes.io/name: ingress-nginx }`,
  },
  ingress: {
    title: "Ingress · Nginx (L7)",
    what: "The reverse proxy at the cluster's front door. It reads the request's host and path and forwards it to the right internal Service.",
    jobs: ["Terminates HTTPS (TLS termination)", "Routes: / to Next.js, /gateway/api to the API Gateway (BFF), /admin and /seller to the internal FE", "Each request follows exactly one branch"],
    cfg: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: shop }
spec:
  ingressClassName: nginx
  tls: [{ hosts: [shopbanhang.com], secretName: shop-tls }]   # TLS certificate
  rules:
    - host: shopbanhang.com
      http:
        paths:
          - { path: /gateway/api, pathType: Prefix, backend: { service: { name: api-gateway, port: { number: 80 } } } }
          - { path: /admin,  pathType: Prefix, backend: { service: { name: console,     port: { number: 80 } } } }
          - { path: /seller, pathType: Prefix, backend: { service: { name: console,     port: { number: 80 } } } }
          - { path: /,       pathType: Prefix, backend: { service: { name: nextjs,      port: { number: 80 } } } }`,
  },
  next: {
    title: "Next.js ×10 pods",
    what: "Renders pages for customers on the server (SSR) and returns HTML that already contains data, for fast display and good SEO.",
    jobs: ["While rendering it calls the API Gateway inside the cluster for data", "Stateless, so the pod count scales with load (HPA)"],
  },
  fe: {
    title: "Admin + Seller FE ×4",
    what: "Internal UIs for staff and sellers, served under /admin and /seller.",
    jobs: ["Calls the API Gateway to read and change data", "Few users, so a handful of pods is enough"],
  },
  gw: {
    title: "API Gateway · BFF (L7)",
    what: "The single entry point of the API. A BFF (Backend For Frontend) is a gateway shaped around the needs of each kind of client.",
    jobs: [
      "Verifies the JWT and adds X-User-Id for the services behind it",
      "Rate limits per user",
      "Receives HTTP at shopbanhang.com/gateway/api/... and calls the BE over gRPC (for example POST /gateway/api/orders calls OrderService.CreateOrder). It is service code, so there is no path rewriting as in a proxy-style gateway (Kong, Envoy)",
      "gRPC keeps long-lived HTTP/2 connections, so kube-proxy (L4) balances poorly: use a headless Service with client-side balancing, or a service mesh (L7)",
      "Can merge results from several services into one response",
    ],
    cfg: `// The BFF is a service: it receives HTTP and calls the BE over gRPC (no path rewriting)
const orderClient = new OrderServiceClient("dns:///order-svc-headless:50051", creds, {
  "grpc.service_config": JSON.stringify({ loadBalancingConfig: [{ round_robin: {} }] }),  // client-side load balancing
});

app.post("/gateway/api/orders", authenticate, rateLimit("20/second/user"), async (req, res) => {
  const order = await orderClient.createOrder(
    { customerId: req.user.sub, items: req.body.items },   // identity comes from the JWT, never the body
    { deadline: Date.now() + 2000 },                        // always set a deadline on gRPC calls
  );
  res.status(201).json(order);                              // turn the gRPC result into JSON for the client
});`,
  },
  user: {
    title: "user-svc ×20 pods",
    what: "Manages accounts, registration, profiles and permissions.",
    jobs: ["Has its own Postgres database (users)", "Login itself is usually handled by an IdP (Identity Provider) or SSO, see the SSO & Microservice page"],
  },
  catalog: {
    title: "catalog-svc ×100 pods",
    what: "Manages products: name, price, images, description. It is the most read-heavy service.",
    jobs: ["Reads Redis first, goes to MongoDB only on a miss", "Emits ProductUpdated so search can refresh its index", "Hands out presigned URLs so sellers can upload images"],
  },
  cart: {
    title: "cart-svc ×60 pods",
    what: "Manages each customer's cart.",
    jobs: ["Keeps carts in Redis, no database of its own", "Sets a TTL so abandoned carts expire"],
  },
  order: {
    title: "order-svc ×200 pods",
    what: "Creates and tracks orders. It is the most write-heavy service, hence the large pod count.",
    jobs: ["Writes orders to Postgres orders (16 shards by customer_id)", "Emits OrderCreated to Kafka and answers the customer right away", "Receives PaymentSucceeded to move the order to paid"],
  },
  payment: {
    title: "payment-svc ×80 pods",
    what: "Talks to the payment gateway: creates transactions and receives results.",
    jobs: ["Redirects the customer to VNPay, MoMo or Stripe", "Receives the result webhook, verifies its signature and emits PaymentSucceeded", "Idempotent: the same webhook delivered twice is recorded once"],
  },
  notification: {
    title: "notification ×30 consumers",
    what: "A worker that sends email, SMS and push notifications when events arrive.",
    jobs: ["Reads Kafka as a consumer group", "Retries on failure; after too many attempts the event goes to a dead letter topic"],
  },
  search: {
    title: "search ×20 consumers",
    what: "A worker that keeps the search index up to date.",
    jobs: ["Listens to ProductUpdated and writes to Elasticsearch", "Writes in batches to cut the number of calls"],
  },
  inventory: {
    title: "inventory ×100 consumers",
    what: "A worker that decrements and reserves stock after an order is created.",
    jobs: ["Listens to OrderCreated and decrements stock", "Idempotent: every event has an id and processed ones are skipped", "Currently shares warehouse_db with shipping (see the red box)"],
  },
  shipping: {
    title: "shipping ×50 consumers",
    what: "A worker that creates shipments with the carrier once an order is paid.",
    jobs: ["Calls the GHN and GHTK APIs", "Stores the tracking code and follows delivery status"],
  },
  kafka: {
    title: "Kafka · 200 partitions",
    what: "A durable event queue. Services write events in, workers read them at their own pace, and the customer is never slowed down.",
    jobs: ["200 partitions for about 1.7 million events per second (roughly 10,000 events/second each)", "The key is orderId so events of one order stay in order", "Keeps events for 7 days so they can be replayed after a bug fix"],
    cfg: `# Create the topic
kafka-topics.sh --create --topic orders \\
  --partitions 200 \\
  --replication-factor 3 \\
  --config min.insync.replicas=2 \\
  --config retention.ms=604800000     # 7 days

# Producer: batch and compress for throughput
linger.ms=10
batch.size=65536
compression.type=lz4
acks=all                              # report success only when enough replicas have written`,
  },
  redis: {
    title: "Redis Cluster · 6 shards",
    what: "An in-memory data store with very fast reads and writes, split into 6 shards.",
    jobs: ["Caches products and prices", "Holds carts and sessions", "Decrements flash sale stock with DECR (atomic, so it never oversells)"],
    cfg: `# redis.conf (the important part)
cluster-enabled yes
maxmemory 8gb
maxmemory-policy allkeys-lru          # when RAM is full, evict the least recently used keys (for caches)

# Flash sale stock: DECR is atomic
DECR stock:sku-123                    # a result below 0 means sold out, increment back and reject`,
  },
  pgb: {
    title: "PgBouncer",
    what: "A connection pooler in front of PostgreSQL. Tens of thousands of pod connections are squeezed into a few hundred real ones.",
    jobs: ["PostgreSQL spends a lot of resources per connection, so it cannot take too many", "Uses transaction mode: a real connection is borrowed only while a transaction runs"],
    cfg: `; pgbouncer.ini
[pgbouncer]
pool_mode = transaction              ; give the connection back as soon as the transaction ends
max_client_conn = 50000              ; connections coming from pods
default_pool_size = 500              ; real connections to PostgreSQL`,
  },
  "pg-users": {
    title: "users · Postgres",
    what: "user-svc's own database, holding accounts and profiles.",
    jobs: ["Only user-svc may touch it; other services ask through the API or events", "Writes go to the primary, reads to replicas"],
  },
  mongo: {
    title: "products · MongoDB",
    what: "catalog-svc's own database. Each kind of product has different attributes, which suits documents.",
    jobs: ["Stores products, attributes and variants", "Redis sits in front to cut the number of reads"],
  },
  s3: {
    title: "S3 · file storage",
    what: "File storage (product images, documents) with very high durability.",
    jobs: ["Kept private; the CDN reads through Origin Access Control", "Sellers PUT straight to S3 with a presigned URL that expires in minutes", "Services only store the image path in the database"],
  },
  "pg-orders": {
    title: "orders · Postgres 16 shards",
    what: "order-svc's database, split into 16 shards by customer_id to spread write load.",
    jobs: ["Each shard carries only part of the orders", "Each shard has a primary and replicas", "Queries should always include customer_id so the shard is known"],
  },
  "pg-payments": {
    title: "payments · Postgres",
    what: "payment-svc's own database, holding transactions and payment status.",
    jobs: ["Separate from orders so problems or load there do not affect payments", "Sensitive data: encrypt it, restrict access, keep an audit log"],
  },
  es: {
    title: "Elasticsearch",
    what: "A full-text search engine behind the product search box.",
    jobs: ["Its index is updated by the search worker from events", "Not a source of truth: if lost it is rebuilt from MongoDB"],
  },
  wh: {
    title: "warehouse_db · shared DB",
    what: "One database that both inventory and shipping read and write. It is red because it is something to fix.",
    jobs: ["The two workers are tightly coupled: a schema change on one side easily breaks the other", "Better to give each worker its own database and exchange data through Kafka events"],
  },
  obs: {
    title: "Observability",
    what: "Logs, metrics and traces from every pod are shipped to one place for monitoring and debugging.",
    jobs: ["Central logs, metrics (Prometheus), traces (OpenTelemetry)", "Alerts when errors, latency or Kafka lag cross a threshold"],
  },
  cicd: {
    title: "CI/CD",
    what: "The automated pipeline: build the image, run tests, deploy to the cluster.",
    jobs: ["Every merge builds an image and pushes it to a registry", "Deploys with rolling or canary releases to avoid downtime"],
  },
  cfg: {
    title: "Config · secrets",
    what: "Where configuration and secrets (database passwords, API keys) live, apart from the code.",
    jobs: ["Vault or Kubernetes Secrets", "Never bake secrets into images or git"],
  },
  psp: {
    title: "Payment gateway",
    what: "A third-party service such as VNPay, MoMo or Stripe that handles real money.",
    jobs: ["payment-svc calls out to create transactions", "Results come back through a webhook entering via the API Gateway", "Always verify the webhook signature"],
  },
  carrier: {
    title: "Shipping carrier",
    what: "Delivery companies such as GHN and GHTK.",
    jobs: ["The shipping worker calls their API to create shipments", "They may send webhooks with delivery status updates"],
  },
};
