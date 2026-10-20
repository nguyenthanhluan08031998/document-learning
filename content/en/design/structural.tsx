import { Code } from "@/components/Code";

export default function StructuralPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Structural: composing objects contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#st-adapter"><span>01</span>Adapter</a></li>
          <li><a href="#st-bridge"><span>02</span>Bridge</a></li>
          <li><a href="#st-composite"><span>03</span>Composite</a></li>
          <li><a href="#st-decorator"><span>04</span>Decorator</a></li>
          <li><a href="#st-facade"><span>05</span>Facade</a></li>
          <li><a href="#st-flyweight"><span>06</span>Flyweight</a></li>
          <li><a href="#st-proxy"><span>07</span>Proxy</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design pattern · structural</div>
          <h1>Structural: composing objects</h1>
          <p className="lede">Seven patterns for wrapping, connecting and organizing objects into larger structures that stay flexible.</p>
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
                  <td><a className="plink" href="#st-adapter">Adapter</a></td>
                  <td>Converter</td>
                  <td>Wrap the old object in a class implementing the new interface, translating calls back and forth.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-bridge">Bridge</a></td>
                  <td>Two hierarchies</td>
                  <td>Split into two hierarchies, one holding a reference to the other.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-composite">Composite</a></td>
                  <td>Object tree</td>
                  <td>Leaves and branches implement one interface; branches recurse into their children.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-decorator">Decorator</a></td>
                  <td>Add behavior by wrapping</td>
                  <td>Wrap an object in a class with the same interface that does extra work before or after calling the inner object. Wrappers can be stacked.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-facade">Facade</a></td>
                  <td>Front desk</td>
                  <td>Create a class with a few simple methods that coordinates the subsystems inside.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-flyweight">Flyweight</a></td>
                  <td>Share what is common</td>
                  <td>Pull the unchanging data (intrinsic) out to share it; each object keeps only its own part (extrinsic).</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-proxy">Proxy</a></td>
                  <td>Stand-in</td>
                  <td>An object with the same interface stands in front of the real one and decides whether to forward calls.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="st-adapter">
          <h2><span className="n">01</span>Adapter <small className="vn">Converter</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>An external library or API has an interface different from the one your code uses.</div>
            <div><span className="pl">Idea</span>Wrap the old object in a class implementing the new interface, translating calls back and forth.</div>
          </div>
          <Code lang="ts">{`// Interface our app expects
interface PaymentGateway { charge(orderId: string, amountVnd: number): Promise<string>; }

// Third-party SDK with a different shape
class LegacyPayClient {
  makePayment(p: { ref: string; cents: number; currency: string }) {
    return Promise.resolve({ transactionId: "tx_" + p.ref });
  }
}

class LegacyPayAdapter implements PaymentGateway {
  constructor(private client: LegacyPayClient) {}

  async charge(orderId: string, amountVnd: number) {
    const res = await this.client.makePayment({ ref: orderId, cents: amountVnd * 100, currency: "VND" });
    return res.transactionId;
  }
}`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Integrating third-party libraries and legacy systems, switching providers without touching business code.</div>
            <div className="warnc"><span className="pl">Caveat</span>Only translate; never put business logic in an adapter.</div>
          </div>
        </section>
        <section id="st-bridge">
          <h2><span className="n">02</span>Bridge <small className="vn">Two hierarchies</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Two dimensions vary independently (notification type × delivery channel), so subclasses multiply.</div>
            <div><span className="pl">Idea</span>Split into two hierarchies, one holding a reference to the other.</div>
          </div>
          <Code lang="ts">{`// Implementation side: how to deliver
interface Channel { deliver(to: string, text: string): void; }
class EmailChannel implements Channel { deliver(to: string, t: string) { console.log("email", to, t); } }
class SmsChannel implements Channel { deliver(to: string, t: string) { console.log("sms", to, t); } }

// Abstraction side: what to say
abstract class Message {
  constructor(protected channel: Channel) {}
  abstract send(to: string): void;
}
class OrderShipped extends Message {
  constructor(channel: Channel, private orderId: string) { super(channel); }
  send(to: string) { this.channel.deliver(to, \`Order \${this.orderId} delivered\`); }
}

new OrderShipped(new SmsChannel(), "42").send("0901...");
// N messages + M channels classes, instead of N x M subclasses like SmsOrderShipped`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Two aspects evolving together: platform × UI, report type × export format.</div>
            <div className="warnc"><span className="pl">Caveat</span>Often confused with Adapter. Bridge is designed up front to separate; Adapter patches two existing things to fit.</div>
          </div>
        </section>
        <section id="st-composite">
          <h2><span className="n">03</span>Composite <small className="vn">Object tree</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Tree-shaped data (folders and files, menus and items, orders and bundles) where you want to treat leaves and branches the same way.</div>
            <div><span className="pl">Idea</span>Leaves and branches implement one interface; branches recurse into their children.</div>
          </div>
          <Code lang="ts">{`interface CartItem { price(): number; }

class Product implements CartItem {
  constructor(private name: string, private unitPrice: number) {}
  price() { return this.unitPrice; }
}

class Combo implements CartItem {
  private items: CartItem[] = [];
  constructor(private discount = 0) {}
  add(item: CartItem) { this.items.push(item); return this; }
  price() {
    // Treat children uniformly, whether products or nested combos
    const sum = this.items.reduce((s, i) => s + i.price(), 0);
    return sum * (1 - this.discount);
  }
}

const lunch = new Combo(0.1).add(new Product("Pho", 50000)).add(new Product("Iced tea", 5000));
const cart = new Combo().add(lunch).add(new Product("Flan", 15000));
console.log(cart.price()); // 64500`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Tree structures: UI components, folder trees, org charts, expressions.</div>
            <div className="warnc"><span className="pl">Caveat</span>The shared interface may force leaves to implement methods only branches need (like <code>add</code>).</div>
          </div>
        </section>
        <section id="st-decorator">
          <h2><span className="n">04</span>Decorator <small className="vn">Add behavior by wrapping</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>You want to add logging, caching or retries to a service without editing it and without a subclass for every combination.</div>
            <div><span className="pl">Idea</span>Wrap an object in a class with the same interface that does extra work before or after calling the inner object. Wrappers can be stacked.</div>
          </div>
          <Code lang="ts">{`interface UserRepo { findById(id: string): Promise<User | null>; }

class DbUserRepo implements UserRepo {
  async findById(id: string) { return db.users.find(id); }
}

class CachedUserRepo implements UserRepo {
  private cache = new Map<string, User | null>();
  constructor(private inner: UserRepo) {}
  async findById(id: string) {
    if (!this.cache.has(id)) this.cache.set(id, await this.inner.findById(id));
    return this.cache.get(id)!;
  }
}

class LoggedUserRepo implements UserRepo {
  constructor(private inner: UserRepo) {}
  async findById(id: string) {
    const t = Date.now();
    try { return await this.inner.findById(id); }
    finally { console.log(\`findById \${id} took \${Date.now() - t}ms\`); }
  }
}

// Compose behaviours freely
const repo: UserRepo = new LoggedUserRepo(new CachedUserRepo(new DbUserRepo()));`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Middleware, caching, retries, logging, permission checks around a service. Express middleware and gRPC interceptors are the same idea.</div>
            <div className="warnc"><span className="pl">Caveat</span>Wrapping order matters: logging outside the cache differs from logging inside it. Don't confuse it with TypeScript's <code>@decorator</code> syntax, though you can use that to implement it.</div>
          </div>
        </section>
        <section id="st-facade">
          <h2><span className="n">05</span>Facade <small className="vn">Front desk</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>A business action must call many subsystems in the right order, and every caller has to know those details.</div>
            <div><span className="pl">Idea</span>Create a class with a few simple methods that coordinates the subsystems inside.</div>
          </div>
          <Code lang="ts">{`class CheckoutFacade {
  constructor(
    private inventory: InventoryService,
    private payment: PaymentService,
    private shipping: ShippingService,
    private notifier: Notifier,
  ) {}

  // One simple call hides four subsystems
  async checkout(cart: Cart, user: User) {
    await this.inventory.reserve(cart.items);
    const txId = await this.payment.charge(user.id, cart.total);
    const tracking = await this.shipping.schedule(cart, user.address);
    await this.notifier.send(user.email, \`Order placed, tracking number \${tracking}\`);
    return { txId, tracking };
  }
}`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Simplifying complex libraries, turning a use case into one entry point, the service layer in layered architectures.</div>
            <div className="warnc"><span className="pl">Caveat</span>A facade easily bloats into a “god object” that does everything. Keep it thin; it should only coordinate.</div>
          </div>
        </section>
        <section id="st-flyweight">
          <h2><span className="n">06</span>Flyweight <small className="vn">Share what is common</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>Hundreds of thousands of small objects all carry the same repeated data, wasting memory.</div>
            <div><span className="pl">Idea</span>Pull the unchanging data (intrinsic) out to share it; each object keeps only its own part (extrinsic).</div>
          </div>
          <Code lang="ts">{`// Shared, immutable part: product details are the same for every unit
class ProductSpec {
  constructor(readonly sku: string, readonly name: string, readonly image: Uint8Array) {}
}

class ProductSpecFactory {
  private static cache = new Map<string, ProductSpec>();
  static get(sku: string): ProductSpec {
    let s = this.cache.get(sku);
    if (!s) { s = loadSpec(sku); this.cache.set(sku, s); }
    return s;
  }
}

// Unique part per object: only the serial number, shelf and a reference
class StockUnit {
  constructor(readonly serial: string, readonly shelf: string, readonly spec: ProductSpec) {}
}

const units = Array.from({ length: 100_000 }, (_, i) =>
  new StockUnit(\`SN-\${i}\`, \`A-\${i % 200}\`, ProductSpecFactory.get(i % 2 ? "PHONE-01" : "CASE-02")));
// 100k units in the warehouse share only 2 product specs`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Stock tracked per serial number, product lists repeated many times, games, maps, caches of repeated strings.</div>
            <div className="warnc"><span className="pl">Caveat</span>Only worth it when you have measured a real memory problem; the code gets noticeably more complex.</div>
          </div>
        </section>
        <section id="st-proxy">
          <h2><span className="n">07</span>Proxy <small className="vn">Stand-in</small></h2>
          <div className="pp">
            <div><span className="pl">Problem</span>You need to control access to an object: lazy loading, permission checks, remote calls, rate limiting.</div>
            <div><span className="pl">Idea</span>An object with the same interface stands in front of the real one and decides whether to forward calls.</div>
          </div>
          <Code lang="ts">{`interface InvoiceFile { download(): Uint8Array; }

class RenderedInvoice implements InvoiceFile {
  private pdf: Uint8Array;
  constructor(orderId: string) { this.pdf = renderInvoicePdf(orderId); } // expensive
  download() { return this.pdf; }
}

class SecureLazyInvoice implements InvoiceFile {
  private real?: RenderedInvoice;
  constructor(private order: Order, private user: User) {}

  download() {
    // Only the buyer or staff may see the invoice
    if (this.user.id !== this.order.customerId && !this.user.roles.includes("staff")) throw new Error("Forbidden");
    this.real ??= new RenderedInvoice(this.order.id); // render only when first needed
    return this.real.download();
  }
}

// JavaScript also has a built-in Proxy object for intercepting property access`}</Code>
          <div className="pp">
            <div><span className="pl">When to use</span>Lazy loading, authorization, remote stubs (a gRPC client stub is a proxy), rate limiting.</div>
            <div className="warnc"><span className="pl">Caveat</span>It differs from Decorator in intent: Proxy controls access and usually manages the real object itself; Decorator adds behavior and receives the object from outside.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
