// Vietnamese notes shown in the side panel when a diagram box is clicked
import type { Info } from "@/components/SystemDiagram";

export const UI_VI = {
  hintTitle: "Chú thích",
  hint: "Bấm vào một ô bất kỳ trong sơ đồ để xem ý nghĩa, nhiệm vụ và cách cấu hình của nó. Bấm lại ô đó (hoặc nút ×) để đóng.",
  what: "Là gì",
  jobs: "Nhiệm vụ",
  cfg: "Cách cấu hình (ví dụ minh họa)",
  close: "Đóng chú thích",
};

export const INFO_VI: Record<string, Info> = {
  web: {
    title: "Web storefront (Next.js)",
    what: "Giao diện mua hàng chạy trong trình duyệt của khách. Trang đầu do Next.js render sẵn trên server (SSR), sau đó JavaScript trong trình duyệt chạy tiếp.",
    jobs: ["Hiển thị sản phẩm, giỏ hàng, thanh toán", "Gọi BFF qua shopbanhang.com/gateway/api/..., kèm JWT (JSON Web Token) trong header Authorization"],
  },
  mobile: {
    title: "Mobile app",
    what: "Ứng dụng iOS và Android. Không có SSR, chỉ gọi API.",
    jobs: ["Gọi cùng API Gateway với web", "Lưu token đăng nhập trong Keychain (iOS) hoặc Keystore (Android)"],
  },
  admin: {
    title: "Admin portal",
    what: "Giao diện nội bộ cho vận hành và chăm sóc khách hàng, truy cập qua đường dẫn /admin.",
    jobs: ["Tra cứu và xử lý đơn, hoàn tiền, khóa tài khoản", "Chỉ nhân viên dùng: nên giới hạn bằng SSO, VPN hoặc danh sách IP"],
  },
  seller: {
    title: "Seller center",
    what: "Giao diện cho người bán quản lý sản phẩm và đơn hàng, truy cập qua /seller.",
    jobs: ["Đăng sản phẩm, cập nhật giá, tồn kho", "Upload ảnh thẳng lên S3 bằng presigned URL, file không đi qua pod nào"],
  },
  geodns: {
    title: "GeoDNS",
    what: "DNS trả về địa chỉ khác nhau tùy vị trí của người hỏi, để khách được đưa tới region gần nhất.",
    jobs: ["Giảm độ trễ cho khách ở xa", "Chuyển sang region khác khi một region hỏng (nhờ health check)"],
    cfg: `# Route 53, bản ghi theo độ trễ (Terraform)
resource "aws_route53_record" "shop_sg" {
  zone_id        = var.zone_id
  name           = "shopbanhang.com"
  type           = "A"
  set_identifier = "ap-southeast-1"                 # mỗi region một bản ghi
  latency_routing_policy { region = "ap-southeast-1" }
  alias {
    name                   = aws_lb.nlb.dns_name
    zone_id                = aws_lb.nlb.zone_id
    evaluate_target_health = true                   # region hỏng thì bị loại khỏi câu trả lời
  }
}`,
  },
  cdn: {
    title: "CDN edge (L7)",
    what: "Mạng máy chủ cache đặt khắp thế giới. Khách tải file tĩnh từ điểm gần nhất thay vì từ server của bạn.",
    jobs: ["Cache ảnh, JS, CSS, trang dựng sẵn: 80 đến 90% request không tới hệ thống", "Không cache /gateway/api, chuyển về origin", "Khi chưa có trong cache (miss) thì đọc từ S3 hoặc origin"],
    cfg: `# Quy tắc cache (ý tưởng; cú pháp tùy nhà cung cấp)
/images/*          → cache 30 ngày, bỏ qua cookie
/_next/static/*    → cache 1 năm (tên file có hash nên đổi nội dung là đổi tên)
/gateway/api/*     → KHÔNG cache, chuyển về origin
# Trả về header Cache-Control: public, max-age=..., immutable cho file có hash`,
  },
  waf: {
    title: "WAF · Web Application Firewall (L7)",
    what: "Tường lửa tầng ứng dụng, đọc nội dung HTTP để chặn request độc hại trước khi vào hệ thống.",
    jobs: ["Chặn SQL injection, XSS, bot, scraper", "Giới hạn tốc độ thô theo IP", "Giảm DDoS tầng 7"],
    cfg: `# Ví dụ quy tắc (ý tưởng; cú pháp tùy nhà cung cấp)
bộ luật quản lý  : OWASP Core Rule Set      → chặn các mẫu tấn công phổ biến
giới hạn tốc độ : 100 request / 10 giây / IP trên /gateway/api/auth/*  → chặn 10 phút
chặn quốc gia   : danh sách quốc gia không phục vụ                → block
thử thách bot   : request nghi là bot                             → challenge`,
  },
  waiting: {
    title: "Waiting room",
    what: "Phòng chờ ảo. Khi lượng người vượt sức chịu của hệ thống (flash sale), người đến sau được xếp hàng và cho vào dần theo tốc độ cố định, thay vì để tất cả đổ vào backend cùng lúc.",
    jobs: [
      "Đặt ở edge (cạnh CDN, WAF) để chặn đám đông trước NLB, Ingress và pod",
      "Cho N người mỗi phút đi tiếp, phần còn lại thấy trang xếp hàng và vị trí của mình",
      "Cấp cookie hoặc token cho người đã được vào; hết hạn sau vài phút không hoạt động",
      "Giữ thứ tự công bằng (ai đến trước vào trước)",
    ],
    cfg: `# Cấu hình điển hình (ví dụ Cloudflare Waiting Room hoặc Queue-it; tên trường tùy nhà cung cấp)
host + path           : shopbanhang.com/checkout*   # chỉ bảo vệ đường dẫn nặng, không phải cả site
total_active_users    : 5000                         # tối đa người đang ở trong hệ thống
new_users_per_minute  : 600                          # tốc độ cho người mới vào
session_duration      : 5                            # phút không hoạt động thì mất chỗ
queueing_method       : fifo                         # đến trước vào trước
# Bật theo lịch hoặc khi vượt ngưỡng; chuẩn bị sẵn trang chờ có thương hiệu`,
  },
  s3miss: {
    title: "CDN miss → S3",
    what: "Khi ảnh chưa có trong cache của CDN, CDN đọc thẳng từ S3. Request này không đi qua NLB hay cluster nên không tốn tài nguyên của hệ thống.",
    jobs: ["S3 để private, chỉ CDN đọc được (Origin Access Control)", "Người bán upload ảnh thẳng lên S3 bằng presigned URL"],
    cfg: `# Bucket policy: chỉ CloudFront (qua OAC) được đọc
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
    what: "Bộ chia tải tầng 4. Giữ một IP công khai và chia kết nối TCP cho các pod Ingress. Không đọc nội dung HTTP nên rất nhanh.",
    jobs: ["Một IP công khai ổn định, trải trên nhiều AZ (Availability Zone)", "Health check pod Ingress, loại pod hỏng", "Chia kết nối TCP, không giải mã TLS nếu để chế độ passthrough"],
    cfg: `# Kubernetes Service tạo NLB (AWS Load Balancer Controller)
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "external"
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "ip"   # trỏ thẳng vào IP của pod
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
spec:
  type: LoadBalancer
  ports: [{ port: 443, targetPort: 443 }]
  selector: { app.kubernetes.io/name: ingress-nginx }`,
  },
  ingress: {
    title: "Ingress · Nginx (L7)",
    what: "Reverse proxy ở cửa vào cluster. Đọc host và đường dẫn của request rồi chuyển tới đúng Service bên trong.",
    jobs: ["Giải mã HTTPS (TLS termination)", "Định tuyến: / tới Next.js, /gateway/api tới API Gateway (BFF), /admin và /seller tới FE nội bộ", "Một request chỉ đi theo một nhánh"],
    cfg: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: shop }
spec:
  ingressClassName: nginx
  tls: [{ hosts: [shopbanhang.com], secretName: shop-tls }]   # chứng chỉ TLS
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
    title: "Next.js ×10 pod",
    what: "Server render trang cho khách (SSR), trả HTML đã có dữ liệu để hiển thị nhanh và tốt cho SEO.",
    jobs: ["Khi render, tự gọi API Gateway trong cluster để lấy dữ liệu", "Stateless nên tăng giảm số pod theo tải (HPA)"],
  },
  fe: {
    title: "Admin + Seller FE ×4",
    what: "Giao diện nội bộ cho nhân viên và người bán, phục vụ ở /admin và /seller.",
    jobs: ["Gọi API Gateway để lấy và sửa dữ liệu", "Ít người dùng nên chỉ cần vài pod"],
  },
  gw: {
    title: "API Gateway · BFF (L7)",
    what: "Cửa vào duy nhất của API. BFF (Backend For Frontend) là gateway được chỉnh theo nhu cầu của từng loại client.",
    jobs: [
      "Kiểm JWT, gắn X-User-Id cho service phía sau",
      "Rate limit theo user",
      "Nhận HTTP ở shopbanhang.com/gateway/api/..., rồi gọi BE bằng gRPC (ví dụ POST /gateway/api/orders gọi OrderService.CreateOrder). Đây là code của service nên không có chuyện rewrite đường dẫn như gateway kiểu proxy (Kong, Envoy)",
      "gRPC giữ kết nối HTTP/2 lâu nên kube-proxy (L4) chia tải không đều: dùng headless Service rồi chia tải phía client, hoặc service mesh (L7)",
      "Có thể gộp kết quả nhiều service thành một response",
    ],
    cfg: `// BFF là một service: nhận HTTP, gọi BE bằng gRPC (không rewrite đường dẫn)
const orderClient = new OrderServiceClient("dns:///order-svc-headless:50051", creds, {
  "grpc.service_config": JSON.stringify({ loadBalancingConfig: [{ round_robin: {} }] }),  // chia tải phía client
});

app.post("/gateway/api/orders", authenticate, rateLimit("20/giây/user"), async (req, res) => {
  const order = await orderClient.createOrder(
    { customerId: req.user.sub, items: req.body.items },   // lấy danh tính từ JWT, không tin body
    { deadline: Date.now() + 2000 },                        // luôn đặt deadline cho lời gọi gRPC
  );
  res.status(201).json(order);                              // đổi kết quả gRPC sang JSON cho client
});`,
  },
  user: {
    title: "user-svc ×20 pod",
    what: "Quản lý tài khoản, đăng ký, hồ sơ và phân quyền.",
    jobs: ["Có database Postgres riêng (users)", "Đăng nhập thường do IdP (Identity Provider) hoặc SSO lo, xem trang SSO & Microservice"],
  },
  catalog: {
    title: "catalog-svc ×100 pod",
    what: "Quản lý sản phẩm: tên, giá, ảnh, mô tả. Là service đọc nhiều nhất.",
    jobs: ["Đọc Redis trước, miss mới đọc MongoDB", "Phát sự kiện ProductUpdated để search cập nhật chỉ mục", "Cấp presigned URL để người bán upload ảnh"],
  },
  cart: {
    title: "cart-svc ×60 pod",
    what: "Quản lý giỏ hàng của từng khách.",
    jobs: ["Lưu giỏ trong Redis, không cần database riêng", "Đặt TTL để giỏ bỏ quên tự hết hạn"],
  },
  order: {
    title: "order-svc ×200 pod",
    what: "Tạo và theo dõi đơn hàng. Là service ghi nhiều nhất nên có số pod lớn.",
    jobs: ["Ghi đơn vào Postgres orders (chia 16 shard theo customer_id)", "Phát sự kiện OrderCreated vào Kafka rồi trả lời khách ngay", "Nhận PaymentSucceeded để chuyển đơn sang paid"],
  },
  payment: {
    title: "payment-svc ×80 pod",
    what: "Làm việc với cổng thanh toán: tạo giao dịch, nhận kết quả.",
    jobs: ["Chuyển khách sang VNPay, MoMo hoặc Stripe", "Nhận webhook kết quả, kiểm tra chữ ký rồi phát PaymentSucceeded", "Xử lý idempotent: cùng một webhook gửi hai lần cũng chỉ ghi một lần"],
  },
  notification: {
    title: "notification ×30 consumer",
    what: "Worker gửi email, SMS, thông báo đẩy khi có sự kiện.",
    jobs: ["Đọc Kafka theo consumer group", "Lỗi thì retry, quá số lần thì chuyển vào dead letter topic"],
  },
  search: {
    title: "search ×20 consumer",
    what: "Worker cập nhật chỉ mục tìm kiếm.",
    jobs: ["Nghe ProductUpdated rồi ghi vào Elasticsearch", "Ghi theo lô để giảm số lần gọi"],
  },
  inventory: {
    title: "inventory ×100 consumer",
    what: "Worker trừ và giữ tồn kho sau khi đơn được tạo.",
    jobs: ["Nghe OrderCreated, trừ kho", "Idempotent: mỗi event có id, đã xử lý thì bỏ qua", "Hiện dùng chung warehouse_db với shipping (xem ô đỏ)"],
  },
  shipping: {
    title: "shipping ×50 consumer",
    what: "Worker tạo vận đơn với đơn vị vận chuyển sau khi đơn đã thanh toán.",
    jobs: ["Gọi API của GHN, GHTK", "Lưu mã vận đơn, theo dõi trạng thái giao hàng"],
  },
  kafka: {
    title: "Kafka · 200 partition",
    what: "Hàng đợi sự kiện bền vững. Service ghi sự kiện vào, worker đọc ra theo tốc độ của mình, không làm chậm khách.",
    jobs: ["200 partition cho khoảng 1,7 triệu event mỗi giây (mỗi partition khoảng 10.000 event/giây)", "Key là orderId nên sự kiện của một đơn luôn đúng thứ tự", "Giữ event 7 ngày để chạy lại khi sửa bug"],
    cfg: `# Tạo topic
kafka-topics.sh --create --topic orders \\
  --partitions 200 \\
  --replication-factor 3 \\
  --config min.insync.replicas=2 \\
  --config retention.ms=604800000     # 7 ngày

# Producer: gom lô và nén để tăng thông lượng
linger.ms=10
batch.size=65536
compression.type=lz4
acks=all                              # chỉ báo thành công khi đủ bản sao ghi xong`,
  },
  redis: {
    title: "Redis Cluster · 6 shard",
    what: "Kho dữ liệu trong RAM, đọc ghi rất nhanh, chia thành 6 shard.",
    jobs: ["Cache sản phẩm, giá", "Lưu giỏ hàng và session", "Trừ tồn kho flash sale bằng DECR (thao tác nguyên tử nên không bán quá số lượng)"],
    cfg: `# redis.conf (phần quan trọng)
cluster-enabled yes
maxmemory 8gb
maxmemory-policy allkeys-lru          # hết RAM thì xóa key ít dùng nhất (dùng cho cache)

# Trừ kho flash sale: DECR là nguyên tử
DECR stock:sku-123                    # kết quả < 0 nghĩa là hết hàng, tăng lại và từ chối`,
  },
  pgb: {
    title: "PgBouncer",
    what: "Bộ gom kết nối đứng trước PostgreSQL. Hàng chục nghìn kết nối từ pod được gom lại còn vài trăm kết nối thật.",
    jobs: ["PostgreSQL tốn nhiều tài nguyên cho mỗi kết nối nên không chịu được quá nhiều", "Dùng chế độ transaction: mượn kết nối thật chỉ trong lúc chạy một transaction"],
    cfg: `; pgbouncer.ini
[pgbouncer]
pool_mode = transaction              ; trả kết nối ngay khi transaction kết thúc
max_client_conn = 50000              ; số kết nối từ pod
default_pool_size = 500              ; số kết nối thật tới PostgreSQL`,
  },
  "pg-users": {
    title: "users · Postgres",
    what: "Database riêng của user-svc, lưu tài khoản và hồ sơ.",
    jobs: ["Chỉ user-svc được truy cập; service khác hỏi qua API hoặc sự kiện", "Ghi vào primary, đọc từ replica"],
  },
  mongo: {
    title: "products · MongoDB",
    what: "Database riêng của catalog-svc. Sản phẩm mỗi loại có thuộc tính khác nhau nên hợp với document.",
    jobs: ["Lưu sản phẩm, thuộc tính, biến thể", "Phía trước có Redis để giảm số lần đọc"],
  },
  s3: {
    title: "S3 · lưu file",
    what: "Kho lưu file (ảnh sản phẩm, tài liệu), có độ bền rất cao.",
    jobs: ["Để private, CDN đọc qua Origin Access Control", "Người bán PUT thẳng lên S3 bằng presigned URL, hết hạn sau vài phút", "Service chỉ lưu đường dẫn ảnh vào database"],
  },
  "pg-orders": {
    title: "orders · Postgres 16 shard",
    what: "Database của order-svc, chia thành 16 shard theo customer_id để chia tải ghi.",
    jobs: ["Mỗi shard chỉ gánh một phần đơn", "Mỗi shard có primary và replica", "Truy vấn nên luôn kèm customer_id để biết đi shard nào"],
  },
  "pg-payments": {
    title: "payments · Postgres",
    what: "Database riêng của payment-svc, lưu giao dịch và trạng thái thanh toán.",
    jobs: ["Tách khỏi orders để lỗi hoặc tải ở đơn hàng không ảnh hưởng thanh toán", "Dữ liệu nhạy cảm: mã hóa, giới hạn quyền truy cập, ghi audit log"],
  },
  es: {
    title: "Elasticsearch",
    what: "Công cụ tìm kiếm toàn văn, dùng cho ô tìm kiếm sản phẩm.",
    jobs: ["Chỉ mục được worker search cập nhật từ sự kiện", "Không phải nguồn sự thật: mất thì dựng lại từ MongoDB"],
  },
  wh: {
    title: "warehouse_db · DB dùng chung",
    what: "Một database mà cả inventory và shipping cùng đọc ghi. Ô màu đỏ vì đây là điểm cần sửa.",
    jobs: ["Hai worker dính chặt vào nhau: đổi schema bên này dễ làm vỡ bên kia", "Nên tách mỗi worker một database và trao đổi qua sự kiện Kafka"],
  },
  obs: {
    title: "Observability",
    what: "Log, metric và trace của mọi pod được đẩy về một chỗ để theo dõi và tìm lỗi.",
    jobs: ["Log tập trung, metric (Prometheus), trace (OpenTelemetry)", "Cảnh báo khi lỗi, trễ hoặc lag Kafka vượt ngưỡng"],
  },
  cicd: {
    title: "CI/CD",
    what: "Quy trình tự động: build image, chạy test, deploy lên cluster.",
    jobs: ["Mỗi lần merge tự build image và đẩy lên registry", "Deploy theo kiểu rolling hoặc canary để không gián đoạn"],
  },
  cfg: {
    title: "Config · secrets",
    what: "Nơi giữ cấu hình và bí mật (mật khẩu database, khóa API) tách khỏi code.",
    jobs: ["Vault hoặc Kubernetes Secret", "Không đưa bí mật vào image hay git"],
  },
  psp: {
    title: "Cổng thanh toán",
    what: "Dịch vụ bên thứ ba như VNPay, MoMo, Stripe xử lý tiền thật.",
    jobs: ["payment-svc gọi ra để tạo giao dịch", "Kết quả quay về qua webhook đi vào API Gateway", "Luôn kiểm tra chữ ký webhook"],
  },
  carrier: {
    title: "Vận chuyển",
    what: "Đơn vị giao hàng như GHN, GHTK.",
    jobs: ["Worker shipping gọi API để tạo vận đơn", "Có thể gửi webhook cập nhật trạng thái giao hàng"],
  },
};
