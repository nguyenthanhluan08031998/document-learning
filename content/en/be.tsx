import Link from "next/link";

export default function BackendOverviewPage() {
  return (
    <div className="wrap single">
      <main>
        <header className="hero">
          <div className="eyebrow">backend · overview</div>
          <h1>How services talk to each other</h1>
          <p className="lede">There are two main ways. <b>Synchronous APIs</b>: send a request and wait for the answer. <b>Asynchronous messaging</b>: send an event to a broker and move on; the receiver handles it when ready. The notebook has a group for each, plus <b>Design</b> on structuring code inside a service, <b>Concurrency</b> on many parties changing the same data, and <b>Operations</b> on logging and observing the system.</p>
        </header>
        <section>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 406" role="img" aria-label="Typical architecture: web, mobile and partners call the API Gateway over REST or GraphQL; the gateway calls the Order, Payment and Inventory services over gRPC; services publish events to a Kafka, RabbitMQ or NATS event bus; Email, Analytics and Search consume them"> <defs> <marker id="ha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker> <marker id="hb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker> </defs> <rect className="s-bg" x="8" y="10" width="560" height="386" rx="10" /> <text className="s-lane" x="22" y="32">SYNC · API</text> <rect className="s-bg2" x="584" y="10" width="308" height="386" rx="10" /> <text className="s-lane2" x="598" y="32">ASYNC · MESSAGING</text> <rect className="s-box" x="22" y="70" width="120" height="62" rx="7" /><text className="s-tb" x="34" y="96">Web app</text><text className="s-tm" x="34" y="116">browser</text> <rect className="s-box" x="22" y="160" width="120" height="62" rx="7" /><text className="s-tb" x="34" y="186">Mobile app</text><text className="s-tm" x="34" y="206">iOS · Android</text> <rect className="s-box" x="22" y="250" width="120" height="62" rx="7" /><text className="s-tb" x="34" y="276">Partners</text><text className="s-tm" x="34" y="296">external systems</text> <rect className="s-box" x="196" y="110" width="130" height="140" rx="7" /><text className="s-tb" x="208" y="136">API Gateway</text><text className="s-tm" x="208" y="156">or BFF</text> <text className="s-tm" x="208" y="196">auth · rate limit</text><text className="s-tm" x="208" y="214">routing</text> <path className="s-ln" d="M142 101 C170 101 168 180 194 180" markerEnd="url(#ha)" /> <path className="s-ln" d="M142 191 C170 191 168 180 194 180" markerEnd="url(#ha)" /> <path className="s-ln" d="M142 281 C170 281 168 180 194 180" markerEnd="url(#ha)" /> <text className="s-tm" x="146" y="60">REST · GraphQL</text> <rect className="s-hl" x="400" y="60" width="150" height="62" rx="7" /><text className="s-tb" x="412" y="86">Order svc</text><text className="s-tm" x="412" y="106">gRPC server</text> <rect className="s-hl" x="400" y="170" width="150" height="62" rx="7" /><text className="s-tb" x="412" y="196">Payment svc</text><text className="s-tm" x="412" y="216">gRPC server</text> <rect className="s-hl" x="400" y="280" width="150" height="62" rx="7" /><text className="s-tb" x="412" y="306">Inventory svc</text><text className="s-tm" x="412" y="326">gRPC server</text> <path className="s-ln" d="M326 160 C360 160 360 91 398 91" markerEnd="url(#ha)" /> <text className="s-tm" x="346" y="178">gRPC</text> <path className="s-ln" d="M475 122 V168" markerEnd="url(#ha)" /> <path className="s-ln" d="M475 232 V278" markerEnd="url(#ha)" /> <text className="s-tm" x="482" y="260">gRPC</text> <text className="s-tm" x="482" y="150">gRPC</text> <rect className="s-disk" x="606" y="140" width="130" height="110" rx="8" /> <text className="s-tb" x="618" y="166">Event bus</text><text className="s-tm" x="618" y="188">Kafka</text><text className="s-tm" x="618" y="206">RabbitMQ</text><text className="s-tm" x="618" y="224">NATS</text> <path className="s-dl2" d="M550 91 C580 91 580 195 604 195" markerEnd="url(#hb)" /> <path className="s-dl2" d="M550 201 C580 201 580 195 604 195" markerEnd="url(#hb)" /> <path className="s-dl2" d="M550 311 C580 311 580 195 604 195" markerEnd="url(#hb)" /> <text className="s-tm" x="560" y="372" style={{ fill: "var(--warn)" }}>publish events</text> <rect className="s-box" x="766" y="70" width="116" height="62" rx="7" /><text className="s-tb" x="778" y="96">Email svc</text><text className="s-tm" x="778" y="116">consumer</text> <path className="s-dl2" d="M736 195 C752 195 748 101 764 101" markerEnd="url(#hb)" /> <rect className="s-box" x="766" y="170" width="116" height="62" rx="7" /><text className="s-tb" x="778" y="196">Analytics</text><text className="s-tm" x="778" y="216">consumer</text> <path className="s-dl2" d="M736 195 C752 195 748 201 764 201" markerEnd="url(#hb)" /> <rect className="s-box" x="766" y="270" width="116" height="62" rx="7" /><text className="s-tb" x="778" y="296">Search index</text><text className="s-tm" x="778" y="316">consumer</text> <path className="s-dl2" d="M736 195 C752 195 748 301 764 301" markerEnd="url(#hb)" /> </svg>
            </div>
            <figcaption>A common architecture: clients call the gateway with REST or GraphQL, services call each other with gRPC when they need an immediate answer, and publish events to an event bus for work that need not wait (emails, analytics, search updates).</figcaption>
          </figure>
        </section>
        <section>
          <div className="groups">
            <div className="group g-api">
              <div className="g-head"><span className="g-tag">Synchronous</span><h2>API</h2></div>
              <p>Request → response. The caller waits for the result; good when an immediate answer is needed.</p>
              <div className="g-list"> <Link className="g-item" href="/en/api/rest/"><b>REST</b><span>Resources, HTTP methods, status codes, caching</span></Link> <Link className="g-item" href="/en/api/graphql/"><b>GraphQL</b><span>Schema, client-picked fields, resolvers, N+1</span></Link> <Link className="g-item" href="/en/api/grpc/"><b>gRPC</b><span>Protobuf, HTTP/2, 4 streaming kinds, deadlines</span></Link> <Link className="g-item g-cmp" href="/en/api/compare/"><b>API comparison</b><span>REST vs GraphQL vs gRPC</span></Link> </div>
            </div>
            <div className="group g-msg">
              <div className="g-head"><span className="g-tag">Asynchronous</span><h2>Messaging</h2></div>
              <p>Publish → broker → consumer. The sender does not wait; the receiver works at its own pace.</p>
              <div className="g-list"> <Link className="g-item" href="/en/messaging/kafka/"><b>Kafka</b><span>Commit log, partitions, replication, HW</span></Link> <Link className="g-item" href="/en/messaging/rabbitmq/"><b>RabbitMQ</b><span>Exchanges, queues, acks, dead letters</span></Link> <Link className="g-item" href="/en/messaging/nats/"><b>NATS</b><span>Subjects, queue groups, JetStream, KV</span></Link> <Link className="g-item g-cmp" href="/en/messaging/compare/"><b>Messaging comparison</b><span>Kafka vs RabbitMQ vs NATS</span></Link> </div>
            </div>
            <div className="group g-design">
              <div className="g-head"><span className="g-tag">Inside a service</span><h2>Design</h2></div>
              <p>Principles, design patterns and architecture for code that is easy to change and test.</p>
              <div className="g-list"> <Link className="g-item" href="/en/design/oop/"><b>OOP</b><span>Classes, static, inheritance, interfaces, UML relations</span></Link> <Link className="g-item" href="/en/design/principles/"><b>Principles</b><span>SOLID, composition, DRY, KISS, YAGNI</span></Link> <Link className="g-item" href="/en/design/creational/"><b>GoF · 23 patterns</b><span>Creational, Structural, Behavioral</span></Link> <Link className="g-item" href="/en/design/microservice/"><b>Microservice patterns</b><span>Saga, Outbox, CQRS, Circuit Breaker</span></Link> <Link className="g-item" href="/en/design/clean-architecture/"><b>Clean Architecture</b><span>Four rings, Dependency Rule, TypeScript code</span></Link> <Link className="g-item g-cmp" href="/en/design/cheat-sheet/"><b>Cheat sheet</b><span>Problem → pattern to use</span></Link> </div>
            </div>
            <div className="group g-conc">
              <div className="g-head"><span className="g-tag">Shared data</span><h2>Concurrency</h2></div>
              <p>When many requests or instances change the same data: race conditions and kinds of locks.</p>
              <div className="g-list"> <Link className="g-item" href="/en/concurrency/overview/"><b>Overview</b><span>Race conditions, isolation levels, blocking</span></Link> <Link className="g-item" href="/en/concurrency/db-lock/"><b>Locks in the DB</b><span>Atomic, pessimistic, optimistic, deadlock</span></Link> <Link className="g-item" href="/en/concurrency/distributed-lock/"><b>Distributed lock</b><span>Redis, Redlock, fencing tokens, etcd</span></Link> <Link className="g-item g-cmp" href="/en/concurrency/compare/"><b>Comparison</b><span>Which mechanism, how to avoid locks</span></Link> </div>
            </div>
            <div className="group g-ops">
              <div className="g-head"><span className="g-tag">Running production</span><h2>Operations</h2></div>
              <p>Know what the system is doing: logs, request IDs, traces and metrics.</p>
              <div className="g-list"> <Link className="g-item" href="/en/operations/logging/"><b>Logging basics</b><span>Levels, what to log and not log, logging errors</span></Link> <Link className="g-item" href="/en/operations/structured-logging/"><b>{"Structured & context"}</b><span>JSON, pino, child loggers, request ID</span></Link> <Link className="g-item" href="/en/operations/build-logger/"><b>Build a logger</b><span>Logs in one service, traceId, spanId, correlationId</span></Link> <Link className="g-item" href="/en/operations/observability/"><b>Observability</b><span>Logs, metrics, traces, OpenTelemetry</span></Link> </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
