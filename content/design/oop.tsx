import { Code } from "@/components/Code";

export default function OopPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục OOP">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#oop-class"><span>01</span>{"Class & Object"}</a></li>
          <li><a href="#oop-pillars"><span>02</span>4 tính chất OOP</a></li>
          <li><a href="#oop-encap"><span>03</span>{"Đóng gói & access modifier"}</a></li>
          <li><a href="#oop-static"><span>04</span>Static</a></li>
          <li><a href="#oop-inherit"><span>05</span>Kế thừa</a></li>
          <li><a href="#oop-abstract"><span>06</span>{"Abstract class & Interface"}</a></li>
          <li><a href="#oop-poly"><span>07</span>{"Đa hình & Generics"}</a></li>
          <li><a href="#oop-relation"><span>08</span>Quan hệ giữa các lớp</a></li>
          <li><a href="#oop-ts"><span>09</span>Điểm riêng của TypeScript</a></li>
          <li><a href="#oop-cheat"><span>10</span>Bảng từ khóa</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · nền tảng</div>
          <h1>OOP: nền móng của mọi design pattern</h1>
          <p className="lede">Lập trình hướng đối tượng gom <b>dữ liệu</b> và <b>hành vi</b> xử lý dữ liệu đó vào cùng một đơn vị gọi là đối tượng. Design pattern chính là những cách kết hợp class, interface, kế thừa và đa hình đã được kiểm chứng, nên cần nắm chắc phần này trước.</p>
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
          <p><b>Class</b> là bản thiết kế, <b>object</b> (instance) là thứ được tạo ra từ bản thiết kế đó bằng <code>new</code>. Mỗi object có dữ liệu riêng nhưng dùng chung các method của class.</p>
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

const pho = new Product("Phở bò", 50_000);   // an object (instance)
const tra = new Product("Trà đá", 5_000);    // another, with its own data
pho.priceWithVat(); // 55000

