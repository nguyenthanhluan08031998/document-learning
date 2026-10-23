import { Code } from "@/components/Code";
import { Box, Label, Markers } from "@/components/Svg";

// Rows of the comparison diagram: [component, role line, server note]
const ROWS: [string, string, string][] = [
  ["Reverse Proxy", "nginx · Envoy · Apache httpd", "ẩn server thật"],
  ["API Gateway", "Kong · Apigee · AWS API Gateway", "định tuyến theo service"],
  ["Load Balancer", "HAProxy · AWS ALB · Azure LB", "chia tải, theo dõi sức khỏe"],
];

export default function DesignEdgePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Reverse Proxy, API Gateway, Load Balancer">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ed-overview"><span>01</span>Ba thứ đứng ở đâu</a></li>
          <li><a href="#ed-proxy"><span>02</span>Reverse Proxy</a></li>
          <li><a href="#ed-gateway"><span>03</span>API Gateway</a></li>
          <li><a href="#ed-lb"><span>04</span>Load Balancer</a></li>
          <li><a href="#ed-together"><span>05</span>Dùng cùng nhau</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · edge</div>
          <h1>Reverse Proxy, API Gateway, Load Balancer</h1>
          <p className="lede">Cả ba đều đứng giữa client và server, nên dễ bị nhầm. Khác nhau ở <b>mục đích</b>: proxy thay mặt và che server, gateway là cửa vào có nghiệp vụ API, load balancer chia tải và loại server hỏng. Một sản phẩm như nginx hay Envoy làm được cả ba vai, nên điều cần phân biệt là vai trò chứ không phải tên phần mềm.</p>
          <div className="tape" aria-hidden="true">
            <div>nginx</div>
            <div>Envoy</div>
            <div className="hw">Kong</div>
            <div>HAProxy</div>
            <div>ALB</div>
          </div>
        </header>

        <section id="ed-overview">
          <h2><span className="n">01</span>Ba thứ đứng ở đâu</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 340" role="img" aria-label="Ba hàng: client đi qua Reverse Proxy tới server được ẩn; client đi qua API Gateway tới các service; client đi qua Load Balancer tới nhiều bản sao của cùng một server">
                <Markers id="ed" />
                {ROWS.map(([t, s, n], i) => {
                  const y = 8 + i * 110;
                  return (
                    <g key={t}>
                      <Box x={20} y={y + 10} w={150} h={70} title="Client" sub="web · mobile" />
                      <path className="s-ln" d={`M170 ${y + 45} H320`} markerEnd="url(#eda)" />
                      <Box x={322} y={y + 5} w={256} h={80} title={t} sub={s} cls="s-hl" />
                      <path className="s-ln" d={`M578 ${y + 45} H730`} markerEnd="url(#eda)" />
                      {[0, 1].map(k => (
                        <Box key={k} x={732} y={y + 4 + k * 42} w={148} h={36} title={i === 1 ? ["order-svc", "user-svc"][k] : i === 2 ? `app #${k + 1}` : `server ${k + 1}`} />
                      ))}
                      <Label x={654} y={y + 38} anchor="middle">{n}</Label>
                    </g>
                  );
                })}
              </svg>
            </div>
            <figcaption>Cùng một vị trí trong đường đi của request, khác vai trò.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>Reverse Proxy</th><th>API Gateway</th><th>Load Balancer</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Mục đích chính</b></td><td>Thay mặt server nhận request, che server thật</td><td>Một cửa vào thống nhất cho nhiều API/service</td><td>Chia request đều cho nhiều bản sao</td></tr>
                <tr><td><b>Biết gì</b></td><td>HTTP: host, path, header</td><td>API: route, user, key, quota, version</td><td>Tải và sức khỏe của từng server</td></tr>
                <tr><td><b>Việc điển hình</b></td><td>TLS termination, cache, nén, file tĩnh</td><td>Xác thực, rate limit, đổi route, gộp kết quả</td><td>Round robin, health check, failover</td></tr>
                <tr><td><b>Gọi nhiều service một request</b></td><td>Không</td><td>Có (aggregation)</td><td>Không</td></tr>
                <tr><td><b>Ví dụ</b></td><td>nginx, Envoy, Apache</td><td>Kong, Apigee, AWS API Gateway</td><td>HAProxy, AWS ALB, Azure LB</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ed-proxy">
          <h2><span className="n">02</span>Reverse Proxy</h2>
          <p>Client chỉ biết địa chỉ của proxy. Proxy nhận request rồi chuyển vào server nội bộ, nên server thật không lộ ra internet. Khác với <i>forward proxy</i> (đứng về phía client, ví dụ proxy công ty), reverse proxy đứng về phía server.</p>
          <ul className="plain">
            <li><b>TLS termination:</b> giải mã HTTPS tại proxy, nội bộ chạy HTTP hoặc mTLS.</li>
            <li><b>Cache và nén:</b> trả nội dung tĩnh, gzip/brotli, giảm tải cho app.</li>
            <li><b>Bảo vệ:</b> ẩn topology, chặn request xấu, giới hạn kích thước, thêm header bảo mật.</li>
          </ul>
          <Code lang="nginx">{`server {
  listen 443 ssl http2;
  server_name shop.example.com;

  location /static/ {                 # served and cached by the proxy itself
    root /var/www;
    expires 7d;
  }

  location / {
    proxy_pass http://app:3000;       # the real server is never exposed
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;   # keep the client IP
  }
}`}</Code>
        </section>

        <section id="ed-gateway">
          <h2><span className="n">03</span>API Gateway</h2>
          <p>Gateway là reverse proxy có thêm <b>hiểu biết về API</b>. Nó là cửa vào duy nhất của hệ thống microservice, gom các việc chung để từng service khỏi tự làm.</p>
          <ul className="plain">
            <li><b>Xác thực và phân quyền:</b> kiểm tra JWT hoặc API key trước khi vào service (xem trang SSO &amp; Microservice).</li>
            <li><b>Rate limit, quota, throttling</b> theo user hoặc key.</li>
            <li><b>Routing:</b> <code>/orders</code> tới order-svc, <code>/users</code> tới user-svc; đổi phiên bản API, canary.</li>
            <li><b>Aggregation:</b> một request từ mobile, gateway gọi nhiều service rồi gộp kết quả (còn gọi là BFF).</li>
            <li><b>Chuyển đổi và quan sát:</b> đổi giao thức (REST sang gRPC), log, metric, trace tập trung.</li>
          </ul>
          <Code lang="ts">{`// Aggregation at the gateway: one call from the client, three calls inside
app.get("/home", authenticate, rateLimit, async (req, res) => {
  const [user, orders, promos] = await Promise.all([
    fetch("http://user-svc/me", { headers: forward(req) }).then(r => r.json()),
    fetch("http://order-svc/recent", { headers: forward(req) }).then(r => r.json()),
    fetch("http://promo-svc/active").then(r => r.json()),
  ]);
  res.json({ user, orders, promos });   // mobile makes 1 round trip instead of 3
});`}</Code>
          <div className="note"><b>Cẩn thận:</b> gateway là điểm đơn lẻ và dễ thành &quot;cục to&quot; chứa nghiệp vụ. Chỉ để việc xuyên suốt (auth, limit, routing) ở đây; nghiệp vụ thuộc về service.</div>
        </section>

        <section id="ed-lb">
          <h2><span className="n">04</span>Load Balancer</h2>
          <p>Nhận request ở một địa chỉ công khai và chia cho nhiều bản sao của cùng một service. Nó <b>theo dõi sức khỏe</b> và ngừng gửi vào server hỏng, nên vừa tăng tải chịu được vừa tăng tính sẵn sàng.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Loại</th><th>Dựa trên</th><th>Đặc điểm</th></tr>
              </thead>
              <tbody>
                <tr><td><b>L4</b> (TCP/UDP)</td><td>IP, port</td><td>Rất nhanh, không đọc nội dung. Ví dụ AWS NLB</td></tr>
                <tr><td><b>L7</b> (HTTP)</td><td>Host, path, header, cookie</td><td>Linh hoạt, có thể route theo đường dẫn. Ví dụ AWS ALB, HAProxy</td></tr>
              </tbody>
            </table>
          </div>
          <ul className="plain">
            <li><b>Thuật toán:</b> round robin, least connections, weighted, IP hash (cùng client về cùng server).</li>
            <li><b>Health check:</b> gọi định kỳ <code>/health</code>; server fail liên tiếp thì bị loại, khỏe lại thì được thêm vào.</li>
            <li><b>Sticky session:</b> ghim user vào một server khi state nằm trong RAM. Tốt hơn là service stateless, state đưa ra Redis.</li>
          </ul>
          <Code lang="nginx">{`upstream app {
  least_conn;                               # pick the server with fewest connections
  server 10.0.1.11:3000 max_fails=3 fail_timeout=10s;   # passive health check
  server 10.0.1.12:3000 max_fails=3 fail_timeout=10s;
  server 10.0.1.13:3000 backup;             # used only when the others are down
}

server {
  location / { proxy_pass http://app; }
}`}</Code>
        </section>

        <section id="ed-together">
          <h2><span className="n">05</span>Dùng cùng nhau</h2>
          <p>Trong hệ thống thật, chúng xếp tầng chứ không thay thế nhau:</p>
          <ol className="steps">
            <li><div><b>Load balancer ngoài cùng</b><div className="d">Một địa chỉ công khai (ALB), chia request cho nhiều bản sao gateway và loại bản hỏng.</div></div></li>
            <li><div><b>API Gateway</b><div className="d">Xác thực, rate limit, routing tới đúng service; thường chính là một reverse proxy như Envoy hoặc Kong.</div></div></li>
            <li><div><b>Load balancer nội bộ</b><div className="d">Trước mỗi service có nhiều bản sao: Kubernetes Service, hoặc sidecar của service mesh tự chia tải.</div></div></li>
          </ol>
          <div className="pp">
            <div><span className="pl">Chọn Reverse Proxy khi</span>Một app, cần TLS, cache, file tĩnh, che server. Đơn giản là đủ.</div>
            <div><span className="pl">Chọn API Gateway khi</span>Nhiều service, nhiều loại client, cần auth, quota, version, gộp API ở một chỗ.</div>
            <div><span className="pl">Chọn Load Balancer khi</span>Một service chạy nhiều bản sao, cần chịu tải và chịu lỗi.</div>
            <div className="warnc"><span className="pl">Tránh</span>Nhét nghiệp vụ vào gateway, hoặc dùng gateway nặng cho một app nhỏ chỉ cần nginx.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
