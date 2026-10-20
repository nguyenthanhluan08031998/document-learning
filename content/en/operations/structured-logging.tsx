import { Code } from "@/components/Code";

export default function StructuredLoggingPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Structured logging contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ls-json"><span>01</span>Structured logging</a></li>
          <li><a href="#ls-pino"><span>02</span>Using pino</a></li>
          <li><a href="#ls-child"><span>03</span>{"Child loggers & context"}</a></li>
          <li><a href="#ls-requestid"><span>04</span>Request ID everywhere</a></li>
          <li><a href="#ls-redact"><span>05</span>Masking sensitive data</a></li>
          <li><a href="#ls-perf"><span>06</span>Performance</a></li>
          <li><a href="#ls-libs"><span>07</span>Library comparison</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">operations · structured logging</div>
          <h1>{"Structured logging & context"}</h1>
          <p className="lede">Sentence-style logs are readable only by humans. Logs as <b>JSON with clear fields</b> can be filtered, counted and charted by machines: “find every error for order 42”, “average processing time of /orders”. This is the standard for backend systems today.</p>
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
            <li><code>msg</code> is a <b>fixed</b> phrase (“order created”); changing data goes into separate fields. That way you can group by <code>msg</code>.</li>
            <li>Standardize field names across the company: <code>userId</code>, not sometimes <code>user_id</code> and sometimes <code>uid</code>.</li>
            <li>Locally, use <code>pino-pretty</code> for readable output; keep JSON in production.</li>
          </ul>
        </section>
        <section id="ls-pino">
          <h2><span className="n">02</span>Using pino</h2>
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
          <p>pino's argument order: <b>context object first, message second</b>. Pass errors under the <code>err</code> key so pino prints the stack trace and <code>cause</code>.</p>
        </section>
        <section id="ls-child">
          <h2><span className="n">03</span>{"Child loggers & context"}</h2>
          <Code lang="ts">{`// A child logger copies the parent config and adds fixed fields to every line
const orderLog = logger.child({ module: "checkout", orderId: "42" });

orderLog.info("reserving stock");      // includes module + orderId automatically
orderLog.info({ items: 3 }, "stock reserved");
orderLog.error({ err }, "charge failed");`}</Code>
          <p>Instead of repeating <code>orderId</code> on every line, create a child logger once per request, job or message being processed.</p>
        </section>
        <section id="ls-requestid">
          <h2><span className="n">04</span>Request ID everywhere</h2>
          <p>Each request gets a unique ID that is attached to every log line while it is handled and forwarded to other services in a header. Look up one ID and you see the whole story.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 374" role="img" aria-label="Request ID everywhere: the order service creates a reqId, logs, and passes the reqId in a header to the inventory service; both log lines carry the same reqId"> <defs><marker id="lfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="lfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="lfc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="lfd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="lfe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Client</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">mobile app</text> <path d="M70.0 62 V360" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-hl" x="253.33333333333337" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="323.33333333333337" y="35" textAnchor="middle">Order svc</text> <text className="s-tm" x="323.33333333333337" y="52" textAnchor="middle">creates reqId</text> <path d="M323.33333333333337 62 V360" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="506.66666666666674" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="576.6666666666667" y="35" textAnchor="middle">Inventory svc</text> <text className="s-tm" x="576.6666666666667" y="52" textAnchor="middle">receives reqId</text> <path d="M576.6666666666667 62 V360" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Log store</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">Loki · Elastic</text> <path d="M830.0 62 V360" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H317.33333333333337" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfa)" /> <text className="s-tm" x="196.66666666666669" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>POST /orders</text> <path d="M327.33333333333337 126 H824.0" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfe)" /> <text className="s-tm" x="576.6666666666667" y="119" textAnchor="middle" style={{ fill: "var(--new)" }}>reqId=9f2c · order received</text> <path d="M327.33333333333337 160 H570.6666666666667" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfa)" /> <text className="s-tm" x="450.00000000000006" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>POST /reserve · x-request-id: 9f2c</text> <path d="M580.6666666666667 194 H824.0" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfe)" /> <text className="s-tm" x="703.3333333333334" y="187" textAnchor="middle" style={{ fill: "var(--new)" }}>reqId=9f2c · stock reserved</text> <path d="M572.6666666666667 228 H329.33333333333337" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#lfb)" /> <text className="s-tm" x="450.00000000000006" y="221" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <path d="M327.33333333333337 262 H824.0" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#lfe)" /> <text className="s-tm" x="576.6666666666667" y="255" textAnchor="middle" style={{ fill: "var(--new)" }}>reqId=9f2c · order created</text> <path d="M319.33333333333337 296 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#lfb)" /> <text className="s-tm" x="196.66666666666669" y="289" textAnchor="middle" style={{ fill: "var(--muted)" }}>201 · x-request-id: 9f2c</text> <text className="s-tm" x="10.0" y="330" style={{ fill: "var(--accent)", fontWeight: "600" }}>Search reqId = 9f2c → all 3 lines from 2 services</text> </svg>
            </div>
            <figcaption>The same reqId appears in the logs of every service the request passes through, and is returned to the client for error reports.</figcaption>
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
          <div className="note tip">With Kafka, RabbitMQ, NATS: put the request ID (or <code>traceparent</code>) in the <b>message headers</b>; consumers read it and create a matching child logger. A flow crossing both APIs and messaging stays connected.</div>
          <p>Libraries like <code>pino-http</code> provide this middleware out of the box.</p>
        </section>
        <section id="ls-redact">
          <h2><span className="n">05</span>Masking sensitive data</h2>
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
          <h2><span className="n">06</span>Performance</h2>
          <ul className="plain">
            <li><code>console.log</code> may write synchronously (to files or terminals depending on the OS), has no levels or JSON, and is slow under heavy logging; pino is built to write very fast and push heavy formatting to a worker thread (transport).</li>
            <li>Don't build expensive strings when the level is off: <code>if (logger.isLevelEnabled("debug")) logger.debug(buildBigReport())</code>.</li>
            <li>Don't log inside hot loops; log a summary after the loop.</li>
            <li>With huge log volumes, <b>sample</b>: keep 100% of errors and only 1–10% of successful request logs.</li>
            <li>When the process exits, flush buffered logs so the last lines, usually the most important ones, are not lost.</li>
          </ul>
        </section>
        <section id="ls-libs">
          <h2><span className="n">07</span>Node.js library comparison</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Library</th>
                  <th>Characteristics</th>
                  <th>Fits when</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>pino</b></td>
                  <td>JSON, very fast, child loggers, redaction, transports on a worker thread</td>
                  <td>The default for new services; built into Fastify</td>
                </tr>
                <tr>
                  <td><b>winston</b></td>
                  <td>Many transports (file, HTTP, console), flexible formatting</td>
                  <td>Writing to many destinations, projects already using it</td>
                </tr>
                <tr>
                  <td><b>NestJS Logger</b></td>
                  <td>Built into the framework; replaceable with pino via <code>nestjs-pino</code></td>
                  <td>NestJS projects</td>
                </tr>
                <tr>
                  <td><b>console</b></td>
                  <td>No configuration, no real levels, no JSON</td>
                  <td>Small scripts, prototypes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
