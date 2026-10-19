import { Code } from "@/components/Code";

export default function BehavioralPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Behavioral: cách đối tượng phối hợp">
        <div className="label">Mục lục</div>
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
          <h1>Behavioral: cách đối tượng phối hợp</h1>
          <p className="lede">Mười một pattern về chia trách nhiệm và giao tiếp giữa các đối tượng: ai làm gì, ai báo cho ai.</p>
        </header>
        <section>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Tên Việt</th>
                  <th>Ý tưởng một câu</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><a className="plink" href="#bh-chain">Chain of Responsibility</a></td>
                  <td>Chuỗi xử lý</td>
                  <td>Xếp các handler thành chuỗi; mỗi handler xử lý rồi quyết định chuyển tiếp hay dừng.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-command">Command</a></td>
                  <td>Đóng gói yêu cầu</td>
                  <td>Biến mỗi thao tác thành một đối tượng chứa đủ thông tin để thực hiện và hoàn tác.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-iterator">Iterator</a></td>
                  <td>Duyệt tuần tự</td>
                  <td>Cung cấp một cách lấy phần tử tiếp theo theo chuẩn chung. JavaScript có sẵn giao thức iterator và generator.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-mediator">Mediator</a></td>
                  <td>Trung gian điều phối</td>
                  <td>Các thành phần chỉ nói chuyện với một mediator; mediator quyết định ai cần phản ứng.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-memento">Memento</a></td>
                  <td>Lưu trạng thái</td>
                  <td>Đối tượng tự xuất một bản chụp trạng thái (chỉ đọc) và tự khôi phục từ bản chụp đó.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-observer">Observer</a></td>
                  <td>Người quan sát</td>
                  <td>Đối tượng giữ danh sách subscriber và thông báo cho tất cả khi có sự kiện.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-state">State</a></td>
                  <td>Trạng thái</td>
                  <td>Mỗi trạng thái là một đối tượng tự quyết định hành vi và trạng thái kế tiếp.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-strategy">Strategy</a></td>
                  <td>Chiến lược</td>
                  <td>Mỗi thuật toán là một đối tượng hoặc hàm cùng interface; nơi dùng nhận vào và gọi.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-template-method">Template Method</a></td>
                  <td>Khuôn mẫu</td>
                  <td>Lớp cha định nghĩa trình tự cố định; lớp con hiện thực các bước riêng.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-visitor">Visitor</a></td>
                  <td>Khách thăm</td>
                  <td>Đưa mỗi thao tác vào một visitor có hàm riêng cho từng loại phần tử. Trong TypeScript, discriminated union kèm switch đạt cùng mục tiêu gọn hơn.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#bh-interpreter">Interpreter</a></td>
                  <td>Thông dịch</td>
                  <td>Biểu diễn mỗi quy tắc ngữ pháp bằng một đối tượng có hàm <code>interpret</code>, ghép lại thành cây.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="bh-chain">
          <h2><span className="n">01</span>Chain of Responsibility <small className="vn">Chuỗi xử lý</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Một request cần qua nhiều bước kiểm tra (xác thực, phân quyền, validate), bước nào cũng có thể dừng lại.</div>
            <div><span className="pl">Ý tưởng</span>Xếp các handler thành chuỗi; mỗi handler xử lý rồi quyết định chuyển tiếp hay dừng.</div>
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
            <div><span className="pl">Khi nào dùng</span>Middleware HTTP (Express, Koa), pipeline xử lý sự kiện, duyệt đơn nhiều cấp.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Chuỗi dài khó debug; request có thể đi hết chuỗi mà không ai xử lý.</div>
          </div>
        </section>
        <section id="bh-command">
          <h2><span className="n">02</span>Command <small className="vn">Đóng gói yêu cầu</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Muốn xếp hàng, ghi log, hoàn tác (undo) hoặc thực hiện lại các thao tác.</div>
            <div><span className="pl">Ý tưởng</span>Biến mỗi thao tác thành một đối tượng chứa đủ thông tin để thực hiện và hoàn tác.</div>
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
h.run(new AddItem(cart, "Phở"));
h.run(new AddItem(cart, "Trà"));
h.undo();            // cart = ["Phở"]`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Undo/redo, hàng đợi tác vụ, macro, ghi lại thao tác. Message trong RabbitMQ chứa lệnh cũng là Command được tuần tự hóa.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Mỗi thao tác một lớp nên số lớp tăng nhanh; với thao tác đơn giản, một hàm là đủ.</div>
          </div>
        </section>
        <section id="bh-iterator">
          <h2><span className="n">03</span>Iterator <small className="vn">Duyệt tuần tự</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Muốn duyệt qua một tập hợp (cây, danh sách phân trang từ API) mà không lộ cấu trúc bên trong.</div>
            <div><span className="pl">Ý tưởng</span>Cung cấp một cách lấy phần tử tiếp theo theo chuẩn chung. JavaScript có sẵn giao thức iterator và generator.</div>
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
            <div><span className="pl">Khi nào dùng</span>Duyệt dữ liệu phân trang, đọc file lớn theo dòng, duyệt cây.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Đã có sẵn trong ngôn ngữ; hiếm khi phải tự viết lớp Iterator riêng.</div>
          </div>
        </section>
        <section id="bh-mediator">
          <h2><span className="n">04</span>Mediator <small className="vn">Trung gian điều phối</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Nhiều thành phần gọi qua lại lẫn nhau tạo thành mạng phụ thuộc rối.</div>
            <div><span className="pl">Ý tưởng</span>Các thành phần chỉ nói chuyện với một mediator; mediator quyết định ai cần phản ứng.</div>
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
            <div><span className="pl">Khi nào dùng</span>Form có các trường phụ thuộc nhau, chat room, điều phối workflow. Orchestrator trong Saga là mediator ở cấp hệ thống.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Mediator có thể ôm hết logic và trở nên khổng lồ.</div>
          </div>
        </section>
        <section id="bh-memento">
          <h2><span className="n">05</span>Memento <small className="vn">Lưu trạng thái</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Cần lưu và khôi phục trạng thái của đối tượng mà không để bên ngoài sửa trực tiếp nội tạng của nó.</div>
            <div><span className="pl">Ý tưởng</span>Đối tượng tự xuất một bản chụp trạng thái (chỉ đọc) và tự khôi phục từ bản chụp đó.</div>
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
            <div><span className="pl">Khi nào dùng</span>Hoàn tác thao tác trên giỏ hàng, lưu nháp đơn hàng, rollback cấu hình.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Bản chụp lớn và nhiều thì tốn bộ nhớ; cân nhắc lưu chênh lệch hoặc giới hạn số bản.</div>
          </div>
        </section>
        <section id="bh-observer">
          <h2><span className="n">06</span>Observer <small className="vn">Người quan sát</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Khi một đối tượng thay đổi, nhiều nơi khác cần biết, nhưng không muốn đối tượng đó phải biết từng nơi.</div>
            <div><span className="pl">Ý tưởng</span>Đối tượng giữ danh sách subscriber và thông báo cho tất cả khi có sự kiện.</div>
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
            <div><span className="pl">Khi nào dùng</span>Sự kiện UI, reactive state, domain event trong một service. Kafka, RabbitMQ fanout, NATS là Observer phân tán qua mạng.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Khó lần theo luồng chạy; nhớ hủy đăng ký để tránh rò rỉ bộ nhớ.</div>
          </div>
        </section>
        <section id="bh-state">
          <h2><span className="n">07</span>State <small className="vn">Trạng thái</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Hành vi thay đổi theo trạng thái, code đầy <code>if (status === …)</code> lặp lại ở mọi phương thức.</div>
            <div><span className="pl">Ý tưởng</span>Mỗi trạng thái là một đối tượng tự quyết định hành vi và trạng thái kế tiếp.</div>
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
    if (!next) throw new Error(\`Không thể \${action} khi đơn đang \${this.status}\`);
    this.status = next;
  }
}

const o = new Order();
o.apply("pay");
o.apply("ship");
o.apply("cancel"); // throws`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Vòng đời đơn hàng, thanh toán, kết nối mạng, quy trình duyệt. Circuit Breaker cũng là một state machine.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Ít trạng thái và hành vi đơn giản thì một bảng chuyển trạng thái như trên gọn hơn nhiều lớp State.</div>
          </div>
        </section>
        <section id="bh-strategy">
          <h2><span className="n">08</span>Strategy <small className="vn">Chiến lược</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Một việc có nhiều thuật toán thay thế (tính phí ship, giảm giá, sắp xếp) và phải chọn lúc chạy.</div>
            <div><span className="pl">Ý tưởng</span>Mỗi thuật toán là một đối tượng hoặc hàm cùng interface; nơi dùng nhận vào và gọi.</div>
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
            <div><span className="pl">Khi nào dùng</span>Thuật toán thay được: giá, xác thực, nén, sắp xếp, retry policy.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Trong TypeScript, strategy thường chỉ là một hàm; không cần cả cây lớp.</div>
          </div>
        </section>
        <section id="bh-template-method">
          <h2><span className="n">09</span>Template Method <small className="vn">Khuôn mẫu</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Nhiều quy trình có cùng khung các bước, chỉ khác nhau vài bước.</div>
            <div><span className="pl">Ý tưởng</span>Lớp cha định nghĩa trình tự cố định; lớp con hiện thực các bước riêng.</div>
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
            <div><span className="pl">Khi nào dùng</span>Import/export dữ liệu, xử lý request có khung chung, test fixture.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Dựa vào kế thừa nên cứng; nhiều khi truyền các bước vào dưới dạng hàm (Strategy) linh hoạt hơn.</div>
          </div>
        </section>
        <section id="bh-visitor">
          <h2><span className="n">10</span>Visitor <small className="vn">Khách thăm</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Cần thêm nhiều thao tác mới (xuất JSON, tính giá, kiểm tra) lên một cấu trúc đối tượng ổn định mà không sửa từng lớp.</div>
            <div><span className="pl">Ý tưởng</span>Đưa mỗi thao tác vào một visitor có hàm riêng cho từng loại phần tử. Trong TypeScript, discriminated union kèm switch đạt cùng mục tiêu gọn hơn.</div>
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
    case "gift":    return \`\${i.name} (quà tặng)\`;
  }
};

const combo: CartItem = { kind: "bundle", name: "Combo học tập", discount: 0.1, items: [
  { kind: "product", name: "Laptop", price: 20_000_000 },
  { kind: "product", name: "Chuột", price: 500_000 },
  { kind: "gift", name: "Túi chống sốc" },
] };
describe(combo); // Combo học tập [Laptop, Chuột, Túi chống sốc (quà tặng)]
price(combo);    // 18450000`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Cùng một giỏ hàng cần tính giá, in hoá đơn, xuất JSON; AST của compiler, linter.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Thêm loại phần tử mới thì phải sửa mọi visitor. Với TypeScript, bật kiểm tra exhaustive để compiler nhắc.</div>
          </div>
        </section>
        <section id="bh-interpreter">
          <h2><span className="n">11</span>Interpreter <small className="vn">Thông dịch</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Có một ngôn ngữ nhỏ (luật giảm giá, bộ lọc tìm kiếm) cần đọc và chạy.</div>
            <div><span className="pl">Ý tưởng</span>Biểu diễn mỗi quy tắc ngữ pháp bằng một đối tượng có hàm <code>interpret</code>, ghép lại thành cây.</div>
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
            <div><span className="pl">Khi nào dùng</span>Luật nghiệp vụ cấu hình được, bộ lọc truy vấn, biểu thức tính toán.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Ngôn ngữ lớn thì dùng parser generator; pattern này hợp với ngữ pháp nhỏ.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
