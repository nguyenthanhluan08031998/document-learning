import { Code } from "@/components/Code";

export default function CleanArchitecturePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Clean Architecture">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ca-layers"><span>01</span>Bốn vòng tròn</a></li>
          <li><a href="#ca-rule"><span>02</span>Dependency Rule</a></li>
          <li><a href="#ca-flow"><span>03</span>Luồng một request</a></li>
          <li><a href="#ca-code"><span>04</span>Code mẫu TypeScript</a></li>
          <li><a href="#ca-folder"><span>05</span>Cấu trúc thư mục</a></li>
          <li><a href="#ca-family"><span>06</span>{"Hexagonal & Onion"}</a></li>
          <li><a href="#ca-when"><span>07</span>Khi nào dùng, lỗi hay gặp</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">clean architecture · ghi chú học tập</div>
          <h1>Clean Architecture: nghiệp vụ ở giữa, framework ở rìa</h1>
          <p className="lede">Kiến trúc do Robert C. Martin (Uncle Bob) tổng hợp. Ý chính: code nghiệp vụ không được biết gì về database, web framework hay message broker. Nhờ vậy đổi Postgres sang MongoDB, Express sang NestJS, REST sang gRPC mà không phải sửa logic, và test nghiệp vụ không cần khởi động gì cả.</p>
          <div className="tape" aria-hidden="true">
            <div>frameworks</div>
            <div>adapters</div>
            <div>use cases</div>
            <div className="hw">entities</div>
          </div>
        </header>
        <section id="ca-layers">
          <h2><span className="n">01</span>Bốn vòng tròn</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 420" role="img" aria-label="Bốn vòng tròn đồng tâm: Entities ở giữa, rồi Use Cases, Interface Adapters, Frameworks and Drivers ở ngoài cùng; mũi tên phụ thuộc hướng vào tâm"> <defs><marker id="cra" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs> <circle cx="250" cy="214" r="196" style={{ fill: "var(--code-bg)", stroke: "var(--muted)", strokeWidth: "1.5" }} /> <circle cx="250" cy="214" r="148" style={{ fill: "var(--new-soft)", stroke: "var(--new)", strokeWidth: "1.5" }} /> <circle cx="250" cy="214" r="100" style={{ fill: "var(--warn-soft)", stroke: "var(--warn)", strokeWidth: "1.5" }} /> <circle cx="250" cy="214" r="52" style={{ fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: "1.5" }} /> <text className="s-tb" x="250" y="40" textAnchor="middle" style={{ fontSize: "13px", fill: "var(--muted)" }}>{"Frameworks & Drivers"}</text> <text className="s-tb" x="250" y="88" textAnchor="middle" style={{ fontSize: "13px", fill: "var(--new)" }}>Interface Adapters</text> <text className="s-tb" x="250" y="136" textAnchor="middle" style={{ fontSize: "13px", fill: "var(--warn)" }}>Use Cases</text> <text className="s-tb" x="250" y="218" textAnchor="middle" style={{ fontSize: "13px", fill: "var(--accent)" }}>Entities</text> <path className="s-ln" d="M80 120 L150 160" markerEnd="url(#cra)" /> <path className="s-ln" d="M420 120 L350 160" markerEnd="url(#cra)" /> <path className="s-ln" d="M80 310 L150 270" markerEnd="url(#cra)" /> <path className="s-ln" d="M420 310 L350 270" markerEnd="url(#cra)" /> <circle cx="500" cy="70" r="7" style={{ fill: "var(--accent)" }} /> <text className="s-tb" x="516" y="75">Entities</text> <text className="s-tm" x="516" y="94">Order, Money, quy tắc nghiệp vụ</text> <circle cx="500" cy="136" r="7" style={{ fill: "var(--warn)" }} /> <text className="s-tb" x="516" y="141">Use Cases</text> <text className="s-tm" x="516" y="160">PlaceOrder, port OrderRepository</text> <circle cx="500" cy="202" r="7" style={{ fill: "var(--new)" }} /> <text className="s-tb" x="516" y="207">Interface Adapters</text> <text className="s-tm" x="516" y="226">Controller, PostgresOrderRepository</text> <circle cx="500" cy="268" r="7" style={{ fill: "var(--muted)" }} /> <text className="s-tb" x="516" y="273">{"Frameworks & Drivers"}</text> <text className="s-tm" x="516" y="292">Express, Prisma, KafkaJS, gRPC</text> <text className="s-tm" x="500" y="350" style={{ fill: "var(--accent)" }}>→ mũi tên: phụ thuộc chỉ hướng vào trong</text> </svg>
            </div>
            <figcaption>Càng vào trong càng ổn định và trừu tượng; càng ra ngoài càng cụ thể và dễ thay.</figcaption>
          </figure>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Vòng</th>
                  <th>Chứa gì</th>
                  <th>Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Entities</b></td>
                  <td>Quy tắc nghiệp vụ cốt lõi, đúng với mọi ứng dụng của doanh nghiệp</td>
                  <td><code>Order</code> tự tính tổng tiền, không cho thêm món khi đã thanh toán</td>
                </tr>
                <tr>
                  <td><b>Use Cases</b></td>
                  <td>Quy trình của ứng dụng, điều phối entity, định nghĩa <b>port</b> (interface) mình cần</td>
                  <td><code>PlaceOrder</code>, <code>CancelOrder</code>, interface <code>OrderRepository</code></td>
                </tr>
                <tr>
                  <td><b>Interface Adapters</b></td>
                  <td>Chuyển dữ liệu giữa định dạng của use case và định dạng bên ngoài</td>
                  <td>Controller, presenter, <code>PostgresOrderRepository</code>, Kafka publisher</td>
                </tr>
                <tr>
                  <td><b>{"Frameworks & Drivers"}</b></td>
                  <td>Công cụ cụ thể, nằm ngoài cùng, dễ thay nhất</td>
                  <td>Express, NestJS, Prisma, pg driver, KafkaJS, gRPC server</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="ca-rule">
          <h2><span className="n">02</span>Dependency Rule</h2>
          <p><b>Phụ thuộc trong code chỉ được hướng vào trong.</b> Vòng trong không import, không nhắc tên bất cứ thứ gì ở vòng ngoài: không <code>import express</code>, không kiểu dữ liệu của Prisma, không annotation của ORM.</p>
          <p>Nhưng lúc chạy, use case vẫn phải gọi ra database ở vòng ngoài. Cách giải là <b>Dependency Inversion</b>: use case định nghĩa interface (port), vòng ngoài hiện thực interface đó (adapter), và một chỗ duy nhất gọi là <b>composition root</b> nối chúng lại.</p>
          <div className="note tip"><b>Dữ liệu qua ranh giới</b> nên là object đơn giản (DTO), không truyền nguyên request của Express hay row của ORM vào use case.</div>
        </section>
        <section id="ca-flow">
          <h2><span className="n">03</span>Luồng một request</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 270" role="img" aria-label="Controller gọi use case PlaceOrder; use case dùng entity Order và port OrderRepository; PostgresOrderRepo hiện thực port"> <defs><marker id="cfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker><marker id="cfb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" /></marker></defs> <rect className="s-box" x="16" y="118" width="160" height="56" rx="7" /><text className="s-tb" x="28" y="142">OrderController</text><text className="s-tm" x="28" y="160">Express · adapter</text> <rect className="s-hl" x="236" y="118" width="160" height="56" rx="7" /><text className="s-tb" x="248" y="142">PlaceOrder</text><text className="s-tm" x="248" y="160">use case</text> <rect className="s-disk" x="470" y="40" width="180" height="56" rx="7" /><text className="s-tb" x="482" y="64">OrderRepository</text><text className="s-tm" x="482" y="82">«interface» · port</text> <rect className="s-hl" x="470" y="196" width="180" height="56" rx="7" /><text className="s-tb" x="482" y="220">Order</text><text className="s-tm" x="482" y="238">entity</text> <rect className="s-box" x="712" y="40" width="176" height="56" rx="7" /><text className="s-tb" x="724" y="64">PostgresOrderRepo</text><text className="s-tm" x="724" y="82">adapter · pg</text> <path className="s-ln" d="M176 146 H234" markerEnd="url(#cfa)" /> <text className="s-tm" x="182" y="138">gọi</text> <path className="s-ln" d="M396 136 C430 136 430 68 468 68" markerEnd="url(#cfa)" /> <path className="s-ln" d="M396 156 C430 156 430 224 468 224" markerEnd="url(#cfa)" /> <path className="s-dl2" d="M712 68 H652" markerEnd="url(#cfb)" /> <text className="s-tm" x="640" y="112" style={{ fill: "var(--warn)" }}>hiện thực ←</text> <text className="s-tm" x="470" y="130">lúc chạy: use case gọi port,</text> <text className="s-tm" x="470" y="148">thực tế chạy vào Postgres</text> <text className="s-tm" x="712" y="136" style={{ fill: "var(--warn)" }}>trong code: adapter</text> <text className="s-tm" x="712" y="154" style={{ fill: "var(--warn)" }}>phụ thuộc interface</text> </svg>
            </div>
            <figcaption>Luồng gọi đi ra ngoài (xanh), nhưng phụ thuộc trong code luôn hướng vào trong (cam): Postgres biết interface, interface không biết Postgres.</figcaption>
          </figure>
          <ol className="steps">
            <li>
              <div><b>Controller</b> (adapter)<div className="d">Nhận HTTP request, đọc và kiểm tra định dạng, chuyển thành input DTO.</div></div>
            </li>
            <li>
              <div><b>Use case</b><div className="d">Chạy quy trình: tải entity qua port, gọi quy tắc của entity, lưu lại qua port, phát sự kiện.</div></div>
            </li>
            <li>
              <div><b>Entity</b><div className="d">Tự bảo vệ quy tắc nghiệp vụ, ví dụ không cho tổng tiền âm.</div></div>
            </li>
            <li>
              <div><b>Repository adapter</b><div className="d">Hiện thực port bằng Postgres; chuyển entity sang row và ngược lại.</div></div>
            </li>
            <li>
              <div><b>Trả kết quả</b><div className="d">Use case trả output DTO; controller (hoặc presenter) đổi thành HTTP response, status code.</div></div>
            </li>
          </ol>
        </section>
        <section id="ca-code">
          <h2><span className="n">04</span>Code mẫu TypeScript</h2>
          <h3>Entity: nghiệp vụ thuần</h3>
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
          <h3>Use case và port</h3>
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
          <h3>Adapter: hiện thực port</h3>
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
          <h3>Composition root: nối mọi thứ một lần</h3>
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
          <h3>Test use case không cần database</h3>
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
          <h2><span className="n">05</span>Cấu trúc thư mục gợi ý</h2>
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
          <p>Có thể dùng công cụ như <code>dependency-cruiser</code> hoặc luật ESLint để chặn <code>domain/</code> import từ <code>infrastructure/</code>, biến Dependency Rule thành kiểm tra tự động.</p>
          <p>Với hệ thống lớn, nhiều đội chia thư mục <b>theo tính năng trước</b> (<code>orders/</code>, <code>payments/</code>), rồi mới chia tầng bên trong mỗi tính năng.</p>
        </section>
        <section id="ca-family">
          <h2><span className="n">06</span>{"Hexagonal & Onion: cùng một gia đình"}</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Kiến trúc</th>
                  <th>Tác giả</th>
                  <th>Cách gọi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Hexagonal</b>{" (Ports & Adapters)"}</td>
                  <td>Alistair Cockburn, 2005</td>
                  <td>Lõi ứng dụng ở giữa, mỗi cạnh là một <b>port</b>; <b>driving adapter</b> (HTTP, CLI, consumer) gọi vào, <b>driven adapter</b> (DB, broker) được gọi ra.</td>
                </tr>
                <tr>
                  <td><b>Onion</b></td>
                  <td>Jeffrey Palermo, 2008</td>
                  <td>Domain model ở tâm, domain services, application services, rồi hạ tầng ở lớp ngoài.</td>
                </tr>
                <tr>
                  <td><b>Clean</b></td>
                  <td>Robert C. Martin, 2012</td>
                  <td>Gộp các ý trên thành bốn vòng và Dependency Rule.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Cả ba có chung một ý: <b>nghiệp vụ ở trung tâm, phụ thuộc hướng vào trong, hạ tầng là chi tiết có thể thay</b>. Khác biệt chủ yếu ở tên gọi và số lớp.</p>
          <div className="note tip"><b>Liên hệ với các phần khác của sổ tay:</b> KafkaJS producer, Express route, gRPC server, RabbitMQ consumer đều là adapter ở vòng ngoài. Use case không cần biết sự kiện đi qua Kafka hay NATS, chỉ biết port <code>EventPublisher</code>.</div>
        </section>
        <section id="ca-when">
          <h2><span className="n">07</span>Khi nào dùng, lỗi hay gặp</h2>
          <div className="cmp">
            <div>
              <h4>Nên dùng khi</h4>
              <ul className="plain">
                <li>Nghiệp vụ phức tạp, sống lâu, nhiều quy tắc.</li>
                <li>Cần test nghiệp vụ nhanh, độc lập hạ tầng.</li>
                <li>Có khả năng đổi database, framework, hoặc thêm kênh giao tiếp (REST, gRPC, consumer).</li>
              </ul>
            </div>
            <div>
              <h4>Chưa cần khi</h4>
              <ul className="plain">
                <li>CRUD đơn giản, ít logic: ba lớp interface cho mỗi bảng chỉ làm chậm.</li>
                <li>Prototype, script, service rất nhỏ.</li>
                <li>Đội chưa quen; áp dụng nửa vời còn tệ hơn không áp dụng.</li>
              </ul>
            </div>
          </div>
          <h3>Lỗi hay gặp</h3>
          <ul className="plain">
            <li>Entity “thiếu máu”: chỉ có getter/setter, mọi quy tắc nằm trong use case hoặc controller.</li>
            <li>Rò rỉ framework vào trong: entity mang decorator của ORM, use case nhận <code>Request</code> của Express.</li>
            <li>Tạo interface cho mọi thứ, kể cả những thứ không bao giờ thay. Chỉ cần port ở chỗ chạm ra bên ngoài.</li>
            <li>Use case gọi use case khác lồng nhau tạo thành mạng phụ thuộc; nên tách logic chung xuống entity hoặc domain service.</li>
            <li>Ánh xạ dữ liệu quá nhiều lớp (DTO → command → entity → row → DTO) mà không lớp nào thêm giá trị.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
