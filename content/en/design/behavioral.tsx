import { Code } from "@/components/Code";

export default function BehavioralPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Behavioral: how objects cooperate contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#bh-chain"><span>01</span>Chain of Responsibility</a></li>
          <li><a href="#bh-command"><span>02</span>Command</a></li>
          <li><a href="#bh-iterator"><span>03</span>Iterator</a></li>
          <li><a href="#bh-mediator"><span>04</span>Mediator</a></li>
          <li><a href="#bh-memento"><span>05</span>Memento</a></li>
          <li><a href="#bh-observer"><span>06</span>Observer</a></li>
          <li><a href="#bh-state"><span>07</span>State</a></li>
          <li><a href="#bh-strategy"><span>08</span>Strategy</a></li>
          <li><a href="#bh-template-method"><span>09</span>Template Method</a></li>
          <li><a href="#bh-visitor"><span>10</span>Visitor</a></li>
          <li><a href="#bh-interpreter"><span>11</span>Interpreter</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design pattern · behavioral</div>
          <h1>Behavioral: how objects cooperate</h1>
          <p className="lede">Eleven patterns about splitting responsibility and communication between objects: who does what, and who tells whom.</p>
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
                  <td><a className="plink" href="#bh-chain">Chain of Responsibility</a></td>
                  <td>Processing chain</td>
                  <td>Line handlers up in a chain; each one handles the request and decides whether to pass it on or stop.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-command">Command</a></td>
                  <td>Request as an object</td>
                  <td>Turn each operation into an object holding everything needed to execute and undo it.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-iterator">Iterator</a></td>
                  <td>Step through items</td>
                  <td>Provide a standard way to get the next element. JavaScript has the iterator protocol and generators built in.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-mediator">Mediator</a></td>
                  <td>Central coordinator</td>
                  <td>Components talk only to a mediator; the mediator decides who needs to react.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-memento">Memento</a></td>
                  <td>Saved state</td>
                  <td>An object exports a read-only snapshot of its state and restores itself from it.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-observer">Observer</a></td>
                  <td>Subscriber list</td>
                  <td>An object keeps a list of subscribers and notifies them all when something happens.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-state">State</a></td>
                  <td>State object</td>
                  <td>Each state is an object that decides the behavior and the next state.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-strategy">Strategy</a></td>
                  <td>Swappable algorithm</td>
                  <td>Each algorithm is an object or function with the same interface; the caller receives one and calls it.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-template-method">Template Method</a></td>
                  <td>Fixed skeleton</td>
                  <td>The parent class defines a fixed sequence; subclasses implement specific steps.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-visitor">Visitor</a></td>
                  <td>Operation per type</td>
                  <td>Put each operation in a visitor with a function per element type. In TypeScript, a discriminated union with a switch achieves the same more simply.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-interpreter">Interpreter</a></td>
                  <td>Small language</td>
                  <td>Represent each grammar rule as an object with an <code>interpret</code> function, combined into a tree.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="bh-chain">
          <h2><span className="n">01</span>Chain of Responsibility <small className="vn">Processing chain</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>A request must pass several checks (authentication, authorization, validation), and any of them may stop it.</div>
            <div><span className="pl">Idea</span>Line handlers up in a chain; each one handles the request and decides whether to pass it on or stop.</div>
          </div>
          <Code lang="ts">{`type Ctx = { user?: User; body: unknown; };
type Handler = (ctx: Ctx, next: () => Promise<void>) => Promise<void>;

const authenticate: Handler = async (ctx, next) => {
  ctx.user = await verifyToken();
  if (!ctx.user) throw new HttpError(401);
  await next();
};
const authorize: Handler = async (ctx, next) => {
  if (!ctx.user!.roles.includes("admin")) throw new HttpError(403);
  await next();
};
const validate: Handler = async (ctx, next) => {
  if (!isValidOrder(ctx.body)) throw new HttpError(422);
  await next();
};

function chain(handlers: Handler[], final: (ctx: Ctx) => Promise<void>) {
  return (ctx: Ctx) => {
    const run = (i: number): Promise<void> =>
      i < handlers.length ? handlers[i](ctx, () => run(i + 1)) : final(ctx);
    return run(0);
  };
}

const createOrder = chain([authenticate, authorize, validate], async ctx => { /* save */ });`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>HTTP middleware (Express, Koa), event processing pipelines, multi-level order approval.</div>
            <div className="warnc"><span className="pl">Caveat</span>Long chains are hard to debug; a request may pass through the whole chain unhandled.</div>
          </div>
        </section>
        <section id="bh-command">
          <h2><span className="n">02</span>Command <small className="vn">Request as an object</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>You want to queue, log, undo or replay operations.</div>
            <div><span className="pl">Idea</span>Turn each operation into an object holding everything needed to execute and undo it.</div>
          </div>
          <Code lang="ts">{`interface Command { execute(): void; undo(): void; }

class AddItem implements Command {
  constructor(private cart: string[], private item: string) {}
  execute() { this.cart.push(this.item); }
  undo() { this.cart.splice(this.cart.lastIndexOf(this.item), 1); }
}

class History {
  private done: Command[] = [];
  run(cmd: Command) { cmd.execute(); this.done.push(cmd); }
  undo() { this.done.pop()?.undo(); }
}

const cart: string[] = [];
const h = new History();
h.run(new AddItem(cart, "Pho"));
h.run(new AddItem(cart, "Tea"));
h.undo();            // cart = ["Pho"]`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Undo/redo, task queues, macros, recording operations. A RabbitMQ message carrying a command is a serialized Command too.</div>
            <div className="warnc"><span className="pl">Caveat</span>One class per operation makes the class count grow fast; for simple operations a function is enough.</div>
          </div>
        </section>
        <section id="bh-iterator">
          <h2><span className="n">03</span>Iterator <small className="vn">Step through items</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>You want to walk a collection (a tree, a paginated API list) without exposing its internal structure.</div>
            <div><span className="pl">Idea</span>Provide a standard way to get the next element. JavaScript has the iterator protocol and generators built in.</div>
          </div>
          <Code lang="ts">{`// Async generator: walk every page of a cursor-paginated REST API
async function* allOrders(api: Api) {
  let cursor: string | undefined;
  do {
    const page = await api.get("/orders", { after: cursor, size: 100 });
    yield* page.items;          // hand out items one by one
    cursor = page.nextCursor;
  } while (cursor);
}

for await (const order of allOrders(api)) {
  if (order.total > 1_000_000) console.log(order.id);
}`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Walking paginated data, reading large files line by line, traversing trees.</div>
            <div className="warnc"><span className="pl">Caveat</span>Already built into the language; you rarely write your own Iterator class.</div>
          </div>
        </section>
        <section id="bh-mediator">
          <h2><span className="n">04</span>Mediator <small className="vn">Central coordinator</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Many components call each other back and forth, forming a tangled web of dependencies.</div>
            <div><span className="pl">Idea</span>Components talk only to a mediator; the mediator decides who needs to react.</div>
          </div>
          <Code lang="ts">{`type Event = "countryChanged" | "submitClicked";

class CheckoutForm {
  constructor(
    private country: Select, private city: Select,
    private shippingFee: Label, private submit: Button,
  ) {}

  // Components report to the mediator instead of calling each other
  notify(event: Event) {
    if (event === "countryChanged") {
      this.city.setOptions(citiesOf(this.country.value));
      this.shippingFee.setText(feeFor(this.country.value));
    }
    if (event === "submitClicked") {
      this.submit.disable();
    }
  }
}`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Forms with interdependent fields, chat rooms, workflow coordination. A Saga orchestrator is a system-level mediator.</div>
            <div className="warnc"><span className="pl">Caveat</span>The mediator can absorb all the logic and grow huge.</div>
          </div>
        </section>
        <section id="bh-memento">
          <h2><span className="n">05</span>Memento <small className="vn">Saved state</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>You need to save and restore an object's state without letting outsiders edit its internals directly.</div>
            <div><span className="pl">Idea</span>An object exports a read-only snapshot of its state and restores itself from it.</div>
          </div>
          <Code lang="ts">{`class Cart {
  private items = new Map<string, number>();   // sku -> quantity
  private voucher?: string;

  add(sku: string, qty = 1) { this.items.set(sku, (this.items.get(sku) ?? 0) + qty); }
  applyVoucher(code: string) { this.voucher = code; }

  save() {
    // Snapshot is a read-only copy; callers cannot change the cart through it
    return Object.freeze({ items: new Map(this.items) as ReadonlyMap<string, number>, voucher: this.voucher });
  }
  restore(m: ReturnType<Cart["save"]>) { this.items = new Map(m.items); this.voucher = m.voucher; }
}

const cart = new Cart();
const undoStack: ReturnType<Cart["save"]>[] = [];
cart.add("PHONE-01");
undoStack.push(cart.save());
cart.add("CASE-02", 3);          // added by mistake, customer clicks "Undo"
cart.restore(undoStack.pop()!);`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Undoing cart actions, saving draft orders, rolling back configuration.</div>
            <div className="warnc"><span className="pl">Caveat</span>Many large snapshots use a lot of memory; consider storing diffs or capping the number of snapshots.</div>
          </div>
        </section>
        <section id="bh-observer">
          <h2><span className="n">06</span>Observer <small className="vn">Subscriber list</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>When an object changes, many other places need to know, but the object should not know each of them.</div>
            <div><span className="pl">Idea</span>An object keeps a list of subscribers and notifies them all when something happens.</div>
          </div>
          <Code lang="ts">{`type Listener<T> = (data: T) => void;

class EventBus<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>) {
    (this.listeners[event] ??= []).push(fn);
    return () => { this.listeners[event] = this.listeners[event]!.filter(f => f !== fn); };
  }
  emit<K extends keyof Events>(event: K, data: Events[K]) {
    this.listeners[event]?.forEach(fn => fn(data));
  }
}

const bus = new EventBus<{ orderPaid: { id: string; total: number } }>();
bus.on("orderPaid", e => sendReceipt(e.id));
bus.on("orderPaid", e => updateRevenue(e.total));
bus.emit("orderPaid", { id: "42", total: 350000 });`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>UI events, reactive state, domain events inside a service. Kafka, RabbitMQ fanout and NATS are Observer distributed over a network.</div>
            <div className="warnc"><span className="pl">Caveat</span>Control flow is hard to follow; remember to unsubscribe to avoid memory leaks.</div>
          </div>
        </section>
        <section id="bh-state">
          <h2><span className="n">07</span>State <small className="vn">State object</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Behavior depends on state, and the code is full of <code>if (status === …)</code> repeated in every method.</div>
            <div><span className="pl">Idea</span>Each state is an object that decides the behavior and the next state.</div>
          </div>
          <Code lang="ts">{`type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

// Allowed transitions in one place
const transitions: Record<OrderStatus, Partial<Record<string, OrderStatus>>> = {
  pending:   { pay: "paid", cancel: "cancelled" },
  paid:      { ship: "shipped", cancel: "cancelled" },
  shipped:   {},
  cancelled: {},
};

class Order {
  constructor(public status: OrderStatus = "pending") {}
  apply(action: "pay" | "ship" | "cancel") {
    const next = transitions[this.status][action];
    if (!next) throw new Error(\`Cannot \${action} while the order is \${this.status}\`);
    this.status = next;
  }
}

const o = new Order();
o.apply("pay");
o.apply("ship");
o.apply("cancel"); // throws`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Order and payment lifecycles, network connections, approval workflows. A Circuit Breaker is a state machine too.</div>
            <div className="warnc"><span className="pl">Caveat</span>With few states and simple behavior, a transition table like the one above is leaner than many State classes.</div>
          </div>
        </section>
        <section id="bh-strategy">
          <h2><span className="n">08</span>Strategy <small className="vn">Swappable algorithm</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>A task has several interchangeable algorithms (shipping fees, discounts, sorting) chosen at runtime.</div>
            <div><span className="pl">Idea</span>Each algorithm is an object or function with the same interface; the caller receives one and calls it.</div>
          </div>
          <Code lang="ts">{`type ShippingStrategy = (weightKg: number, distanceKm: number) => number;

const standard: ShippingStrategy = (w, d) => 15000 + w * 3000 + d * 500;
const express: ShippingStrategy  = (w, d) => 30000 + w * 5000 + d * 800;
const freeOver500k = (total: number, base: ShippingStrategy): ShippingStrategy =>
  (w, d) => (total >= 500_000 ? 0 : base(w, d));

class ShippingCalculator {
  constructor(private strategy: ShippingStrategy) {}
  setStrategy(s: ShippingStrategy) { this.strategy = s; }
  fee(w: number, d: number) { return this.strategy(w, d); }
}

const calc = new ShippingCalculator(standard);
calc.setStrategy(freeOver500k(620_000, express));
calc.fee(2, 10); // 0`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Swappable algorithms: pricing, authentication, compression, sorting, retry policies.</div>
            <div className="warnc"><span className="pl">Caveat</span>In TypeScript a strategy is often just a function; no class hierarchy needed.</div>
          </div>
        </section>
        <section id="bh-template-method">
          <h2><span className="n">09</span>Template Method <small className="vn">Fixed skeleton</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Several processes share the same skeleton of steps and differ in only a few.</div>
            <div><span className="pl">Idea</span>The parent class defines a fixed sequence; subclasses implement specific steps.</div>
          </div>
          <Code lang="ts">{`abstract class DataImporter<Row> {
  // The fixed algorithm skeleton
  async run(file: string) {
    const raw = await this.read(file);
    const rows = this.parse(raw);
    const valid = rows.filter(r => this.validate(r));
    await this.save(valid);
    console.log(\`Imported \${valid.length}/\${rows.length}\`);
  }
  protected read(file: string) { return fs.promises.readFile(file, "utf8"); }
  protected abstract parse(raw: string): Row[];
  protected abstract validate(row: Row): boolean;
  protected abstract save(rows: Row[]): Promise<void>;
}

class CsvProductImporter extends DataImporter<Product> {
  protected parse(raw: string) { return raw.split("\\n").map(toProduct); }
  protected validate(p: Product) { return p.price > 0; }
  protected save(ps: Product[]) { return db.products.insertMany(ps); }
}`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Data import/export, request handling with a shared skeleton, test fixtures.</div>
            <div className="warnc"><span className="pl">Caveat</span>Inheritance makes it rigid; passing the steps in as functions (Strategy) is often more flexible.</div>
          </div>
        </section>
        <section id="bh-visitor">
          <h2><span className="n">10</span>Visitor <small className="vn">Operation per type</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>You need to add many new operations (export JSON, compute price, validate) to a stable object structure without editing every class.</div>
            <div><span className="pl">Idea</span>Put each operation in a visitor with a function per element type. In TypeScript, a discriminated union with a switch achieves the same more simply.</div>
          </div>
          <Code lang="ts">{`type CartItem =
  | { kind: "product"; name: string; price: number }
  | { kind: "bundle"; name: string; items: CartItem[]; discount: number }   // combo, e.g. 10% off
  | { kind: "gift"; name: string };

// Each "visitor" is just a function that handles every item kind
const price = (i: CartItem): number => {
  switch (i.kind) {
    case "product": return i.price;
    case "bundle":  return i.items.reduce((sum, x) => sum + price(x), 0) * (1 - i.discount);
    case "gift":    return 0;
  }
};

const describe = (i: CartItem): string => {
  switch (i.kind) {
    case "product": return i.name;
    case "bundle":  return \`\${i.name} [\${i.items.map(describe).join(", ")}]\`;
    case "gift":    return \`\${i.name} (gift)\`;
  }
};

const combo: CartItem = { kind: "bundle", name: "Study bundle", discount: 0.1, items: [
  { kind: "product", name: "Laptop", price: 20_000_000 },
  { kind: "product", name: "Mouse", price: 500_000 },
  { kind: "gift", name: "Laptop sleeve" },
] };
describe(combo); // Study bundle [Laptop, Mouse, Laptop sleeve (gift)]
price(combo);    // 18450000`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>One cart needs pricing, invoice printing and JSON export; compiler and linter ASTs.</div>
            <div className="warnc"><span className="pl">Caveat</span>Adding a new element type means updating every visitor. In TypeScript, enable exhaustiveness checks so the compiler reminds you.</div>
          </div>
        </section>
        <section id="bh-interpreter">
          <h2><span className="n">11</span>Interpreter <small className="vn">Small language</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>There is a small language (discount rules, search filters) to parse and run.</div>
            <div><span className="pl">Idea</span>Represent each grammar rule as an object with an <code>interpret</code> function, combined into a tree.</div>
          </div>
          <Code lang="ts">{`type Ctx = { total: number; tier: string };
interface Rule { test(ctx: Ctx): boolean; }

const totalOver = (n: number): Rule => ({ test: c => c.total > n });
const tierIs = (t: string): Rule => ({ test: c => c.tier === t });
const and = (...rs: Rule[]): Rule => ({ test: c => rs.every(r => r.test(c)) });
const or = (...rs: Rule[]): Rule => ({ test: c => rs.some(r => r.test(c)) });

// "total > 500k AND (tier = gold OR tier = vip)"
const vipDiscount = and(totalOver(500_000), or(tierIs("gold"), tierIs("vip")));
vipDiscount.test({ total: 600_000, tier: "gold" }); // true`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Configurable business rules, query filters, formulas.</div>
            <div className="warnc"><span className="pl">Caveat</span>Use a parser generator for large languages; this pattern suits small grammars.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
