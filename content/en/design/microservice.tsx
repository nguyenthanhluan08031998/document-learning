import { Code } from "@/components/Code";

export default function MicroservicePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Microservice patterns contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ms-db-per-service"><span>01</span>Database per Service</a></li>
          <li><a href="#ms-saga"><span>02</span>Saga</a></li>
          <li><a href="#ms-orch-choreo"><span>03</span>Orchestration vs Choreography</a></li>
          <li><a href="#ms-outbox"><span>04</span>Transactional Outbox</a></li>
          <li><a href="#ms-idempotent-consumer"><span>05</span>Idempotent Consumer</a></li>
          <li><a href="#ms-cqrs"><span>06</span>CQRS</a></li>
          <li><a href="#ms-event-sourcing"><span>07</span>Event Sourcing</a></li>
          <li><a href="#ms-circuit-breaker"><span>08</span>Circuit Breaker</a></li>
          <li><a href="#ms-retry"><span>09</span>Retry + Backoff + Jitter</a></li>
          <li><a href="#ms-bulkhead"><span>10</span>Bulkhead</a></li>
          <li><a href="#ms-strangler"><span>11</span>Strangler Fig</a></li>
          <li><a href="#ms-sidecar"><span>12</span>Sidecar / Service Mesh</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design pattern · microservice</div>
          <h1>Pattern cho microservice</h1>
          <p className="lede">When a system splits into many services talking over the network (REST, gRPC, Kafka, RabbitMQ, NATS), new problems appear: transactions across services, reliable event publishing, cascading failures. These are the common solutions.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>In plain words</th>
                  <th>The idea in one sentence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><a className="plink" href="#ms-db-per-service">Database per Service</a></td>
                  <td>One database per service</td>
                  <td>Each service owns its data; other services access it only through APIs or events.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-saga">Saga</a></td>
                  <td>Distributed transaction</td>
                  <td>Split into a chain of local transactions. If a step fails, run <b>compensating actions</b> in reverse order.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-orch-choreo">Orchestration vs Choreography</a></td>
                  <td>Conductor or dancers</td>
                  <td><b>Orchestration</b>: one orchestrator knows the whole process and commands each service. <b>Choreography</b>: no center; each service listens for the previous step's event, does its part and publishes a new event.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-outbox">Transactional Outbox</a></td>
                  <td>Outbox</td>
                  <td>Write the event to an <code>outbox</code> table <b>in the same transaction</b> as the business data. A separate process reads the outbox and publishes to the broker.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-idempotent-consumer">Idempotent Consumer</a></td>
                  <td>Duplicate-safe consumer</td>
                  <td>Record the ids of processed messages in the same transaction as the business change; skip ids already seen.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-cqrs">CQRS</a></td>
                  <td>Separate writes and reads</td>
                  <td>Split <b>commands</b> (writes) and <b>queries</b> (reads) into two models. The write side emits events; the read side listens and updates a view optimized for queries.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-event-sourcing">Event Sourcing</a></td>
                  <td>Store the event log</td>
                  <td>Store <b>every event</b> that happened, in order (append only, never update). The current state is the “fold” of all events.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-circuit-breaker">Circuit Breaker</a></td>
                  <td>Circuit breaker</td>
                  <td>Count failures; past a threshold, “trip the breaker” and fail immediately without calling B. After a while let a few calls through; if they succeed, close it again.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-retry">Retry + Backoff + Jitter</a></td>
                  <td>Retry with spacing</td>
                  <td>Retry with exponentially growing delays plus randomness (jitter) so clients don't retry at the same moment.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-bulkhead">Bulkhead</a></td>
                  <td>Bulkhead</td>
                  <td>Split resources into separate compartments per dependency, like the bulkheads that keep a ship from sinking.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-strangler">Strangler Fig</a></td>
                  <td>Replace the old system gradually</td>
                  <td>Put a proxy/gateway in front and move routes to new services one by one; unmigrated routes still go to the old system until nothing is left in it.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#ms-sidecar">Sidecar / Service Mesh</a></td>
                  <td>Helper alongside</td>
                  <td>Run a helper process (a sidecar, usually Envoy) next to each service to handle networking. The set of sidecars is a service mesh (Istio, Linkerd).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="ms-db-per-service">
          <h2><span className="n">01</span>Database per Service <small className="vn">One database per service</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>When services share one database, changing a table's schema affects all of them and they cannot deploy independently.</div>
            <div><span className="pl">Idea</span>Each service owns its data; other services access it only through APIs or events.</div>
          </div>
          <div className="pp">
            <div><span className="pl">When to use</span>Almost the default when splitting into microservices.</div>
            <div className="warnc"><span className="pl">Caveat</span>You lose cross-service JOINs and transactions; you need Sagas for transactions and CQRS or API Composition for combined queries.</div>
          </div>
        </section>
        <section id="ms-saga">
          <h2><span className="n">02</span>Saga <small className="vn">Distributed transaction</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Placing an order means reserving stock, charging money and creating a shipment in three services with three databases. There is no shared transaction to roll back.</div>
            <div><span className="pl">Idea</span>Split into a chain of local transactions. If a step fails, run <b>compensating actions</b> in reverse order.</div>
          </div>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 312" role="img" aria-label="Saga: in orchestration an orchestrator calls inventory, payment and shipping in turn; in choreography services chain through events"> <defs><marker id="sga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="sgb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker></defs> <rect className="s-bg" x="8" y="8" width="430" height="296" rx="10" /> <text className="s-lane" x="22" y="30">ORCHESTRATION</text> <rect className="s-hl" x="150" y="44" width="150" height="54" rx="7" /><text className="s-tb" x="162" y="68">Orchestrator</text><text className="s-tm" x="162" y="86">holds saga state</text> <rect className="s-box" x="24" y="190" width="124" height="54" rx="7" /><text className="s-tb" x="36" y="214">Inventory</text><text className="s-tm" x="36" y="232">service</text> <path className="s-ln" d="M225 98 L86 188" markerEnd="url(#sga)" /> <text className="s-tm" x="30" y="150">1 reserve</text> <rect className="s-box" x="160" y="190" width="124" height="54" rx="7" /><text className="s-tb" x="172" y="214">Payment</text><text className="s-tm" x="172" y="232">service</text> <path className="s-ln" d="M225 98 L222 188" markerEnd="url(#sga)" /> <text className="s-tm" x="232" y="150">2 charge</text> <rect className="s-box" x="296" y="190" width="124" height="54" rx="7" /><text className="s-tb" x="308" y="214">Shipping</text><text className="s-tm" x="308" y="232">service</text> <path className="s-ln" d="M225 98 L358 188" markerEnd="url(#sga)" /> <text className="s-tm" x="330" y="150">3 ship</text> <text className="s-tm" x="24" y="272" style={{ fill: "var(--bad)" }}>step 3 fails → refund, then release</text> <text className="s-tm" x="24" y="290">one place in control, easy to follow</text> <rect className="s-bg2" x="452" y="8" width="440" height="296" rx="10" /> <text className="s-lane2" x="466" y="30">CHOREOGRAPHY</text> <rect className="s-box" x="472" y="44" width="140" height="46" rx="7" /><text className="s-tb" x="484" y="68">Order</text><text className="s-tm" x="484" y="86">service</text> <path className="s-dl2" d="M542 90 V104" markerEnd="url(#sgb)" /> <text className="s-tm" x="556" y="101" style={{ fill: "var(--warn)" }}>OrderCreated</text> <rect className="s-box" x="472" y="106" width="140" height="46" rx="7" /><text className="s-tb" x="484" y="130">Inventory</text><text className="s-tm" x="484" y="148">service</text> <path className="s-dl2" d="M542 152 V166" markerEnd="url(#sgb)" /> <text className="s-tm" x="556" y="163" style={{ fill: "var(--warn)" }}>StockReserved</text> <rect className="s-box" x="472" y="168" width="140" height="46" rx="7" /><text className="s-tb" x="484" y="192">Payment</text><text className="s-tm" x="484" y="210">service</text> <path className="s-dl2" d="M542 214 V228" markerEnd="url(#sgb)" /> <text className="s-tm" x="556" y="225" style={{ fill: "var(--warn)" }}>PaymentDone</text> <rect className="s-box" x="472" y="230" width="140" height="46" rx="7" /><text className="s-tb" x="484" y="254">Shipping</text><text className="s-tm" x="484" y="272">service</text> <text className="s-tm" x="700" y="90">each service listens</text> <text className="s-tm" x="700" y="108">to the previous step's event</text> <text className="s-tm" x="700" y="126">then does its own part</text> <text className="s-tm" x="700" y="190">no center,</text> <text className="s-tm" x="700" y="208">hard to see the big picture</text> </svg>
            </div>
            <figcaption>Two ways to implement a Saga. Orchestration suits multi-step processes that need clear tracking; choreography suits short chains with few services.</figcaption>
          </figure>
          <Code lang="ts">{`type Step = { name: string; run: () => Promise<void>; compensate: () => Promise<void> };

async function runSaga(steps: Step[]) {
  const done: Step[] = [];
  try {
    for (const s of steps) { await s.run(); done.push(s); }
  } catch (err) {
    // Undo completed steps in reverse order
    for (const s of done.reverse()) await s.compensate();
    throw err;
  }
}

await runSaga([
  { name: "reserve stock", run: () => inventory.reserve(order), compensate: () => inventory.release(order) },
  { name: "charge",        run: () => payment.charge(order),    compensate: () => payment.refund(order) },
  { name: "ship",          run: () => shipping.create(order),   compensate: () => shipping.cancel(order) },
]);`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Any business process spanning several services that needs eventual consistency.</div>
            <div className="warnc"><span className="pl">Caveat</span>The sample is an in-memory orchestration; in practice the saga state must be stored in a DB to survive restarts, and every step must be idempotent.</div>
          </div>
        </section>
        <section id="ms-orch-choreo">
          <h2><span className="n">03</span>Orchestration vs Choreography <small className="vn">Conductor or dancers</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>A process runs across several services (hold stock, charge, ship). Who decides the next step, and who compensates when a step fails?</div>
            <div><span className="pl">Idea</span><b>Orchestration</b>: one orchestrator knows the whole process and commands each service. <b>Choreography</b>: no center; each service listens for the previous step's event, does its part and publishes a new event.</div>
          </div>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 512" role="img" aria-label="Orchestration sequence diagram: the orchestrator calls reserve, charge and createShipment; shipping fails, so the orchestrator calls refund then release"> <defs><marker id="orqa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="orqb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="orqc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="orqd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="orqe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-hl" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Orchestrator</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">holds state</text> <path d="M70.0 62 V498" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="253.33333333333337" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="323.33333333333337" y="35" textAnchor="middle">Inventory</text> <text className="s-tm" x="323.33333333333337" y="52" textAnchor="middle">service</text> <path d="M323.33333333333337 62 V498" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="506.66666666666674" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="576.6666666666667" y="35" textAnchor="middle">Payment</text> <text className="s-tm" x="576.6666666666667" y="52" textAnchor="middle">service</text> <path d="M576.6666666666667 62 V498" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Shipping</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">service</text> <path d="M830.0 62 V498" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H317.33333333333337" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#orqa)" /> <text className="s-tm" x="196.66666666666669" y="85" textAnchor="middle" style={{ fill: "var(--accent)" }}>1. reserve(items)</text> <path d="M319.33333333333337 126 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#orqb)" /> <text className="s-tm" x="196.66666666666669" y="119" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <path d="M74.0 160 H570.6666666666667" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#orqa)" /> <text className="s-tm" x="323.33333333333337" y="153" textAnchor="middle" style={{ fill: "var(--accent)" }}>2. charge(order)</text> <path d="M572.6666666666667 194 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#orqb)" /> <text className="s-tm" x="323.33333333333337" y="187" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <path d="M74.0 228 H824.0" style={{ stroke: "var(--accent)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#orqa)" /> <text className="s-tm" x="450.0" y="221" textAnchor="middle" style={{ fill: "var(--accent)" }}>3. createShipment(order)</text> <path d="M826.0 262 H76.0" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#orqc)" /> <text className="s-tm" x="450.0" y="255" textAnchor="middle" style={{ fill: "var(--bad)" }}>error: no couriers</text> <text className="s-tm" x="10.0" y="296" style={{ fill: "var(--warn)", fontWeight: "600" }}>Compensate in reverse order</text> <path d="M74.0 334 H570.6666666666667" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none", strokeDasharray: "6 3" }} markerEnd="url(#orqd)" /> <text className="s-tm" x="323.33333333333337" y="327" textAnchor="middle" style={{ fill: "var(--warn)" }}>4. refund(order)</text> <path d="M572.6666666666667 368 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#orqb)" /> <text className="s-tm" x="323.33333333333337" y="361" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <path d="M74.0 402 H317.33333333333337" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none", strokeDasharray: "6 3" }} markerEnd="url(#orqd)" /> <text className="s-tm" x="196.66666666666669" y="395" textAnchor="middle" style={{ fill: "var(--warn)" }}>5. release(items)</text> <path d="M319.33333333333337 436 H76.0" style={{ stroke: "var(--muted)", strokeWidth: "1.8", fill: "none", strokeDasharray: "5 4" }} markerEnd="url(#orqb)" /> <text className="s-tm" x="196.66666666666669" y="429" textAnchor="middle" style={{ fill: "var(--muted)" }}>ok</text> <text className="s-tm" x="10.0" y="470" style={{ fill: "var(--accent)", fontWeight: "600" }}>Order → CANCELLED, stored in the orchestrator's DB</text> </svg>
            </div>
            <figcaption>Orchestration: every command and every compensation comes from the orchestrator, so one place tells you which step an order is at.</figcaption>
          </figure>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 424" role="img" aria-label="Choreography sequence diagram: Order publishes OrderCreated, Inventory listens and publishes StockReserved, Payment listens and publishes PaymentFailed, Inventory and Order compensate themselves"> <defs><marker id="chqa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="chqb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker><marker id="chqc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" /></marker><marker id="chqd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker><marker id="chqe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--new)" /></marker></defs> <rect className="s-box" x="0.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="70.0" y="35" textAnchor="middle">Order</text> <text className="s-tm" x="70.0" y="52" textAnchor="middle">service</text> <path d="M70.0 62 V410" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-disk" x="253.33333333333337" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="323.33333333333337" y="35" textAnchor="middle">Event bus</text> <text className="s-tm" x="323.33333333333337" y="52" textAnchor="middle">Kafka · NATS</text> <path d="M323.33333333333337 62 V410" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="506.66666666666674" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="576.6666666666667" y="35" textAnchor="middle">Inventory</text> <text className="s-tm" x="576.6666666666667" y="52" textAnchor="middle">service</text> <path d="M576.6666666666667 62 V410" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <rect className="s-box" x="760.0" y="14" width="140" height="48" rx="7" /> <text className="s-tb" x="830.0" y="35" textAnchor="middle">Payment</text> <text className="s-tm" x="830.0" y="52" textAnchor="middle">service</text> <path d="M830.0 62 V410" style={{ stroke: "var(--line)", strokeWidth: "1.5", strokeDasharray: "4 4" }} /> <path d="M74.0 92 H317.33333333333337" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqe)" /> <text className="s-tm" x="196.66666666666669" y="85" textAnchor="middle" style={{ fill: "var(--new)" }}>publish OrderCreated</text> <path d="M327.33333333333337 126 H570.6666666666667" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqe)" /> <text className="s-tm" x="450.00000000000006" y="119" textAnchor="middle" style={{ fill: "var(--new)" }}>OrderCreated</text> <path d="M572.6666666666667 160 H329.33333333333337" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqe)" /> <text className="s-tm" x="450.00000000000006" y="153" textAnchor="middle" style={{ fill: "var(--new)" }}>publish StockReserved</text> <path d="M327.33333333333337 194 H824.0" style={{ stroke: "var(--new)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqe)" /> <text className="s-tm" x="576.6666666666667" y="187" textAnchor="middle" style={{ fill: "var(--new)" }}>StockReserved</text> <path d="M826.0 228 H329.33333333333337" style={{ stroke: "var(--bad)", strokeWidth: "1.8", fill: "none" }} markerEnd="url(#chqc)" /> <text className="s-tm" x="576.6666666666667" y="221" textAnchor="middle" style={{ fill: "var(--bad)" }}>publish PaymentFailed</text> <text className="s-tm" x="10.0" y="262" style={{ fill: "var(--warn)", fontWeight: "600" }}>Whoever cares about PaymentFailed compensates itself</text> <path d="M327.33333333333337 300 H570.6666666666667" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none", strokeDasharray: "6 3" }} markerEnd="url(#chqd)" /> <text className="s-tm" x="450.00000000000006" y="293" textAnchor="middle" style={{ fill: "var(--warn)" }}>PaymentFailed → release stock</text> <path d="M319.33333333333337 334 H76.0" style={{ stroke: "var(--warn)", strokeWidth: "1.8", fill: "none", strokeDasharray: "6 3" }} markerEnd="url(#chqd)" /> <text className="s-tm" x="196.66666666666669" y="327" textAnchor="middle" style={{ fill: "var(--warn)" }}>PaymentFailed → order CANCELLED</text> <text className="s-tm" x="10.0" y="368" style={{ fill: "var(--accent)", fontWeight: "600" }}>Nobody holds shared state; reconstruct it from logs and tracing</text> </svg>
            </div>
            <figcaption>Choreography: services only talk to the event bus. The next step happens because someone is listening for an event, not because anyone gave an order.</figcaption>
          </figure>
          <Code lang="ts">{`// Choreography: each service only reacts to events (Kafka / NATS / RabbitMQ)
inventory.on("OrderCreated", async e => {
  await reserve(e.items);
  await publish("StockReserved", { orderId: e.orderId, items: e.items });
});

payment.on("StockReserved", async e => {
  try {
    await charge(e.orderId);
    await publish("PaymentDone", { orderId: e.orderId });
  } catch {
    await publish("PaymentFailed", { orderId: e.orderId, items: e.items });
  }
});

// Compensation is also just another listener
inventory.on("PaymentFailed", e => release(e.items));
orders.on("PaymentFailed", e => markCancelled(e.orderId));`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Orchestration</th>
                  <th>Choreography</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Who knows the whole process</b></td>
                  <td>Orchestrator</td>
                  <td>Nobody; the logic is scattered</td>
                </tr>
                <tr>
                  <td><b>Communication</b></td>
                  <td>Commands (gRPC, REST, command messages)</td>
                  <td>Events over an event bus</td>
                </tr>
                <tr>
                  <td><b>Coupling</b></td>
                  <td>The orchestrator depends on every service</td>
                  <td>Loose; depends only on the event format</td>
                </tr>
                <tr>
                  <td><b>Tracking, debugging</b></td>
                  <td>Easy; state lives in one place</td>
                  <td>Hard; needs distributed tracing</td>
                </tr>
                <tr>
                  <td><b>Compensating on failure</b></td>
                  <td>Centralized, in exact reverse order</td>
                  <td>Each service listens for failure events itself</td>
                </tr>
                <tr>
                  <td><b>Adding a step</b></td>
                  <td>Change the orchestrator</td>
                  <td>Add a listener; change nobody</td>
                </tr>
                <tr>
                  <td><b>Risks</b></td>
                  <td>The orchestrator becomes a “god service”</td>
                  <td>A tangled event web, hidden loops</td>
                </tr>
                <tr>
                  <td><b>Tools</b></td>
                  <td>Temporal, Camunda/Zeebe, AWS Step Functions</td>
                  <td>Kafka, RabbitMQ, NATS</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pp">
            <div><span className="pl">When to use</span>Orchestration for long, branching processes where you need to know where an order is (checkout, loan approval). Choreography for short chains or when many parties care about one event (OrderPaid → email, analytics, loyalty points).</div>
            <div className="warnc"><span className="pl">Caveat</span>In practice they are often combined: orchestration for the main flow that needs control, events for side work. Either way, every step must be idempotent and publish events through an Outbox.</div>
          </div>
        </section>
        <section id="ms-outbox">
          <h2><span className="n">04</span>Transactional Outbox <small className="vn">Outbox</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Save the order to the DB, then publish an event to Kafka: if the DB write succeeds and the publish fails (or the reverse), the two disagree. This is the <b>dual write</b> problem.</div>
            <div><span className="pl">Idea</span>Write the event to an <code>outbox</code> table <b>in the same transaction</b> as the business data. A separate process reads the outbox and publishes to the broker.</div>
          </div>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 246" role="img" aria-label="Transactional outbox: the service writes the orders and outbox tables in one transaction, a relay reads the outbox and publishes to Kafka, and the consumer is idempotent"> <defs><marker id="oba" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <rect className="s-box" x="16" y="96" width="128" height="56" rx="7" /><text className="s-tb" x="28" y="120">Order svc</text><text className="s-tm" x="28" y="138">placeOrder()</text> <rect className="s-bg" x="186" y="30" width="250" height="186" rx="10" style={{ strokeDasharray: "5 4" }} /> <text className="s-lane" x="200" y="52">1 DB TRANSACTION</text> <rect className="s-box" x="204" y="66" width="214" height="52" rx="7" /><text className="s-tb" x="216" y="90">orders</text><text className="s-tm" x="216" y="108">INSERT order</text> <rect className="s-disk" x="204" y="134" width="214" height="52" rx="7" /><text className="s-tb" x="216" y="158">outbox</text><text className="s-tm" x="216" y="176">INSERT event</text> <path className="s-ln" d="M144 124 H184" markerEnd="url(#oba)" /> <rect className="s-hl" x="482" y="134" width="134" height="52" rx="7" /><text className="s-tb" x="494" y="158">Relay / CDC</text><text className="s-tm" x="494" y="176">read unsent rows</text> <path className="s-ln" d="M418 160 H480" markerEnd="url(#oba)" /> <rect className="s-box" x="660" y="134" width="104" height="52" rx="7" /><text className="s-tb" x="672" y="158">Kafka</text><text className="s-tm" x="672" y="176">broker</text> <path className="s-ln" d="M616 160 H658" markerEnd="url(#oba)" /> <rect className="s-box" x="800" y="134" width="90" height="52" rx="7" /><text className="s-tb" x="812" y="158">Consumer</text><text className="s-tm" x="812" y="176">idempotent</text> <path className="s-ln" d="M764 160 H798" markerEnd="url(#oba)" /> <text className="s-tm" x="482" y="214">2 publish, then set sent_at</text> <text className="s-tm" x="482" y="232">may send duplicates → consumer dedupes</text> </svg>
            </div>
            <figcaption>The DB write and the event write succeed or fail together. Sending to the broker is a separate later step, with retries.</figcaption>
          </figure>
          <Code lang="ts">{`// 1. Business write and event write share one DB transaction
await db.transaction(async tx => {
  await tx.insert("orders", order);
  await tx.insert("outbox", {
    id: crypto.randomUUID(),
    topic: "orders.created",
    payload: JSON.stringify(order),
    created_at: new Date(),
  });
});

// 2. A relay process publishes pending rows, then marks them as sent
async function relay() {
  const rows = await db.query("SELECT * FROM outbox WHERE sent_at IS NULL ORDER BY created_at LIMIT 100");
  for (const r of rows) {
    await producer.send({ topic: r.topic, messages: [{ key: r.id, value: r.payload }] });
    await db.query("UPDATE outbox SET sent_at = now() WHERE id = $1", [r.id]);
  }
}
setInterval(relay, 1000);`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Whenever you update the DB and must also send an event.</div>
            <div className="warnc"><span className="pl">Caveat</span>The relay may send duplicates if it dies between publish and update, so receivers need an Idempotent Consumer. Instead of polling you can use CDC (Debezium reading the DB's WAL).</div>
          </div>
        </section>
        <section id="ms-idempotent-consumer">
          <h2><span className="n">05</span>Idempotent Consumer <small className="vn">Duplicate-safe consumer</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Kafka, RabbitMQ and JetStream can all deliver a message more than once (at-least-once). Processing it twice charges the customer twice.</div>
            <div><span className="pl">Idea</span>Record the ids of processed messages in the same transaction as the business change; skip ids already seen.</div>
          </div>
          <Code lang="ts">{`async function handle(msg: { id: string; customerId: string; orderId: string; amount: number }) {
  await db.transaction(async tx => {
    // Unique constraint on processed_messages.id rejects duplicates
    const inserted = await tx.query(
      "INSERT INTO processed_messages(id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id",
      [msg.id],
    );
    if (inserted.rowCount === 0) return; // already handled

    // Pay the order from the customer's wallet
    await tx.query("UPDATE wallets SET balance = balance - $1 WHERE customer_id = $2",
      [msg.amount, msg.customerId]);
    await tx.query("UPDATE orders SET status = 'paid' WHERE id = $1", [msg.orderId]);
  });
}`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Every consumer with side effects (DB writes, charges, emails).</div>
            <div className="warnc"><span className="pl">Caveat</span>The processed-id table needs periodic cleanup. Naturally idempotent operations (overwriting a value) don't need it.</div>
          </div>
        </section>
        <section id="ms-cqrs">
          <h2><span className="n">06</span>CQRS <small className="vn">Separate writes and reads</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>A data model optimized for writes (normalized, many constraints) is slow for read screens that JOIN many tables or services.</div>
            <div><span className="pl">Idea</span>Split <b>commands</b> (writes) and <b>queries</b> (reads) into two models. The write side emits events; the read side listens and updates a view optimized for queries.</div>
          </div>
          <Code lang="ts">{`// Write side: validates and emits events
async function placeOrder(cmd: PlaceOrder) {
  const order = Order.create(cmd);          // business rules
  await orderRepo.save(order);
  await outbox.add("orders.placed", order.toEvent());
}

// Read side: a projection kept up to date from events
consumer.on("orders.placed", async e => {
  await readDb.collection("order_summaries").updateOne(
    { customerId: e.customerId },
    { $inc: { orderCount: 1, totalSpent: e.total }, $set: { lastOrderAt: e.at } },
    { upsert: true },
  );
});

// Queries hit the denormalized view directly
const summary = await readDb.collection("order_summaries").findOne({ customerId: "7" });`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Very different read and write loads, complex read screens, together with Event Sourcing.</div>
            <div className="warnc"><span className="pl">Caveat</span>The read view lags the write side slightly (eventual consistency). Don't apply it to simple CRUD.</div>
          </div>
        </section>
        <section id="ms-event-sourcing">
          <h2><span className="n">07</span>Event Sourcing <small className="vn">Store the event log</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Storing only the current state loses history: you cannot tell how much of a payment was held, captured or refunded, or when; reconciliation and rebuilding are hard.</div>
            <div><span className="pl">Idea</span>Store <b>every event</b> that happened, in order (append only, never update). The current state is the “fold” of all events.</div>
          </div>
          <Code lang="ts">{`type PaymentEvent =
  | { type: "Authorized"; orderId: string; amount: number }   // money held on the card
  | { type: "Captured"; amount: number }                      // money actually taken
  | { type: "Refunded"; amount: number };

function rebuild(events: PaymentEvent[]) {
  // Fold events into current state
  return events.reduce((p, e) => {
    switch (e.type) {
      case "Authorized": return { orderId: e.orderId, authorized: e.amount, captured: 0, refunded: 0 };
      case "Captured":   return { ...p, captured: p.captured + e.amount };
      case "Refunded":   return { ...p, refunded: p.refunded + e.amount };
    }
  }, { orderId: "", authorized: 0, captured: 0, refunded: 0 });
}

const history: PaymentEvent[] = await eventStore.load("payment-42");
const state = rebuild(history);
// { orderId: "42", authorized: 1_200_000, captured: 1_200_000, refunded: 200_000 }`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Payments, wallets, reconciliation, auditing, systems that need “time travel”. Kafka with infinite retention or JetStream often serves as the event store.</div>
            <div className="warnc"><span className="pl">Caveat</span>Complex: long streams need snapshots, changing old event shapes is very hard, and queries go through CQRS.</div>
          </div>
        </section>
        <section id="ms-circuit-breaker">
          <h2><span className="n">08</span>Circuit Breaker <small className="vn">Circuit breaker</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Service B is slow or down; service A keeps calling, each call waits for a timeout, threads run out and A dies too. A cascading failure.</div>
            <div><span className="pl">Idea</span>Count failures; past a threshold, “trip the breaker” and fail immediately without calling B. After a while let a few calls through; if they succeed, close it again.</div>
          </div>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 296" role="img" aria-label="Three-state circuit breaker: closed goes to open when failures pass the threshold, open goes to half-open when the wait is over, half-open returns to closed if the trial succeeds or to open if it fails"> <defs><marker id="cba" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <circle className="s-hl" cx="150" cy="120" r="62" /> <text className="s-tb" x="150" y="118" textAnchor="middle">Closed</text> <text className="s-tm" x="150" y="138" textAnchor="middle">calls pass through</text> <circle className="s-bad2" cx="450" cy="120" r="62" /> <text className="s-tb" x="450" y="118" textAnchor="middle">Open</text> <text className="s-tm" x="450" y="138" textAnchor="middle">fail immediately</text> <circle className="s-disk" cx="750" cy="120" r="62" /> <text className="s-tb" x="750" y="118" textAnchor="middle">Half-open</text> <text className="s-tm" x="750" y="138" textAnchor="middle">try a few calls</text> <path className="s-ln" d="M200 84 C280 40 320 40 400 84" markerEnd="url(#cba)" /> <text className="s-tm" x="300" y="40" textAnchor="middle">failures ≥ threshold</text> <path className="s-ln" d="M500 84 C580 40 620 40 700 84" markerEnd="url(#cba)" /> <text className="s-tm" x="600" y="40" textAnchor="middle">wait time over</text> <path className="s-ln" d="M700 158 C600 200 560 200 500 158" markerEnd="url(#cba)" /> <text className="s-tm" x="600" y="214" textAnchor="middle">trial fails</text> <path className="s-ln" d="M730 182 C640 290 260 290 170 182" markerEnd="url(#cba)" /> <text className="s-tm" x="450" y="284" textAnchor="middle">trial succeeds → close the breaker</text> </svg>
            </div>
            <figcaption>Like an electrical breaker: it trips under overload to protect the rest, then tries to close again after a while.</figcaption>
          </figure>
          <Code lang="ts">{`type State = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: State = "closed";
  private failures = 0;
  private openedAt = 0;
  constructor(private threshold = 5, private resetMs = 10_000) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.resetMs) throw new Error("Circuit open");
      this.state = "half-open"; // allow a trial call
    }
    try {
      const result = await fn();
      this.state = "closed";
      this.failures = 0;
      return result;
    } catch (err) {
      this.failures++;
      if (this.state === "half-open" || this.failures >= this.threshold) {
        this.state = "open";
        this.openedAt = Date.now();
      }
      throw err;
    }
  }
}

const breaker = new CircuitBreaker();
const price = await breaker.call(() => pricingClient.getPrice("SKU-1"));`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Every synchronous call to another service or an external API.</div>
            <div className="warnc"><span className="pl">Caveat</span>Combine with timeouts and fallbacks (cached values, a friendly message). Ready-made library: opossum (Node.js); a service mesh can do it too.</div>
          </div>
        </section>
        <section id="ms-retry">
          <h2><span className="n">09</span>Retry + Backoff + Jitter <small className="vn">Retry with spacing</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Transient errors (flaky network, 503) may clear by themselves, but retrying immediately at the same rhythm overloads a struggling server even more.</div>
            <div><span className="pl">Idea</span>Retry with exponentially growing delays plus randomness (jitter) so clients don't retry at the same moment.</div>
          </div>
          <Code lang="ts">{`async function retry<T>(fn: () => Promise<T>, attempts = 5, baseMs = 200): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts - 1 || !isTransient(err)) throw err;
      // Full jitter: random delay between 0 and base * 2^i
      const delay = Math.random() * baseMs * 2 ** i;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

const isTransient = (e: any) => [502, 503, 504].includes(e.status) || e.code === "ECONNRESET";`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Transient network, broker and database errors.</div>
            <div className="warnc"><span className="pl">Caveat</span>Only retry idempotent operations (or ones with an Idempotency-Key). Retries stacked across layers multiply requests very quickly.</div>
          </div>
        </section>
        <section id="ms-bulkhead">
          <h2><span className="n">10</span>Bulkhead <small className="vn">Bulkhead</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>One slow dependency eats the whole connection pool or worker set, dragging down unrelated features.</div>
            <div><span className="pl">Idea</span>Split resources into separate compartments per dependency, like the bulkheads that keep a ship from sinking.</div>
          </div>
          <Code lang="ts">{`// Limit concurrent calls per dependency
function limiter(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    if (active >= max) await new Promise<void>(r => queue.push(r));
    active++;
    try { return await fn(); }
    finally { active--; queue.shift()?.(); }
  };
}

const forPayment = limiter(20);
const forRecommendation = limiter(5); // slow, non-critical dependency gets a small share

await forRecommendation(() => recoClient.get(userId));`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>A service calling many dependencies of different importance.</div>
            <div className="warnc"><span className="pl">Caveat</span>Size compartments from measurements; too small and you choke yourself.</div>
          </div>
        </section>
        <section id="ms-strangler">
          <h2><span className="n">11</span>Strangler Fig <small className="vn">Replace the old system gradually</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Rewriting an entire monolith at once is too risky.</div>
            <div><span className="pl">Idea</span>Put a proxy/gateway in front and move routes to new services one by one; unmigrated routes still go to the old system until nothing is left in it.</div>
          </div>
          <Code lang="ts">{`// API gateway routing table during migration
const routes: { prefix: string; target: string }[] = [
  { prefix: "/api/orders",   target: "http://order-service" },   // migrated
  { prefix: "/api/payments", target: "http://payment-service" }, // migrated
  { prefix: "/",             target: "http://legacy-monolith" }, // everything else
];

const pickTarget = (path: string) => routes.find(r => path.startsWith(r.prefix))!.target;`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Modernizing legacy systems, breaking a monolith into microservices.</div>
            <div className="warnc"><span className="pl">Caveat</span>Data shared between old and new is the hardest part; plan how to keep it in sync.</div>
          </div>
        </section>
        <section id="ms-sidecar">
          <h2><span className="n">12</span>Sidecar / Service Mesh <small className="vn">Helper alongside</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Every service needs TLS, retries, metrics and tracing; rewriting them per language is costly and inconsistent.</div>
            <div><span className="pl">Idea</span>Run a helper process (a sidecar, usually Envoy) next to each service to handle networking. The set of sidecars is a service mesh (Istio, Linkerd).</div>
          </div>
          <div className="pp">
            <div><span className="pl">When to use</span>Many services in many languages that need mTLS and uniform observability.</div>
            <div className="warnc"><span className="pl">Caveat</span>Adds latency and operational complexity; small systems don't need it yet.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
