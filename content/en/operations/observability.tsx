import { Code } from "@/components/Code";

export default function ObservabilityPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Observability contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ob-pillars"><span>01</span>Logs, Metrics, Traces</a></li>
          <li><a href="#ob-trace"><span>02</span>Distributed tracing</a></li>
          <li><a href="#ob-otel"><span>03</span>OpenTelemetry</a></li>
          <li><a href="#ob-metrics"><span>04</span>Metrics to measure</a></li>
          <li><a href="#ob-alert"><span>05</span>Alerting</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">operations · observability</div>
          <h1>Observability: logs, metrics, traces</h1>
          <p className="lede">Logs are only one part. To understand how a multi-service system behaves you need three complementary kinds of signals, linked together by a <b>trace ID</b>.</p>
          <div className="tape" aria-hidden="true">
            <div>logs</div>
            <div>metrics</div>
            <div className="hw">traces</div>
            <div className="leo">traceId</div>
          </div>
        </header>
        <section id="ob-pillars">
          <h2><span className="n">01</span>The three pillars</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Logs</th>
                  <th>Metrics</th>
                  <th>Traces</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>What it is</b></td>
                  <td>Individual events with details</td>
                  <td>Aggregated numbers over time</td>
                  <td>One request's journey across services</td>
                </tr>
                <tr>
                  <td><b>Answers</b></td>
                  <td>What happened to order 42?</td>
                  <td>What was the error rate over the last 5 minutes?</td>
                  <td>Which service made this request slow?</td>
                </tr>
                <tr>
                  <td><b>Storage cost</b></td>
                  <td>High, grows with traffic</td>
                  <td>Low, nearly constant</td>
                  <td>Medium, usually sampled</td>
                </tr>
                <tr>
                  <td><b>Tools</b></td>
                  <td>Loki, Elasticsearch, Datadog</td>
                  <td>Prometheus, Grafana</td>
                  <td>Jaeger, Tempo, Zipkin</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>A common workflow: a <b>metric</b> alerts (error rate rises) → a <b>trace</b> points to the slow or failing service → the <b>logs</b> of that exact request reveal the cause.</p>
        </section>
        <section id="ob-trace">
          <h2><span className="n">02</span>Distributed tracing</h2>
          <p>A <b>trace</b> is a request's whole journey; each unit of work (API call, DB query, message publish) is a <b>span</b> with a start time, duration and parent span. The trace ID travels between services in the standard W3C <code>traceparent</code> header.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 322" role="img" aria-label="Waterfall trace of a POST orders request: gateway 480 ms, order service, insert, inventory reserve 160 ms, update stock, payment charge 160 ms, kafka publish"> <defs /> <path d="M300.0 30 V292" style={{ stroke: "var(--line)", strokeWidth: "1", strokeDasharray: "3 4" }} /> <text className="s-tm" x="300.0" y="22" textAnchor="middle">0 ms</text> <path d="M415.0 30 V292" style={{ stroke: "var(--line)", strokeWidth: "1", strokeDasharray: "3 4" }} /> <text className="s-tm" x="415.0" y="22" textAnchor="middle">100 ms</text> <path d="M530.0 30 V292" style={{ stroke: "var(--line)", strokeWidth: "1", strokeDasharray: "3 4" }} /> <text className="s-tm" x="530.0" y="22" textAnchor="middle">200 ms</text> <path d="M645.0 30 V292" style={{ stroke: "var(--line)", strokeWidth: "1", strokeDasharray: "3 4" }} /> <text className="s-tm" x="645.0" y="22" textAnchor="middle">300 ms</text> <path d="M760.0 30 V292" style={{ stroke: "var(--line)", strokeWidth: "1", strokeDasharray: "3 4" }} /> <text className="s-tm" x="760.0" y="22" textAnchor="middle">400 ms</text> <path d="M875.0 30 V292" style={{ stroke: "var(--line)", strokeWidth: "1", strokeDasharray: "3 4" }} /> <text className="s-tm" x="875.0" y="22" textAnchor="middle">500 ms</text> <text className="s-tm" x="16" y="58" style={{ fill: "var(--ink)" }}>gateway · POST /orders</text> <rect className="s-hl" x="300.0" y="44" width="552.0" height="20" rx="3" /> <text className="s-tm" x="858.0" y="58">480 ms</text> <text className="s-tm" x="30" y="94" style={{ fill: "var(--ink)" }}>order-svc · placeOrder</text> <rect className="s-hl" x="323.0" y="80" width="523.25" height="20" rx="3" /> <text className="s-tm" x="852.25" y="94">455 ms</text> <text className="s-tm" x="44" y="130" style={{ fill: "var(--ink)" }}>pg · INSERT orders</text> <rect className="s-hl" x="346.0" y="116" width="57.49999999999999" height="20" rx="3" /> <text className="s-tm" x="409.5" y="130">50 ms</text> <text className="s-tm" x="44" y="166" style={{ fill: "var(--ink)" }}>inventory-svc · reserve (gRPC)</text> <rect className="s-hl" x="415.0" y="152" width="184.0" height="20" rx="3" /> <text className="s-tm" x="605.0" y="166">160 ms</text> <text className="s-tm" x="58" y="202" style={{ fill: "var(--ink)" }}>pg · UPDATE stock</text> <rect className="s-hl" x="449.5" y="188" width="103.49999999999999" height="20" rx="3" /> <text className="s-tm" x="559.0" y="202">90 ms</text> <text className="s-tm" x="44" y="238" style={{ fill: "var(--ink)" }}>payment-svc · charge</text> <rect className="s-disk" x="610.5" y="224" width="206.99999999999997" height="20" rx="3" /> <text className="s-tm" x="823.5" y="238">180 ms</text> <text className="s-tm" x="44" y="274" style={{ fill: "var(--ink)" }}>kafka · publish orders.created</text> <rect className="s-hl" x="823.25" y="260" width="17.25" height="20" rx="3" /> <text className="s-tm" x="846.5" y="274">15 ms</text> <text className="s-tm" x="530.0" y="310" style={{ fill: "var(--warn)" }}>slowest span: payment charge 180 ms</text> </svg>
            </div>
            <figcaption>Each bar is a span; nested bars are child work. One glance shows where the time goes.</figcaption>
          </figure>
          <Code lang="text">{`traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             │  └ trace id (32 hex)               └ parent span id   └ sampled`}</Code>
        </section>
        <section id="ob-otel">
          <h2><span className="n">03</span>OpenTelemetry</h2>
          <p>OpenTelemetry (OTel) is an open CNCF standard for collecting traces, metrics and logs and sending them to any backend. Instrument once; switch vendors without changing code.</p>
          <Code lang="ts">{`// tracing.ts — load before anything else: node --import ./tracing.js main.js
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

new NodeSDK({
  serviceName: "order-svc",
  traceExporter: new OTLPTraceExporter({ url: "http://otel-collector:4318/v1/traces" }),
  // Auto-instruments http, express, pg, ioredis, kafkajs, grpc ... and injects traceparent
  instrumentations: [getNodeAutoInstrumentations()],
}).start();`}</Code>
          <Code lang="ts">{`import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("checkout");

export async function placeOrder(input: PlaceOrderInput) {
  // A manual span for business logic you want to see in the waterfall
  return tracer.startActiveSpan("placeOrder", async span => {
    span.setAttribute("order.items", input.items.length);
    try {
      return await doPlaceOrder(input);
    } catch (err) {
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

// Put trace ids into every log line so logs and traces link together
const logger = pino({
  mixin() {
    const ctx = trace.getActiveSpan()?.spanContext();
    return ctx ? { traceId: ctx.traceId, spanId: ctx.spanId } : {};
  },
});`}</Code>
        </section>
        <section id="ob-metrics">
          <h2><span className="n">04</span>Metrics to measure</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Includes</th>
                  <th>Used for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>RED</b></td>
                  <td><b>R</b>ate (requests/second), <b>E</b>rrors (error rate), <b>D</b>uration (latency p50, p95, p99)</td>
                  <td>Every service, every endpoint</td>
                </tr>
                <tr>
                  <td><b>USE</b></td>
                  <td><b>U</b>tilization, <b>S</b>aturation, <b>E</b>rrors</td>
                  <td>Resources: CPU, RAM, disk, connection pools</td>
                </tr>
                <tr>
                  <td><b>Four golden signals</b></td>
                  <td>Latency, traffic, errors, saturation</td>
                  <td>From Google SRE, combining the two above</td>
                </tr>
                <tr>
                  <td><b>Messaging</b></td>
                  <td>Consumer lag (Kafka), messages waiting (RabbitMQ), unacked messages (JetStream)</td>
                  <td>Spotting slow consumers</td>
                </tr>
                <tr>
                  <td><b>Business</b></td>
                  <td>Orders per minute, revenue, payment success rate</td>
                  <td>Catches incidents technical metrics miss</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Use percentiles (p95, p99) for latency, not averages: an average of 100 ms can hide 1% of users waiting 5 seconds.</p>
        </section>
        <section id="ob-alert">
          <h2><span className="n">05</span>Alerting</h2>
          <ul className="plain">
            <li>Alert on <b>symptoms users see</b> (error rate, latency) rather than causes (CPU 80%).</li>
            <li>Every alert needs a clear action; alerts nobody handles teach people to ignore the real ones too.</li>
            <li>Set <b>SLO</b> targets (for example 99.9% of requests succeed under 300 ms over 30 days) and alert when the error budget burns too fast.</li>
            <li>Include links to the dashboard and runbook right in the alert.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