// Shorthand: parameter properties declare and assign in one line
class Customer {
  constructor(public readonly id: string, private email: string) {}
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Thuật ngữ</th>
                  <th>Ý nghĩa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Property / field</b></td>
                  <td>Dữ liệu của object (<code>name</code>, <code>price</code>).</td>
                </tr>
                <tr>
                  <td><b>Method</b></td>
                  <td>Hàm thuộc về object, dùng <code>this</code> để truy cập dữ liệu của chính nó.</td>
                </tr>
                <tr>
                  <td><b>Constructor</b></td>
                  <td>Hàm khởi tạo, chạy khi gọi <code>new</code>; mỗi class chỉ có một.</td>
                </tr>
                <tr>
                  <td><b>this</b></td>
                  <td>Trỏ tới object đang gọi method.</td>
                </tr>
                <tr>
                  <td><b>Instance</b></td>
                  <td>Một object cụ thể được tạo từ class.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="oop-pillars">
          <h2><span className="n">02</span>4 tính chất của OOP</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Tính chất</th>
                  <th>Ý nghĩa</th>
                  <th>Công cụ trong TypeScript</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Đóng gói</b> (Encapsulation)</td>
                  <td>Giấu dữ liệu bên trong, chỉ cho thay đổi qua method có kiểm soát</td>
                  <td><code>private</code>, <code>#field</code>, <code>readonly</code>, getter/setter</td>
                </tr>
                <tr>
                  <td><b>Kế thừa</b> (Inheritance)</td>
                  <td>Lớp con nhận lại thuộc tính, method của lớp cha và mở rộng thêm</td>
                  <td><code>extends</code>, <code>super</code>, <code>override</code></td>
                </tr>
                <tr>
                  <td><b>Đa hình</b> (Polymorphism)</td>
                  <td>Cùng một lời gọi, mỗi đối tượng phản ứng theo cách riêng</td>
                  <td>override method, interface, generics</td>
                </tr>
                <tr>
                  <td><b>Trừu tượng</b> (Abstraction)</td>
                  <td>Chỉ lộ ra “làm được gì”, giấu “làm thế nào”</td>
                  <td><code>interface</code>, <code>abstract class</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="oop-encap">
          <h2><span className="n">03</span>{"Đóng gói & access modifier"}</h2>
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
                  <th>Lớp con</th>
                  <th>Bên ngoài</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">public</td>
                  <td>Có</td>
                  <td>Có</td>
                  <td>Có</td>
                  <td>Mặc định nếu không ghi</td>
                </tr>
                <tr>
                  <td className="m">protected</td>
                  <td>Có</td>
                  <td>Có</td>
                  <td>Không</td>
                  <td>Dành cho kế thừa</td>
                </tr>
                <tr>
                  <td className="m">private</td>
                  <td>Có</td>
                  <td>Không</td>
                  <td>Không</td>
                  <td>Chỉ kiểm tra lúc biên dịch; JavaScript chạy vẫn truy cập được</td>
                </tr>
                <tr>
                  <td className="m">#field</td>
                  <td>Có</td>
                  <td>Không</td>
                  <td>Không</td>
                  <td>Private thật của JavaScript, chặn cả lúc chạy</td>
                </tr>
                <tr>
                  <td className="m">readonly</td>
                  <td colSpan={3}>Không giới hạn truy cập, chỉ cấm gán lại sau constructor</td>
                  <td>Kết hợp được: <code>private readonly</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Nguyên tắc:</b> mặc định để <code>private</code>, chỉ mở ra khi thật cần. Không tạo getter/setter cho mọi field theo phản xạ; method nên thể hiện hành động nghiệp vụ (<code>topUp</code>, <code>pay</code>) thay vì <code>setBalance</code>.</div>
        </section>
        <section id="oop-static">
          <h2><span className="n">04</span>Static: thuộc về class, không thuộc về object</h2>
          <p>Thành viên <code>static</code> gắn với <b>chính class</b>, chỉ có một bản dùng chung, gọi qua tên class (<code>Order.count</code>) mà không cần tạo object. Thành viên thường (instance) thì mỗi object có một bản riêng.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 252" role="img" aria-label="Class Order giữ phần static count, MAX_ITEMS, fromJson, isValidSku dùng chung; object a và b mỗi cái có id và items riêng"> <defs><marker id="osb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker></defs> <rect className="s-hl" x="30" y="24" width="320" height="216" rx="8" /> <text className="s-tb" x="46" y="50" style={{ fontSize: "15px" }}>class Order</text> <text className="s-lane" x="46" y="76">STATIC · MỘT BẢN DÙNG CHUNG</text> <text className="s-tm" x="46" y="98" style={{ fill: "var(--ink)" }}>count = 2</text> <text className="s-tm" x="46" y="116" style={{ fill: "var(--ink)" }}>MAX_ITEMS = 50</text> <text className="s-tm" x="46" y="134" style={{ fill: "var(--ink)" }}>fromJson()</text> <text className="s-tm" x="46" y="152" style={{ fill: "var(--ink)" }}>isValidSku()</text> <path d="M42 176 H338" style={{ stroke: "var(--accent)", strokeWidth: "1", strokeDasharray: "3 3" }} /> <text className="s-lane" x="46" y="198">METHOD · TRÊN PROTOTYPE</text> <text className="s-tm" x="46" y="220" style={{ fill: "var(--ink)" }}>addItem(sku)</text> <rect className="s-box" x="520" y="34" width="210" height="88" rx="8" /> <text className="s-tb" x="536" y="60">object a</text> <text className="s-tm" x="536" y="84" style={{ fill: "var(--ink)" }}>id = 1</text> <text className="s-tm" x="536" y="104" style={{ fill: "var(--ink)" }}>items = ["PHO-001"]</text> <path className="s-dl" d="M518 78 C440 78 430 132 352 132" markerEnd="url(#osb)" /> <rect className="s-box" x="520" y="140" width="210" height="88" rx="8" /> <text className="s-tb" x="536" y="166">object b</text> <text className="s-tm" x="536" y="190" style={{ fill: "var(--ink)" }}>id = 2</text> <text className="s-tm" x="536" y="210" style={{ fill: "var(--ink)" }}>items = []</text> <path className="s-dl" d="M518 184 C440 184 430 132 352 132" markerEnd="url(#osb)" /> <text className="s-tm" x="362" y="158">dùng chung</text> <text className="s-tm" x="748" y="70">mỗi object có</text> <text className="s-tm" x="748" y="88">dữ liệu riêng</text> <text className="s-tm" x="748" y="176">new Order() lần 2</text> <text className="s-tm" x="748" y="194">→ count tăng cho cả lớp</text> </svg>
            </div>
            <figcaption>Static nằm ở class nên chỉ có một bản; field instance nằm trên từng object. Method thường cũng dùng chung qua prototype, nhưng chạy với <code>this</code> của từng object.</figcaption>
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
                  <td><b>Thuộc về</b></td>
                  <td>Từng object</td>
                  <td>Class</td>
                </tr>
                <tr>
                  <td><b>Số bản</b></td>
                  <td>Mỗi object một bản</td>
                  <td>Một bản duy nhất</td>
                </tr>
                <tr>
                  <td><b>Gọi bằng</b></td>
                  <td><code>obj.method()</code></td>
                  <td><code>ClassName.method()</code></td>
                </tr>
                <tr>
                  <td><b>Có <code>this</code> là object?</b></td>
                  <td>Có</td>
                  <td>Không (<code>this</code> là chính class)</td>
                </tr>
                <tr>
                  <td><b>Truy cập thành viên kia</b></td>
                  <td>Đọc được static qua tên class</td>
                  <td>Không đọc được field instance (vì không có object)</td>
                </tr>
                <tr>
                  <td><b>Kế thừa</b></td>
                  <td>Có</td>
                  <td>Có, lớp con gọi được <code>Child.staticMethod()</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Khi nào dùng static</h3>
          <ul className="plain">
            <li><b>Hằng số của class</b>: <code>Order.MAX_ITEMS</code>.</li>
            <li><b>Factory method có tên</b>: <code>Order.fromJson()</code>, <code>Money.fromVnd()</code>, rõ nghĩa hơn nhiều constructor.</li>
            <li><b>Hàm tiện ích thuần</b> không cần dữ liệu object: <code>Order.isValidSku()</code>.</li>
            <li><b>Đếm, cache, registry dùng chung</b>: số object đã tạo, bảng tra cứu.</li>
            <li><b>Singleton</b>: <code>static instance</code> + <code>static get()</code> (xem tab Creational).</li>
          </ul>
          <div className="note"><b>Cẩn thận với static có trạng thái:</b> nó là biến toàn cục đội lốt class. Test chạy song song có thể dính dữ liệu của nhau, và không thay được bằng bản giả. Trong TypeScript, hàm tiện ích thuần thường nên là <code>export function</code> trong module thay vì class chỉ toàn static.</div>
        </section>
        <section id="oop-inherit">
          <h2><span className="n">05</span>Kế thừa</h2>
          <Code lang="ts">{`class Customer {
  constructor(public name: string, protected points: number) {}

  // Loyal customers (1000+ points) get 2% off
  discountRate(): number { return this.points >= 1_000 ? 0.02 : 0; }
  describe() { return \`\${this.name}: giảm \${Math.round(this.discountRate() * 100)}%\`; }
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
vip.describe();  // "Lan: giảm 12%" — parent method calls the overridden discountRate()`}</Code>
          <ul className="plain">
            <li>Một class chỉ <code>extends</code> được <b>một</b> class cha, nhưng <code>implements</code> được nhiều interface.</li>
            <li>Bật <code>noImplicitOverride</code> trong tsconfig để bắt buộc ghi <code>override</code>, tránh vô tình ghi đè.</li>
            <li>Kế thừa thể hiện quan hệ <b>“là một”</b> (VipCustomer là một Customer). Nếu chỉ là “có một” hay “dùng một” thì dùng composition.</li>
          </ul>
          <div className="note"><b>Kế thừa sâu là nguồn rắc rối:</b> sửa lớp cha làm vỡ lớp con ở xa (fragile base class). Ưu tiên composition, phần lớn pattern GoF được sinh ra để tránh kế thừa cứng nhắc.</div>
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
  method() { return "Thẻ"; }
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
                  <td><b>Chứa code</b></td>
                  <td>Không, chỉ mô tả hình dạng</td>
                  <td>Có, kết hợp method cụ thể và abstract</td>
                </tr>
                <tr>
                  <td><b>Tạo object bằng new</b></td>
                  <td>Không</td>
                  <td>Không</td>
                </tr>
                <tr>
                  <td><b>Một class dùng được</b></td>
                  <td>Nhiều (<code>implements A, B</code>)</td>
                  <td>Một (<code>extends</code>)</td>
                </tr>
                <tr>
                  <td><b>Constructor, field có giá trị</b></td>
                  <td>Không</td>
                  <td>Có</td>
                </tr>
                <tr>
                  <td><b>Còn lại khi chạy JavaScript</b></td>
                  <td>Không, bị xóa khi biên dịch</td>
                  <td>Có, là class thật</td>
                </tr>
                <tr>
                  <td><b>Dùng khi</b></td>
                  <td>Định nghĩa hợp đồng, port, khả năng</td>
                  <td>Chia sẻ code chung cho một họ lớp (Template Method)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="oop-poly">
          <h2><span className="n">07</span>{"Đa hình & Generics"}</h2>
          <h3>Đa hình qua interface và override</h3>
          <Code lang="ts">{`interface ShippingMethod { name: string; fee(weightKg: number): number; }

class Standard implements ShippingMethod {
  name = "Tiêu chuẩn";
  fee(kg: number) { return 20_000 + kg * 5_000; }
}
class Express implements ShippingMethod {
  name = "Hỏa tốc";
  constructor(private surcharge: number) {}
  fee(kg: number) { return 40_000 + kg * 8_000 + this.surcharge; }
}

// Same call, different behaviour per object
const methods: ShippingMethod[] = [new Standard(), new Express(15_000)];
methods.forEach(m => console.log(m.name, m.fee(2)));   // Tiêu chuẩn 30000, Hỏa tốc 71000`}</Code>
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
          <p>JavaScript không cho viết nhiều method cùng tên, nên TypeScript chỉ có <b>chữ ký overload</b> kèm một phần thân duy nhất.</p>
          <h3>Generics: đa hình theo kiểu dữ liệu</h3>
          <Code lang="ts">{`class Repository<T extends { id: string }> {
  private items = new Map<string, T>();
  save(item: T) { this.items.set(item.id, item); }
  find(id: string): T | undefined { return this.items.get(id); }
}

const products = new Repository<{ id: string; name: string }>();
products.save({ id: "p1", name: "Phở" });
products.find("p1")?.name;  // typed as string`}</Code>
        </section>
        <section id="oop-relation">
          <h2><span className="n">08</span>Quan hệ giữa các lớp</h2>
          <p>Khi đọc sơ đồ của các design pattern, bạn sẽ gặp sáu loại quan hệ UML dưới đây. Xếp từ lỏng đến chặt.</p>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 300" role="img" aria-label="Sáu ký hiệu quan hệ UML: dependency nét đứt mũi tên mở, association nét liền mũi tên mở, aggregation hình thoi rỗng, composition hình thoi đặc, inheritance tam giác rỗng nét liền, realization tam giác rỗng nét đứt"> <defs /> <text className="s-tb" x="20" y="42">Dependency <tspan className="s-tm">· dùng tạm</tspan></text> <rect className="s-box" x="20" y="56" width="120" height="40" rx="5" /><text className="s-tm" x="80" y="81" textAnchor="middle" style={{ fill: "var(--ink)" }}>Order</text> <rect className="s-box" x="310" y="56" width="120" height="40" rx="5" /><text className="s-tm" x="370" y="81" textAnchor="middle" style={{ fill: "var(--ink)" }}>Printer</text> <path d="M140 76 H310" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none", strokeDasharray: "6 4" }} /> <polyline points="299,70 310,76 299,82" style={{ fill: "none", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <text className="s-tb" x="470" y="42">Association <tspan className="s-tm">· biết đến</tspan></text> <rect className="s-box" x="470" y="56" width="120" height="40" rx="5" /><text className="s-tm" x="530" y="81" textAnchor="middle" style={{ fill: "var(--ink)" }}>Order</text> <rect className="s-box" x="760" y="56" width="120" height="40" rx="5" /><text className="s-tm" x="820" y="81" textAnchor="middle" style={{ fill: "var(--ink)" }}>Customer</text> <path d="M590 76 H760" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none" }} /> <polyline points="749,70 760,76 749,82" style={{ fill: "none", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <text className="s-tb" x="20" y="138">Aggregation <tspan className="s-tm">· có, sống độc lập</tspan></text> <rect className="s-box" x="20" y="152" width="120" height="40" rx="5" /><text className="s-tm" x="80" y="177" textAnchor="middle" style={{ fill: "var(--ink)" }}>Category</text> <rect className="s-box" x="310" y="152" width="120" height="40" rx="5" /><text className="s-tm" x="370" y="177" textAnchor="middle" style={{ fill: "var(--ink)" }}>Product</text> <polygon points="140,172 152,165 164,172 152,179" style={{ fill: "var(--surface)", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <path d="M164 172 H310" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none" }} /> <text className="s-tb" x="470" y="138">Composition <tspan className="s-tm">· gồm, sống chết cùng</tspan></text> <rect className="s-box" x="470" y="152" width="120" height="40" rx="5" /><text className="s-tm" x="530" y="177" textAnchor="middle" style={{ fill: "var(--ink)" }}>Order</text> <rect className="s-box" x="760" y="152" width="120" height="40" rx="5" /><text className="s-tm" x="820" y="177" textAnchor="middle" style={{ fill: "var(--ink)" }}>OrderLine</text> <polygon points="590,172 602,165 614,172 602,179" style={{ fill: "var(--ink)", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <path d="M614 172 H760" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none" }} /> <text className="s-tb" x="20" y="234">Inheritance <tspan className="s-tm">· là một</tspan></text> <rect className="s-box" x="20" y="248" width="120" height="40" rx="5" /><text className="s-tm" x="80" y="273" textAnchor="middle" style={{ fill: "var(--ink)" }}>VipCustomer</text> <rect className="s-box" x="310" y="248" width="120" height="40" rx="5" /><text className="s-tm" x="370" y="273" textAnchor="middle" style={{ fill: "var(--ink)" }}>Customer</text> <path d="M140 268 H310" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none" }} /> <polygon points="310,268 296,260 296,276" style={{ fill: "var(--surface)", stroke: "var(--ink)", strokeWidth: "1.3" }} /> <text className="s-tb" x="470" y="234">Realization <tspan className="s-tm">· hiện thực interface</tspan></text> <rect className="s-box" x="470" y="248" width="120" height="40" rx="5" /><text className="s-tm" x="530" y="273" textAnchor="middle" style={{ fill: "var(--ink)" }}>Parcel</text> <rect className="s-box" x="760" y="248" width="120" height="40" rx="5" /><text className="s-tm" x="820" y="273" textAnchor="middle" style={{ fill: "var(--ink)" }}>Shippable</text> <path d="M590 268 H760" style={{ stroke: "var(--ink)", strokeWidth: "1.3", fill: "none", strokeDasharray: "6 4" }} /> <polygon points="760,268 746,260 746,276" style={{ fill: "var(--surface)", stroke: "var(--ink)", strokeWidth: "1.3" }} /> </svg>
            </div>
            <figcaption>Hình thoi nằm ở phía “tổng thể”; tam giác chỉ về lớp cha hoặc interface. Nét đứt nghĩa là quan hệ yếu hơn hoặc chỉ là hợp đồng.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Quan hệ</th>
                  <th>Nghĩa</th>
                  <th>Trong code</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Dependency</b></td>
                  <td>“Dùng tạm”</td>
                  <td>Nhận làm tham số hoặc tạo trong một method, không giữ lại</td>
                </tr>
                <tr>
                  <td><b>Association</b></td>
                  <td>“Biết đến”</td>
                  <td>Giữ tham chiếu lâu dài: <code>order.customer</code></td>
                </tr>
                <tr>
                  <td><b>Aggregation</b></td>
                  <td>“Có”, phần sống độc lập</td>
                  <td>Category giữ danh sách Product; xóa Category, Product vẫn còn</td>
                </tr>
                <tr>
                  <td><b>Composition</b></td>
                  <td>“Gồm”, phần sống chết theo tổng thể</td>
                  <td>Order tự tạo OrderLine; xóa Order thì OrderLine mất theo</td>
                </tr>
                <tr>
                  <td><b>Inheritance</b></td>
                  <td>“Là một”</td>
                  <td><code>class VipCustomer extends Customer</code></td>
                </tr>
                <tr>
                  <td><b>Realization</b></td>
                  <td>“Hiện thực hợp đồng”</td>
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
          <h2><span className="n">09</span>Điểm riêng của TypeScript</h2>
          <ul className="plain">
            <li><b>Structural typing</b>: TypeScript so sánh theo <b>hình dạng</b>, không theo tên. Object nào có đủ <code>name</code> và <code>fee()</code> đều là <code>ShippingMethod</code>, không cần ghi <code>implements</code>. Ghi <code>implements</code> vẫn nên làm để compiler kiểm tra sớm.</li>
            <li><b>Class vừa là giá trị vừa là kiểu</b>: <code>Product</code> dùng được với <code>new</code> và cũng dùng làm kiểu <code>let p: Product</code>.</li>
            <li><b>Interface không tồn tại lúc chạy</b>: không dùng được <code>x instanceof ShippingMethod</code>; muốn kiểm tra thì viết type guard <code>{"(x): x is ShippingMethod => \"fee\" in x"}</code>.</li>
            <li><b>Mất <code>this</code></b>: truyền <code>obj.method</code> làm callback thì <code>this</code> bị mất. Dùng arrow function làm field (<code>{"handle = () => …"}</code>) hoặc <code>.bind(this)</code>.</li>
            <li><b>Dưới lớp vỏ là prototype</b>: method nằm trên <code>Product.prototype</code>, mọi object dùng chung; field nằm trên từng object.</li>
            <li>Không phải mọi thứ đều cần class. Hàm thuần và object literal thường gọn hơn cho logic không có trạng thái.</li>
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
          <h2><span className="n">10</span>Bảng từ khóa</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Từ khóa</th>
                  <th>Tác dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="m">class / new</td>
                  <td>Khai báo bản thiết kế / tạo object</td>
                </tr>
                <tr>
                  <td className="m">constructor</td>
                  <td>Hàm khởi tạo</td>
                </tr>
                <tr>
                  <td className="m">this</td>
                  <td>Object hiện tại (trong static: chính class)</td>
                </tr>
                <tr>
                  <td className="m">public / protected / private / #</td>
                  <td>Phạm vi truy cập</td>
                </tr>
                <tr>
                  <td className="m">readonly</td>
                  <td>Cấm gán lại sau khởi tạo</td>
                </tr>
                <tr>
                  <td className="m">static</td>
                  <td>Thành viên của class, dùng chung</td>
                </tr>
                <tr>
                  <td className="m">{"static { }"}</td>
                  <td>Khối khởi tạo chạy một lần cho class</td>
                </tr>
                <tr>
                  <td className="m">get / set</td>
                  <td>Thuộc tính tính toán, kiểm soát đọc ghi</td>
                </tr>
                <tr>
                  <td className="m">extends / super</td>
                  <td>Kế thừa / gọi lớp cha</td>
                </tr>
                <tr>
                  <td className="m">override</td>
                  <td>Khẳng định đang ghi đè method của lớp cha</td>
                </tr>
                <tr>
                  <td className="m">abstract</td>
                  <td>Class không tạo object được / method bắt buộc lớp con viết</td>
                </tr>
                <tr>
                  <td className="m">interface / implements</td>
                  <td>Hợp đồng / cam kết tuân theo hợp đồng</td>
                </tr>
                <tr>
                  <td className="m">instanceof</td>
                  <td>Kiểm tra object được tạo từ class nào (không dùng với interface)</td>
                </tr>
                <tr>
                  <td className="m">{"<T>"}</td>
                  <td>Generics: class hoặc hàm dùng được cho nhiều kiểu</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Tiếp theo:</b> tab <b>Nguyên tắc</b> (SOLID) cho biết dùng các công cụ trên thế nào cho đúng, rồi tới các tab pattern.</div>
        </section>
      </main>
    </div>
  );
}
