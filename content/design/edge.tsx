import { Code } from "@/components/Code";

// Image is served from /public; prefix the base path when hosted under a sub-path (GitHub Pages)
const IMG = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/reverse-proxy-vs-gateway-vs-lb.png`;

export default function DesignEdgePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Reverse Proxy, API Gateway, Load Balancer">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ed-overview"><span>01</span>So sánh nhanh</a></li>
          <li><a href="#ed-each"><span>02</span>Từng cái làm gì</a></li>
          <li><a href="#ed-together"><span>03</span>Dùng cùng nhau</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · edge</div>
          <h1>Reverse Proxy, API Gateway, Load Balancer</h1>
          <p className="lede">Cả ba đứng giữa client và server nên dễ nhầm. Nhớ ngắn gọn: <b>proxy che server</b>, <b>gateway là cửa vào có luật</b>, <b>load balancer chia tải</b>. nginx hay Envoy làm được cả ba, nên hãy phân biệt theo vai trò chứ không theo tên phần mềm.</p>
        </header>

        <section id="ed-overview">
          <h2><span className="n">01</span>So sánh nhanh</h2>
          <figure className="fig">
            <img src={IMG} alt="Reverse Proxy, API Gateway và Load Balancer: vị trí giữa client và server, ví dụ phần mềm và việc mỗi loại làm" />
            <figcaption>Nguồn: Level Up Coding (blog.levelupcoding.com).</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>Reverse Proxy</th><th>API (Application Programming Interface) Gateway</th><th>Load Balancer</th></tr>
              </thead>
              <tbody>
                <tr><td><b>Mục đích</b></td><td>Thay mặt server nhận request</td><td>Một cửa vào cho nhiều service</td><td>Chia request cho nhiều bản sao</td></tr>
                <tr><td><b>Biết về</b></td><td>HTTP (HyperText Transfer Protocol) (host, path)</td><td>API (user, key, quota, version)</td><td>Tải và sức khỏe server</td></tr>
                <tr><td><b>Gộp nhiều service</b></td><td>Không</td><td>Có</td><td>Không</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ed-each">
          <h2><span className="n">02</span>Từng cái làm gì</h2>
          <div className="pp">
            <div><span className="pl">Reverse Proxy</span>Client chỉ biết địa chỉ proxy, server thật không lộ ra internet. Làm TLS (Transport Layer Security) termination, cache, nén, file tĩnh.</div>
            <div><span className="pl">API Gateway</span>Proxy có hiểu biết về API: xác thực, rate limit, route <code>/orders</code> tới order-svc, gộp kết quả nhiều service. Xem thêm trang SSO (Single Sign-On) &amp; Microservice.</div>
            <div><span className="pl">Load Balancer</span>Một địa chỉ công khai, chia cho nhiều bản sao. Health check định kỳ, server hỏng bị loại. L4 (TCP) nhanh; L7 (HTTP) route được theo path.</div>
            <div className="warnc"><span className="pl">Cẩn thận</span>Gateway là điểm đơn lẻ và dễ phình thành &quot;cục to&quot;. Chỉ để việc chung (auth, limit, routing); nghiệp vụ thuộc về service.</div>
          </div>
          <Code lang="nginx">{`upstream app {
  least_conn;                                  # load balancer: ưu tiên server ít kết nối nhất
  server 10.0.1.11:3000 max_fails=3 fail_timeout=10s;   # bị loại sau 3 lần lỗi
  server 10.0.1.12:3000 max_fails=3 fail_timeout=10s;
}

server {
  listen 443 ssl;                              # reverse proxy: TLS kết thúc ở đây
  location / {
    proxy_pass http://app;                     # server thật được giấu đi
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}`}</Code>
        </section>

        <section id="ed-together">
          <h2><span className="n">03</span>Dùng cùng nhau</h2>
          <p>Trong hệ thống thật chúng xếp tầng, không thay thế nhau:</p>
          <ol className="steps">
            <li><div><b>Load balancer ngoài cùng</b><div className="d">Một địa chỉ công khai (ALB), chia cho nhiều bản sao gateway.</div></div></li>
            <li><div><b>API Gateway</b><div className="d">Xác thực, rate limit, route tới đúng service; thường chính là một reverse proxy như Envoy hoặc Kong.</div></div></li>
            <li><div><b>Load balancer nội bộ</b><div className="d">Trước mỗi service có nhiều bản sao (Kubernetes Service, service mesh).</div></div></li>
          </ol>
          <div className="note tip"><b>Chọn nhanh:</b> một app nhỏ cần TLS và cache thì chỉ cần reverse proxy. Nhiều service cần auth và quota thì thêm gateway. Chạy nhiều bản sao thì cần load balancer.</div>
        </section>
      </main>
    </div>
  );
}
