import { Code } from "@/components/Code";

export default function StructuredLoggingPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục structured logging">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ls-json"><span>01</span>Structured logging</a></li>
          <li><a href="#ls-pino"><span>02</span>Dùng pino</a></li>
          <li><a href="#ls-child"><span>03</span>{"Child logger & ngữ cảnh"}</a></li>
          <li><a href="#ls-requestid"><span>04</span>Request ID xuyên suốt</a></li>
          <li><a href="#ls-redact"><span>05</span>Che dữ liệu nhạy cảm</a></li>
          <li><a href="#ls-perf"><span>06</span>Hiệu năng</a></li>
          <li><a href="#ls-libs"><span>07</span>So sánh thư viện</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">vận hành · structured logging</div>
          <h1>{"Structured logging & ngữ cảnh"}</h1>
          <p className="lede">Log dạng câu văn chỉ con người đọc được. Log dạng <b>JSON có trường rõ ràng</b> thì máy lọc, đếm, vẽ biểu đồ được: “tìm mọi lỗi của đơn 42”, “thời gian xử lý trung bình của /orders”. Đây là chuẩn cho hệ thống backend hiện nay.</p>
          <div className="tape" aria-hidden="true">
            <div>{"{"}</div>
            <div>"level"</div>
            <div>"msg"</div>
            <div className="hw">"reqId"</div>
            <div className="leo">{"}"}</div>
          </div>
        </header>
        <section id="ls-json">
          <h2><span className="n">01</span>Structured logging</h2>
          <div className="cmp">
            <Code lang="text">{`// Plain text: hard to search and parse
[2026-10-19 01:15:02] INFO Order 42 created by user 7 total 350000`}</Code>
            <Code lang="json">{`{"level":30,"time":"2026-10-19T01:15:02.311Z",
 "service":"order-svc","reqId":"9f2c…",
 "msg":"order created",
 "orderId":"42","userId":"7","total":350000}`}</Code>
          </div>
          <ul className="plain">
            <li><code>msg</code> là câu <b>cố định</b> (“order created”), dữ liệu thay đổi đưa vào trường riêng. Nhờ vậy gom nhóm được theo <code>msg</code>.</li>
            <li>Thống nhất tên trường trong toàn công ty: <code>userId</code> chứ không lúc <code>user_id</code> lúc <code>uid</code>.</li>
            <li>Khi chạy local, dùng <code>pino-pretty</code> để in ra dạng dễ đọc; production giữ JSON.</li>
          </ul>
        </section>
        <section id="ls-pino">
          <h2><span className="n">02</span>Dùng pino</h2>
          <Code lang="ts">{`import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "order-svc", version: process.env.APP_VERSION },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: ["req.headers.authorization", "*.password", "*.cardNumber"],
  // Pretty output only on a developer machine
  transport: process.env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
});

logger.info({ orderId: "42", total: 350_000 }, "order created");
logger.warn({ attempt: 2, gateway: "vnpay" }, "payment retry");
logger.error({ err: new Error("timeout") }, "payment failed");`}</Code>
          <p>Thứ tự tham số của pino: <b>object ngữ cảnh trước, message sau</b>. Truyền lỗi qua khóa <code>err</code> để pino tự in stack trace và <code>cause</code>.</p>
        </section>
        <section id="ls-child">
          <h2><span className="n">03</span>{"Child logger & ngữ cảnh"}</h2>
          <Code lang="ts">{`// A child logger copies the parent config and adds fixed fields to every line
const orderLog = logger.child({ module: "checkout", orderId: "42" });

orderLog.info("reserving stock");      // includes module + orderId automatically
orderLog.info({ items: 3 }, "stock reserved");
orderLog.error({ err }, "charge failed");`}</Code>
          <p>Thay vì lặp <code>orderId</code> ở mọi dòng, tạo child logger một lần cho mỗi request, mỗi job hoặc mỗi message đang xử lý.</p>
        </section>
        <section id="ls-requestid">
          <h2><span className="n">04</span>Request ID xuyên suốt</h2>
          <p>Mỗi request nhận một ID duy nhất, gắn vào mọi dòng log trong lúc xử lý request đó, và chuyển tiếp sang service khác qua header. Tra một ID là thấy toàn bộ câu chuyện.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 374" role="img" aria-label="Request ID xuyên suốt: order service tạo reqId, ghi log, chuyển reqId qua header sang inventory service, cả hai ghi log có cùng reqId"> <defs><marker id="lfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="lfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="lfc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="lfd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="lfe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Client</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">mobile app</text> <path d="M70.0 62 V360" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-hl" x="253.33333333333337" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="323.33333333333337" y="35" textAnchor="middle">Order svc</text> <text className="s-tm" x="323.33333333333337" y="52" textAnchor="middle">tạo reqId</text> <path d="M323.33333333333337 62 V360" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="506.66666666666674" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="576.6666666666667" y="35" textAnchor="middle">Inventory svc</text> <text className="s-tm" x="576.6666666666667" y="52" textAnchor="middle">nhận reqId</text> <path d="M576.6666666666667 62 V360" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Log store</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">Loki · Elastic</text> <path d="M830.0 62 V360" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H317.33333333333337" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfa)" /> <text className="s-tm" x="196.66666666666669" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>POST /orders</text> <path d="M327.33333333333337 126 H824.0" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfe)" /> <text className="s-tm" x="576.6666666666667" y="119" textAnchor="middle" style={{ fill: "var(--new)" }}>reqId=9f2c · order received</text> <path d="M327.33333333333337 160 H570.6666666666667" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfa)" /> <text className="s-tm" x="450.00000000000006" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>POST /reserve · x-request-id: 9f2c</text> <path d="M580.6666666666667 194 H824.0" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfe)" /> <text className="s-tm" x="703.3333333333334" y="187" textAnchor="middle" style={{ fill: "var(--new)" }}>reqId=9f2c · stock reserved</text> <path d="M572.6666666666667 228 H329.33333333333337" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#lfb)" /> <text className="s-tm" x="450.00000000000006" y="221" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <path d="M327.33333333333337 262 H824.0" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfe)" /> <text className="s-tm" x="576.6666666666667" y="255" textAnchor="middle" style={{ fill: "var(--new)" }}>reqId=9f2c · order created</text> <path d="M319.33333333333337 296 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#lfb)" /> <text className="s-tm" x="196.66666666666669" y="289" textAnchor="middle" style={{ fill: "var(--muted)" }}>201 · x-request-id: 9f2c</text> <text className="s-tm" x="10.0" y="330" style={{ fill: "var(--accent)", fontWeight: "600" }}>Tìm reqId = 9f2c → thấy đủ 3 dòng từ 2 service</text> </svg>
            </div>
            <figcaption>Cùng một reqId xuất hiện trong log của mọi service mà request đi qua, và được trả lại cho client để báo lỗi.</figcaption>
          </figure>
          <Code lang="ts">{`import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { Logger } from "pino";

// Holds the per-request logger across every await, without passing it around
const als = new AsyncLocalStorage<Logger>();
export const log = () => als.getStore() ?? logger;

app.use((req, res, next) => {
  const reqId = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", reqId);
  const child = logger.child({ reqId, method: req.method, path: req.path });
  const start = performance.now();
  res.on("finish", () =>
    child.info({ status: res.statusCode, ms: Math.round(performance.now() - start) }, "request completed"));
  als.run(child, next);
});

// Anywhere deeper in the code: no logger parameter needed
export async function reserveStock(orderId: string) {
  log().info({ orderId }, "reserving stock");   // reqId is included automatically
}

// Forward the id to downstream services
await fetch(\`\${INVENTORY_URL}/reserve\`, { headers: { "x-request-id": currentReqId() } });`}</Code>
          <div className="note tip">Với Kafka, RabbitMQ, NATS: đặt request ID (hoặc <code>traceparent</code>) vào <b>header của message</b>, consumer đọc ra và tạo child logger tương ứng. Nhờ vậy một luồng đi qua cả API lẫn messaging vẫn nối được.</div>
          <p>Các thư viện như <code>pino-http</code> làm sẵn phần middleware này.</p>
        </section>
        <section id="ls-redact">
          <h2><span className="n">05</span>Che dữ liệu nhạy cảm</h2>
          <Code lang="ts">{`const logger = pino({
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "card.number"],
    censor: "[REDACTED]",
  },
});

logger.info({ user: { email: "an@example.com", password: "123456" } }, "login");
// -> {"user":{"email":"an@example.com","password":"[REDACTED]"},"msg":"login"}`}</Code>
        </section>
        <section id="ls-perf">
          <h2><span className="n">06</span>Hiệu năng</h2>
          <ul className="plain">
            <li><code>console.log</code> có thể ghi đồng bộ (ra file, terminal tùy hệ điều hành), không có level hay JSON, và chậm khi log nhiều; pino được thiết kế để ghi rất nhanh và đẩy phần định dạng nặng sang worker thread (transport).</li>
            <li>Không ghép chuỗi tốn kém khi level đang tắt: <code>if (logger.isLevelEnabled("debug")) logger.debug(buildBigReport())</code>.</li>
            <li>Không log trong vòng lặp nóng; log tổng kết sau vòng lặp.</li>
            <li>Lượng log lớn thì <b>lấy mẫu</b> (sampling): giữ 100% lỗi, chỉ 1–10% log request thành công.</li>
            <li>Khi tiến trình thoát, flush log còn trong bộ đệm để không mất những dòng cuối, thường là những dòng quan trọng nhất.</li>
          </ul>
        </section>
        <section id="ls-libs">
          <h2><span className="n">07</span>So sánh thư viện Node.js</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Thư viện</th>
                  <th>Đặc điểm</th>
                  <th>Hợp khi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>pino</b></td>
                  <td>JSON, rất nhanh, child logger, redact, transport chạy ở worker thread</td>
                  <td>Mặc định cho service mới; Fastify dùng sẵn</td>
                </tr>
                <tr>
                  <td><b>winston</b></td>
                  <td>Nhiều transport (file, HTTP, console), định dạng linh hoạt</td>
                  <td>Cần ghi nhiều đích khác nhau, dự án đã dùng từ trước</td>
                </tr>
                <tr>
                  <td><b>NestJS Logger</b></td>
                  <td>Có sẵn trong framework, thay được bằng pino qua <code>nestjs-pino</code></td>
                  <td>Dự án NestJS</td>
                </tr>
                <tr>
                  <td><b>console</b></td>
                  <td>Không cấu hình, không level thật, không JSON</td>
                  <td>Script nhỏ, prototype</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
