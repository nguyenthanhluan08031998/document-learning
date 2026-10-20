import { Code } from "@/components/Code";

export default function OopPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="OOP contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#oop-class"><span>01</span>{"Class & Object"}</a></li>
          <li><a href="#oop-pillars"><span>02</span>4 OOP pillars</a></li>
          <li><a href="#oop-encap"><span>03</span>{"Encapsulation & access modifiers"}</a></li>
          <li><a href="#oop-static"><span>04</span>Static</a></li>
          <li><a href="#oop-inherit"><span>05</span>Inheritance</a></li>
          <li><a href="#oop-abstract"><span>06</span>{"Abstract class & Interface"}</a></li>
          <li><a href="#oop-poly"><span>07</span>{"Polymorphism & Generics"}</a></li>
          <li><a href="#oop-relation"><span>08</span>Relations between classes</a></li>
          <li><a href="#oop-ts"><span>09</span>TypeScript specifics</a></li>
          <li><a href="#oop-cheat"><span>10</span>Keyword table</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · foundations</div>
          <h1>OOP: the foundation of every design pattern</h1>
          <p className="lede">Object-oriented programming bundles <b>data</b> and the <b>behavior</b> that works on it into one unit called an object. Design patterns are proven ways to combine classes, interfaces, inheritance and polymorphism, so master this first.</p>
          <div className="tape" aria-hidden="true">
            <div>class</div>
            <div>new</div>
            <div>this</div>
            <div>static</div>
            <div className="hw">extends</div>
            <div className="leo">implements</div>
          </div>
        </header>
        <section id="oop-class">
          <h2><span className="n">01</span>{"Class & Object"}</h2>
          <p>A <b>class</b> is a blueprint; an <b>object</b> (instance) is what <code>new</code> creates from it. Each object has its own data but shares the class's methods.</p>
          <Code lang="ts">{`class Product {
  // Properties (fields): data each object holds
  name: string;
  price: number;

  // Constructor runs once when "new" is called
  constructor(name: string, price: number) {
    this.name = name;   // "this" is the object being created
    this.price = price;
  }

  // Method: behaviour that works on this object's data
  priceWithVat(rate = 0.1) {
    return this.price * (1 + rate);
  }
}

const pho = new Product("Beef pho", 50_000);   // an object (instance)
const tea = new Product("Iced tea", 5_000);    // another, with its own data
pho.priceWithVat(); // 55000

// Shorthand: parameter properties declare and assign in one line
class Customer {
  constructor(public readonly id: string, private email: string) {}
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Property / field</b></td>
                  <td>The object's data (<code>name</code>, <code>price</code>).</td>
                </tr>
                <tr>
                  <td><b>Method</b></td>
                  <td>A function belonging to the object, using <code>this</code> to reach its own data.</td>
                </tr>
                <tr>
                  <td><b>Constructor</b></td>
                  <td>The initializer, run when <code>new</code> is called; one per class.</td>
                </tr>
                <tr>
                  <td><b>this</b></td>
                  <td>Points to the object the method was called on.</td>
                </tr>
                <tr>
                  <td><b>Instance</b></td>
                  <td>A concrete object created from a class.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="oop-pillars">
          <h2><span className="n">02</span>The 4 pillars of OOP</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Pillar</th>
                  <th>Meaning</th>
                  <th>Tools in TypeScript</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Encapsulation</b></td>
                  <td>Hide internal data and allow changes only through controlled methods</td>
                  <td><code>private</code>, <code>#field</code>, <code>readonly</code>, getter/setter</td>
                </tr>
                <tr>
                  <td><b>Inheritance</b></td>
                  <td>A subclass inherits the parent's properties and methods and extends them</td>
                  <td><code>extends</code>, <code>super</code>, <code>override</code></td>
                </tr>
                <tr>
                  <td><b>Polymorphism</b></td>
                  <td>The same call, each object responding its own way</td>
                  <td>override method, interface, generics</td>
                </tr>
                <tr>
                  <td><b>Abstraction</b></td>
                  <td>Expose “what it can do”, hide “how it does it”</td>
                  <td><code>interface</code>, <code>abstract class</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="oop-encap">
          <h2><span className="n">03</span>{"Encapsulation & access modifiers"}</h2>
          <Code lang="ts">{`// Customer wallet used at checkout
class Wallet {
  readonly customerId: string;          // set once, never reassigned
  #balance = 0;                         // truly private at runtime (JS private field)
  protected history: number[] = [];     // visible to subclasses
  private static MAX_BALANCE = 50_000_000;  // private to the class

  constructor(customerId: string) { this.customerId = customerId; }

  // Getter: read-only view of internal state
  get balance() { return this.#balance; }

  // State changes only through methods that enforce rules
  topUp(amount: number) {
    if (amount <= 0) throw new Error("Amount must be positive");
    if (this.#balance + amount > Wallet.MAX_BALANCE) throw new Error("Wallet limit exceeded");
    this.#balance += amount;
    this.history.push(amount);
  }

  pay(orderTotal: number) {
    if (orderTotal > this.#balance) throw new Error("Insufficient balance");
    this.#balance -= orderTotal;
    this.history.push(-orderTotal);
  }
}

const wallet = new Wallet("C-1");
wallet.topUp(500_000);
wallet.pay(350_000);
wallet.balance;          // 150000
// wallet.balance = 0;   // error: no setter
// wallet.#balance;      // error: private field`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Modifier</th>
                  <th>Trong class</th>
                  <th>Subclass</th>
                  <th>Outside</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">public</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>Default if nothing is written</td>
                </tr>
                <tr>
                  <td className="m">protected</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>No</td>
                  <td>Meant for inheritance</td>
                </tr>
                <tr>
                  <td className="m">private</td>
                  <td>Yes</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Checked only at compile time; running JavaScript can still access it</td>
                </tr>
                <tr>
                  <td className="m">#field</td>
                  <td>Yes</td>
                  <td>No</td>
                  <td>No</td>
                  <td>True JavaScript privacy, enforced at runtime too</td>
                </tr>
                <tr>
                  <td className="m">readonly</td>
                  <td colSpan={3}>No access restriction; only forbids reassignment after the constructor</td>
                  <td>Combinable: <code>private readonly</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Rule of thumb:</b> default to <code>private</code> and open up only when needed. Don't reflexively add getters/setters for every field; methods should express business actions (<code>topUp</code>, <code>pay</code>) rather than <code>setBalance</code>.</div>
        </section>
        <section id="oop-static">
          <h2><span className="n">04</span>Static: belongs to the class, not the object</h2>
          <p>A <code>static</code> member belongs to <b>the class itself</b>: there is one shared copy, accessed through the class name (<code>Order.count</code>) without creating an object. Instance members exist once per object.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 252" role="img" aria-label="The Order class holds the shared static count, MAX_ITEMS, fromJson and isValidSku; objects a and b each have their own id and items"> <defs><marker id="osb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker></defs> <rect className="s-hl" x="30" y="24" width="320" height="216" rx="8" /> <text className="s-tb" x="46" y="50" style={{ fontSize: "15px" }}>class Order</text> <text className="s-lane" x="46" y="76">STATIC · ONE SHARED COPY</text> <text className="s-tm" x="46" y="98" style={{ fill: "var(--ink)" }}>count = 2</text> <text className="s-tm" x="46" y="116" style={{ fill: "var(--ink)" }}>MAX_ITEMS = 50</text> <text className="s-tm" x="46" y="134" style={{ fill: "var(--ink)" }}>fromJson()</text> <text className="s-tm" x="46" y="152" style={{ fill: "var(--ink)" }}>isValidSku()</text> <path d="M42 176 H338" style={{ stroke: "var(--accent)", strokeWidth: "1", strokeDasharray: "3 3" }} /> <text className="s-lane" x="46" y="198">METHODS · ON THE PROTOTYPE</text> <text className="s-tm" x="46" y="220" style={{ fill: "var(--ink)" }}>addItem(sku)</text> <rect className="s-box" x="520" y="34" width="210" height="88" rx="8" /> <text className="s-tb" x="536" y="60">object a</text> <text className="s-tm" x="536" y="84" style={{ fill: "var(--ink)" }}>id = 1</text> <text className="s-tm" x="536" y="104" style={{ fill: "var(--ink)" }}>items = ["PHO-001"]</text> <path className="s-dl" d="M518 78 C440 78 430 132 352 132" markerEnd="url(#osb)" /> <rect className="s-box" x="520" y="140" width="210" height="88" rx="8" /> <text className="s-tb" x="536" y="166">object b</text> <text className="s-tm" x="536" y="190" style={{ fill: "var(--ink)" }}>id = 2</text> <text className="s-tm" x="536" y="210" style={{ fill: "var(--ink)" }}>items = []</text> <path className="s-dl" d="M518 184 C440 184 430 132 352 132" markerEnd="url(#osb)" /> <text className="s-tm" x="362" y="158">shared</text> <text className="s-tm" x="748" y="70">each object has</text> <text className="s-tm" x="748" y="88">its own data</text> <text className="s-tm" x="748" y="176">new Order() a 2nd time</text> <text className="s-tm" x="748" y="194">→ count rises for the class</text> </svg>
            </div>
            <figcaption>Static members live on the class, so there is one copy; instance fields live on each object. Regular methods are shared through the prototype too, but run with each object's <code>this</code>.</figcaption>
          </figure>
          <Code lang="ts">{`class Order {
  // Static property: one shared value for the whole class
  static count = 0;
  static readonly MAX_ITEMS = 50;

  // Static block: runs once when the class is defined
  static {
    Order.count = Number(process.env.ORDER_SEED ?? 0);
  }

  readonly id: number;
  items: string[] = [];

  constructor() {
    Order.count++;            // instance code can read/write static members
    this.id = Order.count;
  }

  // Static method: no "this" object; often used as a named factory
  static fromJson(json: string): Order {
    const data = JSON.parse(json);
    const o = new Order();
    o.items = data.items;
    return o;
  }

  // Static helper that does not need any instance data
  static isValidSku(sku: string) {
    return /^[A-Z]{3}-\\d{3}$/.test(sku);
  }

  addItem(sku: string) {
    if (this.items.length >= Order.MAX_ITEMS) throw new Error("Too many items");
    if (!Order.isValidSku(sku)) throw new Error("Bad SKU");
    this.items.push(sku);
  }
}

const a = new Order();     // a.id = 1
const b = new Order();     // b.id = 2
Order.count;               // 2  (shared)
// a.count;                // error: count is not on the instance
Order.fromJson('{"items":["PHO-001"]}');`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Instance</th>
                  <th>Static</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Belongs to</b></td>
                  <td>Each object</td>
                  <td>Class</td>
                </tr>
                <tr>
                  <td><b>Copies</b></td>
                  <td>One per object</td>
                  <td>Exactly one</td>
                </tr>
                <tr>
                  <td><b>Called via</b></td>
                  <td><code>obj.method()</code></td>
                  <td><code>ClassName.method()</code></td>
                </tr>
                <tr>
                  <td><b>Is <code>this</code> an object?</b></td>
                  <td>Yes</td>
                  <td>No (<code>this</code> is the class itself)</td>
                </tr>
                <tr>
                  <td><b>Accessing the other kind</b></td>
                  <td>Can read statics through the class name</td>
                  <td>Cannot read instance fields (there is no object)</td>
                </tr>
                <tr>
                  <td><b>Inheritance</b></td>
                  <td>Yes</td>
                  <td>Yes; subclasses can call <code>Child.staticMethod()</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>When to use static</h3>
          <ul className="plain">
            <li><b>Class constants</b>: <code>Order.MAX_ITEMS</code>.</li>
            <li><b>Named factory methods</b>: <code>Order.fromJson()</code>, <code>Money.fromVnd()</code>, clearer than many constructors.</li>
            <li><b>Pure utility functions</b> that need no object data: <code>Order.isValidSku()</code>.</li>
            <li><b>Shared counters, caches, registries</b>: number of objects created, lookup tables.</li>
            <li><b>Singleton</b>: <code>static instance</code> + <code>static get()</code> (xem tab Creational).</li>
          </ul>
          <div className="note"><b>Beware of stateful statics:</b> they are globals in disguise. Parallel tests can leak data into each other, and they cannot be swapped for fakes. In TypeScript, pure utilities are usually better as <code>export function</code> in a module than as a class full of statics.</div>
        </section>
        <section id="oop-inherit">
          <h2><span className="n">05</span>Inheritance</h2>
          <Code lang="ts">{`class Customer {
  constructor(public name: string, protected points: number) {}

  // Loyal customers (1000+ points) get 2% off
  discountRate(): number { return this.points >= 1_000 ? 0.02 : 0; }
  describe() { return \`\${this.name}: \${Math.round(this.discountRate() * 100)}% off\`; }
}

class VipCustomer extends Customer {
  constructor(name: string, points: number, private tier: 1 | 2 | 3) {
    super(name, points);               // must call parent constructor first
  }

  // "override" makes the intent explicit; compiler checks the parent has it
  override discountRate(): number {
    return super.discountRate() + this.tier * 0.05;   // reuse parent logic
  }
}

const vip = new VipCustomer("Lan", 1_200, 2);
vip.describe();  // "Lan: 12% off" — parent method calls the overridden discountRate()`}</Code>
          <ul className="plain">
            <li>A class can <code>extends</code> only <b>one</b> parent, but <code>implements</code> many interfaces.</li>
            <li>Enable <code>noImplicitOverride</code> in tsconfig to require <code>override</code> and avoid accidental overrides.</li>
            <li>Inheritance expresses an <b>“is a”</b> relation (a VipCustomer is a Customer). If it is only “has a” or “uses a”, use composition.</li>
          </ul>
          <div className="note"><b>Deep inheritance causes trouble:</b> changing a parent breaks distant subclasses (fragile base class). Prefer composition; most GoF patterns exist to avoid rigid inheritance.</div>
        </section>
        <section id="oop-abstract">
          <h2><span className="n">06</span>{"Abstract class & Interface"}</h2>
          <Code lang="ts">{`// Interface: a contract only, no implementation, no runtime code
interface Shippable {
  weightKg(): number;
}
interface Taxable {
  taxRate: number;
}

// Abstract class: partial implementation + abstract parts to fill in
abstract class Payment {
  constructor(protected amount: number) {}

  // Shared, concrete logic
  receipt() { return \`\${this.method()} - \${this.amount + this.fee()} VND\`; }

  // Subclasses must implement these
  protected abstract fee(): number;
  abstract method(): string;
}

class CardPayment extends Payment {
  protected fee() { return Math.round(this.amount * 0.02); }
  method() { return "Card"; }
}

// One class, one parent, many interfaces
class Parcel implements Shippable, Taxable {
  taxRate = 0.08;
  weightKg() { return 1.5; }
}

// new Payment(100);  // error: cannot instantiate an abstract class`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Interface</th>
                  <th>Abstract class</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Contains code</b></td>
                  <td>No, only describes a shape</td>
                  <td>Yes, mixing concrete and abstract methods</td>
                </tr>
                <tr>
                  <td><b>Can be created with new</b></td>
                  <td>No</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><b>A class can use</b></td>
                  <td>Many (<code>implements A, B</code>)</td>
                  <td>One (<code>extends</code>)</td>
                </tr>
                <tr>
                  <td><b>Constructor, initialized fields</b></td>
                  <td>No</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><b>Exists at JavaScript runtime</b></td>
                  <td>No, erased at compile time</td>
                  <td>Yes, a real class</td>
                </tr>
                <tr>
                  <td><b>Use for</b></td>
                  <td>Defining contracts, ports, capabilities</td>
                  <td>Sharing code across a family of classes (Template Method)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="oop-poly">
          <h2><span className="n">07</span>{"Polymorphism & Generics"}</h2>
          <h3>Polymorphism through interfaces and overriding</h3>
          <Code lang="ts">{`interface ShippingMethod { name: string; fee(weightKg: number): number; }

class Standard implements ShippingMethod {
  name = "Standard";
  fee(kg: number) { return 20_000 + kg * 5_000; }
}
class Express implements ShippingMethod {
  name = "Express";
  constructor(private surcharge: number) {}
  fee(kg: number) { return 40_000 + kg * 8_000 + this.surcharge; }
}

// Same call, different behaviour per object
const methods: ShippingMethod[] = [new Standard(), new Express(15_000)];
methods.forEach(m => console.log(m.name, m.fee(2)));   // Standard 30000, Express 71000`}</Code>
          <h3>Overloading trong TypeScript</h3>
          <Code lang="ts">{`class Formatter {
  // Overload signatures (what callers see)
  format(value: number): string;
  format(value: Date): string;
  // Single implementation that handles all cases
  format(value: number | Date): string {
    return typeof value === "number"
      ? value.toLocaleString("vi-VN")
      : value.toLocaleDateString("vi-VN");
  }
}`}</Code>
          <p>JavaScript does not allow several methods with the same name, so TypeScript only has <b>overload signatures</b> with a single implementation body.</p>
          <h3>Generics: polymorphism over types</h3>
          <Code lang="ts">{`class Repository<T extends { id: string }> {
  private items = new Map<string, T>();
  save(item: T) { this.items.set(item.id, item); }
  find(id: string): T | undefined { return this.items.get(id); }
}

const products = new Repository<{ id: string; name: string }>();
products.save({ id: "p1", name: "Pho" });
products.find("p1")?.name;  // typed as string`}</Code>
        </section>
        <section id="oop-relation">
          <h2><span className="n">08</span>Relations between classes</h2>
          <p>When reading design pattern diagrams you will meet the six UML relations below, ordered from loosest to tightest.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 300" role="img" aria-label="Six UML relation symbols: dependency dashed with an open arrow, association solid with an open arrow, aggregation hollow diamond, composition filled diamond, inheritance solid with a hollow triangle, realization dashed with a hollow triangle"> <defs /> <text className="s-tb" x="20" y="42">Dependency <tspan className="s-tm">· temporary use</tspan></text> <rect className="s-box" x="20" y="56" width="120" height="40" rx="5" /><text className="s-tm" x="80" y="81" textAnchor="middle" style={{ fill: "var(--ink)" }}>Order</text> <rect className="s-box" x="310" y="56" width="120" height="40" rx="5" /><text className="s-tm" x="370" y="81" textAnchor="middle" style={{ fill: "var(--ink)" }}>Printer</text> <path d="M140 76 H310" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none", strokeDasharray: "6 4" }} /> <polyline points="299,70 310,76 299,82" style={{ fill: "none", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <text className="s-tb" x="470" y="42">Association <tspan className="s-tm">· knows about</tspan></text> <rect className="s-box" x="470" y="56" width="120" height="40" rx="5" /><text className="s-tm" x="530" y="81" textAnchor="middle" style={{ fill: "var(--ink)" }}>Order</text> <rect className="s-box" x="760" y="56" width="120" height="40" rx="5" /><text className="s-tm" x="820" y="81" textAnchor="middle" style={{ fill: "var(--ink)" }}>Customer</text> <path d="M590 76 H760" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none" }} /> <polyline points="749,70 760,76 749,82" style={{ fill: "none", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <text className="s-tb" x="20" y="138">Aggregation <tspan className="s-tm">· has, lives independently</tspan></text> <rect className="s-box" x="20" y="152" width="120" height="40" rx="5" /><text className="s-tm" x="80" y="177" textAnchor="middle" style={{ fill: "var(--ink)" }}>Category</text> <rect className="s-box" x="310" y="152" width="120" height="40" rx="5" /><text className="s-tm" x="370" y="177" textAnchor="middle" style={{ fill: "var(--ink)" }}>Product</text> <polygon points="140,172 152,165 164,172 152,179" style={{ fill: "var(--surface)", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <path d="M164 172 H310" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none" }} /> <text className="s-tb" x="470" y="138">Composition <tspan className="s-tm">· owns, lives and dies together</tspan></text> <rect className="s-box" x="470" y="152" width="120" height="40" rx="5" /><text className="s-tm" x="530" y="177" textAnchor="middle" style={{ fill: "var(--ink)" }}>Order</text> <rect className="s-box" x="760" y="152" width="120" height="40" rx="5" /><text className="s-tm" x="820" y="177" textAnchor="middle" style={{ fill: "var(--ink)" }}>OrderLine</text> <polygon points="590,172 602,165 614,172 602,179" style={{ fill: "var(--ink)", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <path d="M614 172 H760" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none" }} /> <text className="s-tb" x="20" y="234">Inheritance <tspan className="s-tm">· is a</tspan></text> <rect className="s-box" x="20" y="248" width="120" height="40" rx="5" /><text className="s-tm" x="80" y="273" textAnchor="middle" style={{ fill: "var(--ink)" }}>VipCustomer</text> <rect className="s-box" x="310" y="248" width="120" height="40" rx="5" /><text className="s-tm" x="370" y="273" textAnchor="middle" style={{ fill: "var(--ink)" }}>Customer</text> <path d="M140 268 H310" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none" }} /> <polygon points="310,268 296,260 296,276" style={{ fill: "var(--surface)", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <text className="s-tb" x="470" y="234">Realization <tspan className="s-tm">· implements an interface</tspan></text> <rect className="s-box" x="470" y="248" width="120" height="40" rx="5" /><text className="s-tm" x="530" y="273" textAnchor="middle" style={{ fill: "var(--ink)" }}>Parcel</text> <rect className="s-box" x="760" y="248" width="120" height="40" rx="5" /><text className="s-tm" x="820" y="273" textAnchor="middle" style={{ fill: "var(--ink)" }}>Shippable</text> <path d="M590 268 H760" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none", strokeDasharray: "6 4" }} /> <polygon points="760,268 746,260 746,276" style={{ fill: "var(--surface)", stroke: "var(--ink)", strokeWidth: "1.3" }} /> </svg>
            </div>
            <figcaption>The diamond sits on the “whole” side; the triangle points to the parent class or interface. A dashed line means a weaker relation or just a contract.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Relation</th>
                  <th>Meaning</th>
                  <th>Trong code</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Dependency</b></td>
                  <td>“Uses temporarily”</td>
                  <td>Received as a parameter or created inside a method, not kept</td>
                </tr>
                <tr>
                  <td><b>Association</b></td>
                  <td>“Knows about”</td>
                  <td>Keeps a long-lived reference: <code>order.customer</code></td>
                </tr>
                <tr>
                  <td><b>Aggregation</b></td>
                  <td>“Has”, the part lives independently</td>
                  <td>A Category keeps a list of Products; delete the Category and the Products remain</td>
                </tr>
                <tr>
                  <td><b>Composition</b></td>
                  <td>“Owns”, the part lives and dies with the whole</td>
                  <td>An Order creates its OrderLines; delete the Order and its lines go too</td>
                </tr>
                <tr>
                  <td><b>Inheritance</b></td>
                  <td>“Is a”</td>
                  <td><code>class VipCustomer extends Customer</code></td>
                </tr>
                <tr>
                  <td><b>Realization</b></td>
                  <td>“Fulfills a contract”</td>
                  <td><code>class Parcel implements Shippable</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <Code lang="ts">{`class OrderLine { constructor(readonly sku: string, readonly qty: number) {} }

class Order {
  private lines: OrderLine[] = [];                 // composition: Order owns and creates its lines
  constructor(readonly customer: Customer) {}      // association: keeps a reference
  addLine(sku: string, qty: number) { this.lines.push(new OrderLine(sku, qty)); }
  print(printer: Printer) { printer.print(this); } // dependency: used only during the call
}`}</Code>
        </section>
        <section id="oop-ts">
          <h2><span className="n">09</span>TypeScript specifics</h2>
          <ul className="plain">
            <li><b>Structural typing</b>: TypeScript compares by <b>shape</b>, not by name. Any object with <code>name</code> and <code>fee()</code> is a <code>ShippingMethod</code>, without writing <code>implements</code>. Writing <code>implements</code> is still wise so the compiler checks early.</li>
            <li><b>A class is both a value and a type</b>: <code>Product</code> works with <code>new</code> and as a type <code>let p: Product</code>.</li>
            <li><b>Interfaces don't exist at runtime</b>: you cannot write <code>x instanceof ShippingMethod</code>; write a type guard instead, <code>{"(x): x is ShippingMethod => \"fee\" in x"}</code>.</li>
            <li><b>Losing <code>this</code></b>: passing <code>obj.method</code> as a callback loses <code>this</code>. Use an arrow function field (<code>{"handle = () => …"}</code>) or <code>.bind(this)</code>.</li>
            <li><b>Prototypes underneath</b>: methods live on <code>Product.prototype</code>, shared by every object; fields live on each object.</li>
            <li>Not everything needs a class. Pure functions and object literals are often leaner for stateless logic.</li>
          </ul>
          <Code lang="ts">{`class AddToCartButton {
  added = 0;
  onClickBroken() { this.added++; }        // "this" is lost when passed as a callback
  onClick = () => { this.added++; };       // arrow field keeps "this"
}
const btn = new AddToCartButton();
setTimeout(btn.onClick, 0);                // works
// setTimeout(btn.onClickBroken, 0);       // TypeError: cannot read 'added' of undefined`}</Code>
        </section>
        <section id="oop-cheat">
          <h2><span className="n">10</span>Keyword table</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">class / new</td>
                  <td>Declare a blueprint / create an object</td>
                </tr>
                <tr>
                  <td className="m">constructor</td>
                  <td>Initializer</td>
                </tr>
                <tr>
                  <td className="m">this</td>
                  <td>The current object (in static code: the class itself)</td>
                </tr>
                <tr>
                  <td className="m">public / protected / private / #</td>
                  <td>Access scope</td>
                </tr>
                <tr>
                  <td className="m">readonly</td>
                  <td>No reassignment after initialization</td>
                </tr>
                <tr>
                  <td className="m">static</td>
                  <td>A class member, shared</td>
                </tr>
                <tr>
                  <td className="m">{"static { }"}</td>
                  <td>An initialization block run once for the class</td>
                </tr>
                <tr>
                  <td className="m">get / set</td>
                  <td>Computed properties, controlled reads and writes</td>
                </tr>
                <tr>
                  <td className="m">extends / super</td>
                  <td>Inherit / call the parent</td>
                </tr>
                <tr>
                  <td className="m">override</td>
                  <td>Asserts you are overriding a parent method</td>
                </tr>
                <tr>
                  <td className="m">abstract</td>
                  <td>A class that cannot be instantiated / a method subclasses must write</td>
                </tr>
                <tr>
                  <td className="m">interface / implements</td>
                  <td>A contract / a promise to follow it</td>
                </tr>
                <tr>
                  <td className="m">instanceof</td>
                  <td>Checks which class created an object (not usable with interfaces)</td>
                </tr>
                <tr>
                  <td className="m">{"<T>"}</td>
                  <td>Generics: classes or functions usable with many types</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Next:</b> the <b>Principles</b> tab (SOLID) shows how to use these tools correctly, then on to the pattern tabs.</div>
        </section>
      </main>
    </div>
  );
}
