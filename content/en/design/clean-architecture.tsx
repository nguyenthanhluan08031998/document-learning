import { Code } from "@/components/Code";

export default function CleanArchitecturePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Clean Architecture contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ca-layers"><span>01</span>The four rings</a></li>
          <li><a href="#ca-rule"><span>02</span>Dependency Rule</a></li>
          <li><a href="#ca-flow"><span>03</span>Flow of a request</a></li>
          <li><a href="#ca-code"><span>04</span>TypeScript example</a></li>
          <li><a href="#ca-folder"><span>05</span>Folder structure</a></li>
          <li><a href="#ca-family"><span>06</span>{"Hexagonal & Onion"}</a></li>
          <li><a href="#ca-when"><span>07</span>When to use, common mistakes</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">clean architecture · study notes</div>
          <h1>Clean Architecture: business at the center, frameworks at the edge</h1>
          <p className="lede">An architecture summarized by Robert C. Martin (Uncle Bob). The core idea: business code must know nothing about the database, web framework or message broker. You can then swap Postgres for MongoDB, Express for NestJS, REST for gRPC without touching the logic, and test the business rules without starting anything.</p>
          <div className="tape" aria-hidden="true">
            <div>frameworks</div>
            <div>adapters</div>
            <div>use cases</div>
            <div className="hw">entities</div>
          </div>
        </header>
        <section id="ca-layers">
          <h2><span className="n">01</span>The four rings</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Four concentric rings: Entities at the center, then Use Cases, Interface Adapters, and Frameworks and Drivers outermost; dependency arrows point to the center"> <defs><marker id="cra" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <circle cx="250" cy="214" r="196" style={{ fill: "var(--code-bg)", stroke: "var(--muted)", strokeWidth: "1.5" }} /> <circle cx="250" cy="214" r="148" style={{ fill: "var(--new-soft)", stroke: "var(--new)", strokeWidth: "1.5" }} /> <circle cx="250" cy="214" r="100" style={{ fill: "var(--warn-soft)", stroke: "var(--warn)", strokeWidth: "1.5" }} /> <circle cx="250" cy="214" r="52" style={{ fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: "1.5" }} /> <text className="s-tb" x="250" y="40" textAnchor="middle" style={{ fontSize: "13px", fill: "var(--muted)" }}>{"Frameworks & Drivers"}</text> <text className="s-tb" x="250" y="88" textAnchor="middle" style={{ fontSize: "13px", fill: "var(--new)" }}>Interface Adapters</text> <text className="s-tb" x="250" y="136" textAnchor="middle" style={{ fontSize: "13px", fill: "var(--warn)" }}>Use Cases</text> <text className="s-tb" x="250" y="218" textAnchor="middle" style={{ fontSize: "13px", fill: "var(--accent)" }}>Entities</text> <path className="s-ln" d="M80 120 L150 160" markerEnd="url(#cra)" /> <path className="s-ln" d="M420 120 L350 160" markerEnd="url(#cra)" /> <path className="s-ln" d="M80 310 L150 270" markerEnd="url(#cra)" /> <path className="s-ln" d="M420 310 L350 270" markerEnd="url(#cra)" /> <circle cx="500" cy="70" r="7" style={{ fill: "var(--accent)" }} /> <text className="s-tb" x="516" y="75">Entities</text> <text className="s-tm" x="516" y="94">Order, Money, business rules</text> <circle cx="500" cy="136" r="7" style={{ fill: "var(--warn)" }} /> <text className="s-tb" x="516" y="141">Use Cases</text> <text className="s-tm" x="516" y="160">PlaceOrder, port OrderRepository</text> <circle cx="500" cy="202" r="7" style={{ fill: "var(--new)" }} /> <text className="s-tb" x="516" y="207">Interface Adapters</text> <text className="s-tm" x="516" y="226">Controller, PostgresOrderRepository</text> <circle cx="500" cy="268" r="7" style={{ fill: "var(--muted)" }} /> <text className="s-tb" x="516" y="273">{"Frameworks & Drivers"}</text> <text className="s-tm" x="516" y="292">Express, Prisma, KafkaJS, gRPC</text> <text className="s-tm" x="500" y="350" style={{ fill: "var(--accent)" }}>→ arrows: dependencies point inward only</text> </svg>
            </div>
            <figcaption>The further in, the more stable and abstract; the further out, the more concrete and easier to replace.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Ring</th>
                  <th>Contains</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Entities</b></td>
                  <td>Core business rules, true for every application of the business</td>
                  <td><code>Order</code> computes its own total and refuses new items once paid</td>
                </tr>
                <tr>
                  <td><b>Use Cases</b></td>
                  <td>Application workflows that coordinate entities and define the <b>ports</b> (interfaces) they need</td>
                  <td><code>PlaceOrder</code>, <code>CancelOrder</code>, interface <code>OrderRepository</code></td>
                </tr>
                <tr>
                  <td><b>Interface Adapters</b></td>
                  <td>Convert data between the use cases' format and the outside world's</td>
                  <td>Controller, presenter, <code>PostgresOrderRepository</code>, Kafka publisher</td>
                </tr>
                <tr>
                  <td><b>{"Frameworks & Drivers"}</b></td>
                  <td>Concrete tools, outermost, easiest to replace</td>
                  <td>Express, NestJS, Prisma, pg driver, KafkaJS, gRPC server</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="ca-rule">
          <h2><span className="n">02</span>Dependency Rule</h2>
          <p><b>Source code dependencies point inward only.</b> Inner rings never import or name anything from outer rings: no <code>import express</code>, no Prisma types, no ORM annotations.</p>
          <p>Yet at runtime a use case still has to reach the database in the outer ring. The answer is <b>Dependency Inversion</b>: the use case defines an interface (port), the outer ring implements it (adapter), and a single place called the <b>composition root</b> wires them together.</p>
          <div className="note tip"><b>Data crossing boundaries</b> should be plain objects (DTOs); never pass an Express request or an ORM row into a use case.</div>
        </section>
        <section id="ca-flow">
          <h2><span className="n">03</span>Flow of a request</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 270" role="img" aria-label="The controller calls the PlaceOrder use case; the use case uses the Order entity and the OrderRepository port; PostgresOrderRepo implements the port"> <defs><marker id="cfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="cfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker></defs> <rect className="s-box" x="16" y="118" width="160" height="56" rx="7" /><text className="s-tb" x="28" y="142">OrderController</text><text className="s-tm" x="28" y="160">Express · adapter</text> <rect className="s-hl" x="236" y="118" width="160" height="56" rx="7" /><text className="s-tb" x="248" y="142">PlaceOrder</text><text className="s-tm" x="248" y="160">use case</text> <rect className="s-disk" x="470" y="40" width="180" height="56" rx="7" /><text className="s-tb" x="482" y="64">OrderRepository</text><text className="s-tm" x="482" y="82">«interface» · port</text> <rect className="s-hl" x="470" y="196" width="180" height="56" rx="7" /><text className="s-tb" x="482" y="220">Order</text><text className="s-tm" x="482" y="238">entity</text> <rect className="s-box" x="712" y="40" width="176" height="56" rx="7" /><text className="s-tb" x="724" y="64">PostgresOrderRepo</text><text className="s-tm" x="724" y="82">adapter · pg</text> <path className="s-ln" d="M176 146 H234" markerEnd="url(#cfa)" /> <text className="s-tm" x="182" y="138">calls</text> <path className="s-ln" d="M396 136 C430 136 430 68 468 68" markerEnd="url(#cfa)" /> <path className="s-ln" d="M396 156 C430 156 430 224 468 224" markerEnd="url(#cfa)" /> <path className="s-dl2" d="M712 68 H652" markerEnd="url(#cfb)" /> <text className="s-tm" x="640" y="112" style={{ fill: "var(--warn)" }}>implements ←</text> <text className="s-tm" x="470" y="130">at runtime: the use case calls the port,</text> <text className="s-tm" x="470" y="148">which actually runs Postgres code</text> <text className="s-tm" x="712" y="136" style={{ fill: "var(--warn)" }}>trong code: adapter</text> <text className="s-tm" x="712" y="154" style={{ fill: "var(--warn)" }}>depends on the interface</text> </svg>
            </div>
            <figcaption>Calls flow outward (teal), but source dependencies always point inward (orange): Postgres knows the interface, the interface does not know Postgres.</figcaption>
          </figure>
          <ol className="steps">
            <li>
              <div><b>Controller</b> (adapter)<div className="d">Receives the HTTP request, reads and validates the format, converts it to an input DTO.</div></div>
            </li>
            <li>
              <div><b>Use case</b><div className="d">Runs the workflow: load entities through a port, apply entity rules, save through a port, publish events.</div></div>
            </li>
            <li>
              <div><b>Entity</b><div className="d">Protects its own business rules, for example no negative totals.</div></div>
            </li>
            <li>
              <div><b>Repository adapter</b><div className="d">Implements the port with Postgres; maps entities to rows and back.</div></div>
            </li>
            <li>
              <div><b>Return the result</b><div className="d">The use case returns an output DTO; the controller (or presenter) turns it into an HTTP response and status code.</div></div>
            </li>
          </ol>
        </section>
        <section id="ca-code">
          <h2><span className="n">04</span>TypeScript example</h2>
          <h3>Entity: pure business logic</h3>
          <Code lang="ts">{`// domain/order.ts — no imports from frameworks
export class Order {
  private constructor(
    readonly id: string,
    readonly customerId: string,
    private items: { sku: string; price: number; qty: number }[],
    private status: "pending" | "paid" = "pending",
  ) {}

  static create(id: string, customerId: string) { return new Order(id, customerId, []); }

  addItem(sku: string, price: number, qty: number) {
    if (this.status !== "pending") throw new Error("Order already paid");
    if (qty <= 0) throw new Error("Quantity must be positive");
    this.items.push({ sku, price, qty });
  }

  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); }
  markPaid() { this.status = "paid"; }
}`}</Code>
          <h3>Use case and ports</h3>
          <Code lang="ts">{`// application/ports.ts — interfaces owned by the inner layer
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}
export interface EventPublisher { publish(topic: string, payload: object): Promise<void>; }
export interface IdGenerator { next(): string; }

// application/place-order.ts
export type PlaceOrderInput = { customerId: string; items: { sku: string; price: number; qty: number }[] };
export type PlaceOrderOutput = { orderId: string; total: number };

export class PlaceOrder {
  constructor(
    private orders: OrderRepository,
    private events: EventPublisher,
    private ids: IdGenerator,
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const order = Order.create(this.ids.next(), input.customerId);
    for (const i of input.items) order.addItem(i.sku, i.price, i.qty);
    await this.orders.save(order);
    await this.events.publish("orders.placed", { id: order.id, total: order.total() });
    return { orderId: order.id, total: order.total() };
  }
}`}</Code>
          <h3>Adapter: implementing a port</h3>
          <Code lang="ts">{`// infrastructure/postgres-order-repository.ts
import { Pool } from "pg";

export class PostgresOrderRepository implements OrderRepository {
  constructor(private pool: Pool) {}
  async save(order: Order) {
    await this.pool.query(
      "INSERT INTO orders(id, customer_id, total) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET total = $3",
      [order.id, order.customerId, order.total()],
    );
  }
  async findById(id: string) { /* map row -> Order */ return null; }
}

// interface/http/order-controller.ts
import type { Request, Response } from "express";

export const placeOrderHandler = (useCase: PlaceOrder) => async (req: Request, res: Response) => {
  try {
    const out = await useCase.execute({ customerId: req.body.customerId, items: req.body.items });
    res.status(201).location(\`/orders/\${out.orderId}\`).json(out);
  } catch (e) {
    res.status(422).json({ title: "Invalid order", detail: (e as Error).message });
  }
};`}</Code>
          <h3>Composition root: wire everything once</h3>
          <Code lang="ts">{`// main.ts — the only file that knows every concrete class
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const placeOrder = new PlaceOrder(
  new PostgresOrderRepository(pool),
  new KafkaEventPublisher(kafkaProducer),
  { next: () => crypto.randomUUID() },
);

const app = express().use(express.json());
app.post("/orders", placeOrderHandler(placeOrder));
app.listen(3000);`}</Code>
          <h3>Testing a use case without a database</h3>
          <Code lang="ts">{`// In-memory fakes implement the same ports
class InMemoryOrders implements OrderRepository {
  data = new Map<string, Order>();
  async save(o: Order) { this.data.set(o.id, o); }
  async findById(id: string) { return this.data.get(id) ?? null; }
}

test("places an order and publishes an event", async () => {
  const orders = new InMemoryOrders();
  const published: object[] = [];
  const useCase = new PlaceOrder(orders, { publish: async (_t, p) => { published.push(p); } }, { next: () => "o-1" });

  const out = await useCase.execute({ customerId: "c-7", items: [{ sku: "A", price: 50_000, qty: 2 }] });

  expect(out).toEqual({ orderId: "o-1", total: 100_000 });
  expect(published).toHaveLength(1);
});`}</Code>
        </section>
        <section id="ca-folder">
          <h2><span className="n">05</span>Suggested folder structure</h2>
          <Code lang="text">{`src/
  domain/              # Entities, value objects, domain errors — no dependencies
    order.ts
  application/         # Use cases + ports (interfaces) — depends on domain only
    ports.ts
    place-order.ts
    cancel-order.ts
  infrastructure/      # Adapters to the outside world — implements ports
    postgres-order-repository.ts
    kafka-event-publisher.ts
  interface/           # Delivery mechanisms
    http/order-controller.ts
    grpc/order-service.ts
  main.ts              # Composition root`}</Code>
          <p>Tools such as <code>dependency-cruiser</code> or ESLint rules can stop <code>domain/</code> importing from <code>infrastructure/</code>, turning the Dependency Rule into an automated check.</p>
          <p>In large systems many teams split folders <b>by feature first</b> (<code>orders/</code>, <code>payments/</code>), then by layer inside each feature.</p>
        </section>
        <section id="ca-family">
          <h2><span className="n">06</span>{"Hexagonal & Onion: the same family"}</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Architecture</th>
                  <th>Author</th>
                  <th>Terminology</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Hexagonal</b>{" (Ports & Adapters)"}</td>
                  <td>Alistair Cockburn, 2005</td>
                  <td>The application core in the middle, each side a <b>port</b>; <b>driving adapters</b> (HTTP, CLI, consumers) call in, <b>driven adapters</b> (DB, broker) are called out.</td>
                </tr>
                <tr>
                  <td><b>Onion</b></td>
                  <td>Jeffrey Palermo, 2008</td>
                  <td>Domain model at the center, then domain services, application services, and infrastructure outside.</td>
                </tr>
                <tr>
                  <td><b>Clean</b></td>
                  <td>Robert C. Martin, 2012</td>
                  <td>Combines the above into four rings and the Dependency Rule.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>All three share one idea: <b>business at the center, dependencies pointing inward, infrastructure as a replaceable detail</b>. They differ mainly in naming and the number of layers.</p>
          <div className="note tip"><b>How it relates to the rest of the notebook:</b> a KafkaJS producer, an Express route, a gRPC server, a RabbitMQ consumer are all adapters in the outer ring. The use case does not care whether events go through Kafka or NATS; it only knows the <code>EventPublisher</code> port.</div>
        </section>
        <section id="ca-when">
          <h2><span className="n">07</span>When to use, common mistakes</h2>
          <div className="cmp">
            <div>
              <h4>Use it when</h4>
              <ul className="plain">
                <li>The business logic is complex, long-lived and rule-heavy.</li>
                <li>You need fast business tests independent of infrastructure.</li>
                <li>You may swap the database or framework, or add channels (REST, gRPC, consumers).</li>
              </ul>
            </div>
            <div>
              <h4>Not yet needed when</h4>
              <ul className="plain">
                <li>Simple CRUD with little logic: three interface layers per table only slow you down.</li>
                <li>Prototypes, scripts, tiny services.</li>
                <li>The team is unfamiliar; a half-hearted version is worse than none.</li>
              </ul>
            </div>
          </div>
          <h3>Common mistakes</h3>
          <ul className="plain">
            <li>“Anemic” entities: only getters/setters, every rule lives in use cases or controllers.</li>
            <li>Framework leaking inward: entities carrying ORM decorators, use cases receiving an Express <code>Request</code>.</li>
            <li>An interface for everything, even things that never change. Ports are only needed where you touch the outside world.</li>
            <li>Use cases calling other use cases in nested chains; move shared logic down into entities or domain services.</li>
            <li>Mapping data through too many layers (DTO → command → entity → row → DTO) where no layer adds value.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
