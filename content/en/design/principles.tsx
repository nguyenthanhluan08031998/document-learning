import { Code } from "@/components/Code";

export default function PrinciplesPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Principles contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#pr-why"><span>01</span>What patterns are</a></li>
          <li><a href="#pr-srp"><span>02</span>S · Single Responsibility</a></li>
          <li><a href="#pr-ocp"><span>03</span>O · Open/Closed</a></li>
          <li><a href="#pr-lsp"><span>04</span>L · Liskov Substitution</a></li>
          <li><a href="#pr-isp"><span>05</span>I · Interface Segregation</a></li>
          <li><a href="#pr-dip"><span>06</span>D · Dependency Inversion</a></li>
          <li><a href="#pr-refactor"><span>07</span>Step-by-step refactor</a></li>
          <li><a href="#pr-more"><span>08</span>Other principles</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · core principles</div>
          <h1>Principles first, patterns second</h1>
          <p className="lede">Design patterns are named solutions to recurring design problems. They all grow from a few core principles, the most important being <b>SOLID</b>. Understand the principles and you will recognize when a pattern is needed and when it is not. Shaky on classes, interfaces and inheritance? Read the <b>OOP</b> tab first.</p>
          <div className="tape" aria-hidden="true">
            <div>S</div>
            <div>O</div>
            <div>L</div>
            <div>I</div>
            <div className="hw">D</div>
          </div>
        </header>
        <section id="pr-why">
          <h2><span className="n">01</span>What patterns are and how they are grouped</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Solves</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Creational</b></td>
                  <td>How to <b>create</b> objects without depending on concrete classes</td>
                  <td className="n">5</td>
                </tr>
                <tr>
                  <td><b>Structural</b></td>
                  <td>How to <b>compose</b> classes and objects into larger structures</td>
                  <td className="n">7</td>
                </tr>
                <tr>
                  <td><b>Behavioral</b></td>
                  <td>How objects <b>communicate</b> and split responsibility</td>
                  <td className="n">11</td>
                </tr>
                <tr>
                  <td><b>Microservice</b></td>
                  <td>Problems when a system runs as many services over a network</td>
                  <td>many</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>The first 23 patterns come from the book <em>Design Patterns</em> (1994) by the “Gang of Four” (GoF). The microservice group was collected later from experience building distributed systems.</p>
          <div className="note"><b>Don't force patterns into code.</b> Patterns have a cost: more classes, more indirection. Write it simply first; when it hurts (one change touches ten places, hard to test), look for the right pattern.</div>
        </section>
        <section id="pr-srp">
          <h2><span className="n">02</span>Single Responsibility</h2>
          <p>Each module should have <b>one reason to change</b>, meaning it serves one group of users or one concern.</p>
          <Code lang="ts">{`// Before: one class changes for business rules, SQL and email templates
class OrderService {
  create(o: Order) { /* validate + INSERT + send email */ }
}

// After: each part changes for its own reason
class OrderValidator { check(o: Order) { /* rules */ } }
class OrderRepository { save(o: Order) { /* SQL */ } }
class OrderMailer { confirm(o: Order) { /* email */ } }`}</Code>
        </section>
        <section id="pr-ocp">
          <h2><span className="n">03</span>Open/Closed</h2>
          <p>Open for <b>extension</b>, closed for <b>modification</b>: add features by adding new code, not by editing code that already works.</p>
          <Code lang="ts">{`// Adding a new discount type means adding an object, not editing a switch
interface Discount { applies(o: Order): boolean; amount(o: Order): number; }

const discounts: Discount[] = [newCustomer, flashSale, voucher];
const totalDiscount = (o: Order) =>
  discounts.filter(d => d.applies(o)).reduce((s, d) => s + d.amount(o), 0);`}</Code>
          <p>Related patterns: Strategy, Decorator, Observer, Template Method.</p>
        </section>
        <section id="pr-lsp">
          <h2><span className="n">04</span>Liskov Substitution</h2>
          <p>Subclasses must be <b>substitutable for their parent</b> without breaking the program: no stricter inputs, no weaker promises on outputs, no surprise exceptions.</p>
          <Code lang="ts">{`class PaymentMethod { refund(orderId: string, amount: number) { /* send money back */ } }

// Violation: callers of PaymentMethod do not expect refund() to throw
class CashOnDelivery extends PaymentMethod {
  override refund(): never { throw new Error("COD cannot be refunded online"); }
}

// Better: model the capability explicitly
interface Chargeable { charge(orderId: string, amount: number): Promise<void>; }
interface Refundable { refund(orderId: string, amount: number): Promise<void>; }`}</Code>
        </section>
        <section id="pr-isp">
          <h2><span className="n">05</span>Interface Segregation</h2>
          <p>Don't force clients to depend on methods they don't use. Split large interfaces into small, role-based ones.</p>
          <Code lang="ts">{`// Instead of one fat UserService interface:
interface UserReader { findById(id: string): Promise<User | null>; }
interface UserWriter { save(u: User): Promise<void>; }

// A customer report job only needs reading, so tests only mock one method
class CustomerReport { constructor(private users: UserReader) {} }`}</Code>
        </section>
        <section id="pr-dip">
          <h2><span className="n">06</span>Dependency Inversion</h2>
          <p>High-level modules (business) don't depend on low-level modules (database, HTTP); <b>both depend on abstractions</b>, and the business side defines those abstractions. This is the foundation of Clean Architecture.</p>
          <Code lang="ts">{`// Business layer owns the interface
interface PaymentPort { charge(userId: string, amount: number): Promise<string>; }

class PlaceOrder {
  constructor(private payment: PaymentPort) {} // depends on abstraction
  async run(userId: string, amount: number) { return this.payment.charge(userId, amount); }
}

// Infrastructure implements it; swap freely in tests
class StripePayment implements PaymentPort { async charge() { return "ch_123"; } }
const useCase = new PlaceOrder(new StripePayment());`}</Code>
        </section>
        <section id="pr-refactor">
          <h2><span className="n">07</span>Step-by-step refactor: OrderService</h2>
          <p>Apply all five principles to <b>one</b> real piece of code to see how they work together. The starting point is an order checkout service written in “just make it work” style.</p>
          <h3>Starting code</h3>
          <Code lang="ts">{`class OrderService {
  async checkout(order: Order, paymentType: string) {
    // 1. validate
    if (order.items.length === 0) throw new Error("Empty order");

    // 2. price + discount
    let total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    if (order.coupon === "SALE10") total *= 0.9;

    // 3. payment: a new provider means another else-if
    if (paymentType === "momo") {
      await fetch("https://momo.vn/pay", { method: "POST", body: JSON.stringify({ total }) });
    } else if (paymentType === "vnpay") {
      await fetch("https://vnpay.vn/pay", { method: "POST", body: JSON.stringify({ total }) });
    }

    // 4. persist: concrete DB created inline
    const db = new MySQLClient("mysql://...");
    await db.query("INSERT INTO orders ...", [order.id, total]);

    // 5. notify: concrete SMTP created inline
    const smtp = new SmtpClient("smtp.gmail.com");
    await smtp.send(order.email, "Order placed");
  }
}`}</Code>
          <p>One class does five jobs. Adding ZaloPay means editing the <code>if/else</code>. MySQL and SMTP are created with <code>new</code> inline, so there is no unit test without a real DB and mail server.</p>
          <h3>Step 1 · S: split by responsibility</h3>
          <p>Each part that changes for its own reason gets its own class. Changing pricing touches only <code>PriceCalculator</code>; changing the email template touches only <code>EmailNotifier</code>.</p>
          <Code lang="ts">{`class OrderValidator {
  validate(order: Order) {
    if (order.items.length === 0) throw new Error("Empty order");
  }
}

class PriceCalculator {
  calculate(order: Order): number {
    return order.items.reduce((s, i) => s + i.price * i.qty, 0);
  }
}

class MySQLOrderRepo { async save(order: Order, total: number) { /* SQL */ } }
class EmailNotifier  { async notify(to: string, msg: string) { /* SMTP */ } }`}</Code>
          <h3>Step 2 · O: replace if/else with an interface</h3>
          <p>Each payment provider is a class implementing one interface. A new provider is a new class; working code stays untouched.</p>
          <Code lang="ts">{`interface PaymentGateway {
  pay(amount: number): Promise<void>;
}

class MomoGateway  implements PaymentGateway { async pay(a: number) { /* call Momo */ } }
class VnpayGateway implements PaymentGateway { async pay(a: number) { /* call VNPay */ } }
// Adding ZaloPay = one new class, no existing code touched
class ZaloGateway  implements PaymentGateway { async pay(a: number) { /* call ZaloPay */ } }

// Same idea for discounts
interface Discount { apply(total: number): number }
class PercentDiscount implements Discount {
  constructor(private pct: number) {}
  apply(t: number) { return t * (1 - this.pct / 100); }
}
class NoDiscount implements Discount { apply(t: number) { return t; } }`}</Code>
          <h3>Step 3 · L: subclasses must keep the contract</h3>
          <p>Now add cash on delivery (COD). If its <code>pay()</code> throws, every caller relying on <code>PaymentGateway</code> breaks when handed COD.</p>
          <Code lang="ts">{`// Violation: anyone holding a PaymentGateway expects pay() to succeed
class CodGateway implements PaymentGateway {
  async pay(amount: number) {
    throw new Error("COD cannot pay online");
  }
}

// Fix: keep the contract, just handle it differently
class CodGateway implements PaymentGateway {
  async pay(amount: number) {
    await codLedger.record(amount); // "collect on delivery", no throw
  }
}`}</Code>
          <h3>Step 4 · I: small interfaces per capability</h3>
          <p>When refunds and installments arrive, do not cram them into one interface. Otherwise COD has to implement <code>refund()</code> and throw “not supported”, which breaks L again.</p>
          <Code lang="ts">{`// Too fat: not every provider supports refunds or installments
interface PaymentGateway {
  pay(amount: number): Promise<void>;
  refund(txId: string): Promise<void>;
  installment(months: number): Promise<void>;
}

// Split by capability
interface Payable     { pay(amount: number): Promise<void> }
interface Refundable  { refund(txId: string): Promise<void> }
interface Installable { installment(months: number): Promise<void> }

class VnpayGateway implements Payable, Refundable, Installable { /* ... */ }
class CodGateway   implements Payable { /* only what it can do */ }`}</Code>
          <h3>Step 5 · D: receive dependencies through the constructor</h3>
          <p><code>OrderService</code> only knows interfaces. Choosing concrete classes moves to a single place: the composition root.</p>
          <Code lang="ts">{`interface OrderRepo { save(order: Order, total: number): Promise<void> }
interface Notifier  { notify(to: string, msg: string): Promise<void> }

class OrderService {
  constructor(
    private validator: OrderValidator,
    private calc: PriceCalculator,
    private payment: Payable,    // Momo? VNPay? does not care
    private repo: OrderRepo,     // MySQL? Postgres? does not care
    private notifier: Notifier,  // email? SMS? does not care
  ) {}

  async checkout(order: Order, discount: Discount) {
    this.validator.validate(order);
    const total = discount.apply(this.calc.calculate(order));
    await this.payment.pay(total);
    await this.repo.save(order, total);
    await this.notifier.notify(order.email, "Order placed");
  }
}`}</Code>
          <p>Which makes unit tests a matter of passing fakes:</p>
          <Code lang="ts">{`// Composition root: the only place that knows concrete classes
const service = new OrderService(
  new OrderValidator(),
  new PriceCalculator(),
  new MomoGateway(),
  new MySQLOrderRepo(db),
  new EmailNotifier(smtp),
);

// Unit test: pass fakes, no DB / SMTP / Momo needed
const notify = jest.fn();
const testService = new OrderService(
  new OrderValidator(), new PriceCalculator(),
  { pay: async () => {} },
  { save: async () => {} },
  { notify },
);`}</Code>
          <h3>Before and after</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Change</th>
                  <th>Before</th>
                  <th>After</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Add ZaloPay</b></td>
                  <td>Edit the <code>if/else</code> in <code>checkout</code></td>
                  <td>Add 1 class</td>
                </tr>
                <tr>
                  <td><b>MySQL → Postgres</b></td>
                  <td>Edit <code>OrderService</code></td>
                  <td>Write <code>PostgresOrderRepo</code>, change 1 line in the composition root</td>
                </tr>
                <tr>
                  <td><b>Email → SMS</b></td>
                  <td>Edit <code>OrderService</code></td>
                  <td>Write <code>SmsNotifier</code></td>
                </tr>
                <tr>
                  <td><b>Unit test</b></td>
                  <td>Needs a real DB, SMTP, Momo</td>
                  <td>Pass fakes to the constructor</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note"><b>Do not apply it mechanically.</b> Splitting a small script or single-implementation logic into ten interfaces is over-engineering. Split only when there is a <b>real reason to change</b>: several payment providers, tests, swappable infrastructure.</div>
        </section>
        <section id="pr-more">
          <h2><span className="n">08</span>Other principles</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Principle</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Composition over inheritance</b></td>
                  <td>Compose objects instead of deep inheritance. Most GoF patterns rest on this idea.</td>
                </tr>
                <tr>
                  <td><b>DRY</b></td>
                  <td>Every piece of knowledge lives in one place. But two pieces of code that look alike by coincidence need not be merged.</td>
                </tr>
                <tr>
                  <td><b>KISS</b></td>
                  <td>The simplest solution that works is usually the best.</td>
                </tr>
                <tr>
                  <td><b>YAGNI</b></td>
                  <td>Don't build for imagined future needs.</td>
                </tr>
                <tr>
                  <td><b>Law of Demeter</b></td>
                  <td>Talk only to “close neighbors”: avoid <code>order.customer.address.city.name</code>.</td>
                </tr>
                <tr>
                  <td><b>Tell, don't ask</b></td>
                  <td>Tell an object to do the work instead of pulling its data out and deciding yourself.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
