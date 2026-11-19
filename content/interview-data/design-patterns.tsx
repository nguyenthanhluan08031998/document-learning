import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const GURU = "https://refactoring.guru/design-patterns";
const SINGLETON = "https://refactoring.guru/design-patterns/singleton";
const FACTORY = "https://refactoring.guru/design-patterns/factory-method";
const BUILDER = "https://refactoring.guru/design-patterns/builder";
const STRATEGY = "https://refactoring.guru/design-patterns/strategy";
const OBSERVER = "https://refactoring.guru/design-patterns/observer";
const DECORATOR = "https://refactoring.guru/design-patterns/decorator";
const ADAPTER = "https://refactoring.guru/design-patterns/adapter";
const CHAIN = "https://refactoring.guru/design-patterns/chain-of-responsibility";
const COMMAND = "https://refactoring.guru/design-patterns/command";
const REPOSITORY = "https://martinfowler.com/eaaCatalog/repository.html";
const CIRCUIT = "https://microservices.io/patterns/reliability/circuit-breaker.html";
const SAGA = "https://microservices.io/patterns/data/saga.html";
const OUTBOX = "https://microservices.io/patterns/data/transactional-outbox.html";
const CQRS = "https://microservices.io/patterns/data/cqrs.html";
const ANTI = "https://en.wikipedia.org/wiki/Anti-pattern";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · design pattern", "interview · design patterns"),
    title: t("Phỏng vấn Design Pattern", "Design pattern interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Ví dụ viết bằng TypeScript quanh hệ thống bán hàng (order, payment). Bài học chi tiết ở BE → Thiết kế → Creational, Structural, Behavioral, Microservice.",
      "Click a question to see the answer, an example and a diagram. Examples are TypeScript around the shop system (orders, payments). The full lessons are in BE → Design → Creational, Structural, Behavioral, Microservice.",
    ),
    sections: [
      {
        id: "dp-overview",
        title: t("Tổng quan", "Overview"),
        items: [
          {
            q: t("Design pattern là gì? Chia thành mấy nhóm?", "What is a design pattern? What are the groups?"),
            a: [
              t(
                "Design pattern là lời giải đã được đặt tên cho một vấn đề thiết kế lặp đi lặp lại. Nó không phải thư viện hay đoạn code copy được, mà là một khuôn mẫu cách sắp xếp class và đối tượng. Giá trị lớn nhất là từ vựng chung: nói \"chỗ này dùng Strategy\" là cả team hiểu ngay.",
                "A design pattern is a named solution to a recurring design problem. It is not a library or copy-paste code but a template for arranging classes and objects. Its biggest value is shared vocabulary: say \"use Strategy here\" and the whole team understands.",
              ),
              t(
                "23 pattern GoF chia 3 nhóm. Creational (5): cách tạo đối tượng, ví dụ Singleton, Factory Method, Abstract Factory, Builder, Prototype. Structural (7): cách ghép đối tượng, ví dụ Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight. Behavioral (11): cách đối tượng giao tiếp và chia trách nhiệm, ví dụ Strategy, Observer, Command, State, Chain of Responsibility, Template Method, Iterator... Ngoài ra còn nhóm pattern cho hệ phân tán: Saga, Circuit Breaker, Outbox, CQRS.",
                "The 23 GoF patterns fall into 3 groups. Creational (5): how objects are created, e.g. Singleton, Factory Method, Abstract Factory, Builder, Prototype. Structural (7): how objects are composed, e.g. Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight. Behavioral (11): how objects communicate and share responsibility, e.g. Strategy, Observer, Command, State, Chain of Responsibility, Template Method, Iterator... There is also a group for distributed systems: Saga, Circuit Breaker, Outbox, CQRS.",
              ),
            ],
            diagram: <Flow id="dpgroups" label={t("Ba nhóm pattern", "Three pattern groups")} steps={[
              { title: "Creational", sub: t("tạo đối tượng", "create objects") },
              { title: "Structural", sub: t("ghép đối tượng", "compose objects") },
              { title: "Behavioral", sub: t("giao tiếp", "communicate"), hl: true },
            ]} />,
            href: GURU, label: "Refactoring.Guru: Design Patterns",
          },
        ],
      },
      {
        id: "dp-creational",
        title: t("Creational: tạo đối tượng", "Creational: creating objects"),
        lede: t("Tách việc tạo đối tượng khỏi nơi dùng nó.", "Separate creating objects from using them."),
        items: [
          {
            q: t("Singleton là gì? Vì sao nhiều người coi nó là anti-pattern?", "What is Singleton? Why do many call it an anti-pattern?"),
            a: [
              t(
                "Singleton đảm bảo một class chỉ có một instance và có điểm truy cập toàn cục tới nó. Hay dùng cho connection pool, config, logger.",
                "Singleton ensures a class has only one instance with a global access point. Typical uses: connection pool, config, logger.",
              ),
              t(
                "Nhược điểm: nó là biến toàn cục trá hình. Code gọi thẳng Database.getInstance() nên phụ thuộc bị giấu, khó thay bằng mock khi test, và state dùng chung dễ rò giữa các test. Trong Node.js không cần viết class Singleton: module được cache sau lần require/import đầu, nên export một instance là đủ. Cách tốt hơn nữa là tạo một lần ở composition root rồi tiêm qua constructor (DI container của NestJS mặc định cũng tạo provider dạng singleton).",
                "Downsides: it is a global variable in disguise. Code calls Database.getInstance() directly, hiding the dependency, making it hard to mock in tests and letting shared state leak between tests. In Node.js you do not need a Singleton class: modules are cached after the first require/import, so exporting an instance is enough. Better still, create it once in the composition root and inject it via the constructor (NestJS providers are singletons by default).",
              ),
            ],
            code: { lang: "ts", src: `// ${t("Kiểu GoF cổ điển", "Classic GoF style")}
class Database {
  private static instance?: Database;
  private constructor(readonly pool: Pool) {}
  static getInstance() {
    return (this.instance ??= new Database(new Pool({ max: 10 })));
  }
}

// ${t("Kiểu Node.js: module cache đã là singleton", "Node.js style: the module cache already is a singleton")}
// db.ts
export const db = new Pool({ max: 10 });

// ${t("Tốt hơn cho test: tiêm vào", "Better for tests: inject it")}
class OrderRepo { constructor(private readonly db: Pool) {} }` },
            href: SINGLETON, label: "Singleton",
          },
          {
            q: t("Factory Method, Abstract Factory và \"simple factory\" khác nhau thế nào?", "Factory Method vs Abstract Factory vs a \"simple factory\"?"),
            a: [
              t(
                "Simple factory: một hàm nhận tham số rồi trả về đúng loại đối tượng, gom chuỗi new/if vào một chỗ. Không phải pattern GoF nhưng dùng nhiều nhất.",
                "Simple factory: one function takes a parameter and returns the right kind of object, gathering the new/if chain in one place. Not a GoF pattern, but the most used.",
              ),
              t(
                "Factory Method: class cha định nghĩa method tạo đối tượng, class con quyết định tạo loại nào. Abstract Factory: một factory tạo ra cả một họ đối tượng đi cùng nhau, ví dụ PaymentKit cho từng cổng gồm client, webhook verifier, refund handler; đổi factory là đổi cả bộ, không bị trộn Momo client với VNPay verifier.",
                "Factory Method: the parent class declares a creation method and subclasses decide which type to create. Abstract Factory: one factory creates a whole family of related objects, e.g. a PaymentKit per provider with a client, webhook verifier and refund handler; swapping the factory swaps the whole set, so you never mix a Momo client with a VNPay verifier.",
              ),
            ],
            code: { lang: "ts", src: `// Simple factory
function createGateway(kind: "momo" | "vnpay"): PaymentGateway {
  switch (kind) {
    case "momo":  return new MomoGateway(env.MOMO_KEY);
    case "vnpay": return new VnpayGateway(env.VNPAY_KEY);
  }
}

// Abstract Factory: ${t("một họ đối tượng đi cùng nhau", "a family of objects that belong together")}
interface PaymentKit {
  client(): PaymentGateway;
  webhookVerifier(): WebhookVerifier;
}
class MomoKit implements PaymentKit {
  client() { return new MomoGateway(env.MOMO_KEY); }
  webhookVerifier() { return new MomoSignatureVerifier(env.MOMO_SECRET); }
}` },
            href: FACTORY, label: "Factory Method",
          },
          {
            q: t("Builder dùng khi nào?", "When do you use Builder?"),
            a: t(
              "Khi đối tượng có nhiều tham số tùy chọn, hoặc phải dựng qua nhiều bước, khiến constructor thành một dãy tham số dài khó đọc (telescoping constructor). Builder cho phép set từng phần có tên rõ ràng rồi gọi build() để kiểm tra và tạo. Ví dụ quen thuộc: query builder của Knex/TypeORM, request builder. Trong TS, nhiều khi chỉ cần một object tham số có tên là đủ, không cần Builder.",
              "When an object has many optional parameters or must be assembled in steps, making the constructor a long, unreadable argument list (telescoping constructor). Builder sets each part by name, then build() validates and creates it. Familiar examples: Knex/TypeORM query builders, request builders. In TS a single named options object is often enough and Builder is unnecessary.",
            ),
            code: { lang: "ts", src: `const order = new OrderBuilder()
  .customer("u_42")
  .addItem({ sku: "TSHIRT", qty: 2, price: 150_000 })
  .coupon("SALE10")
  .shipTo({ city: "HCM", street: "..." })
  .build();                     // ${t("kiểm tra: có item, có địa chỉ...", "validates: has items, has address...")}

// ${t("Query builder là Builder bạn dùng hằng ngày", "A query builder is the Builder you use every day")}
const rows = await knex("orders")
  .where({ status: "paid" })
  .orderBy("created_at", "desc")
  .limit(20);` },
            href: BUILDER, label: "Builder",
          },
        ],
      },
      {
        id: "dp-structural",
        title: t("Structural: ghép đối tượng", "Structural: composing objects"),
        lede: t("Bọc, nối, gom các đối tượng thành cấu trúc lớn hơn mà vẫn linh hoạt.", "Wrap, connect and combine objects into larger structures that stay flexible."),
        items: [
          {
            q: t("Decorator pattern là gì? Có giống decorator @ của TypeScript không?", "What is the Decorator pattern? Is it the same as TypeScript's @ decorators?"),
            a: t(
              "Decorator bọc một đối tượng bằng một đối tượng khác cùng interface để thêm hành vi (log, retry, cache, đo thời gian) mà không sửa class gốc và không cần kế thừa. Có thể chồng nhiều lớp tùy ý. Middleware của Express hay HTTP client interceptor cũng theo ý này. Decorator @ của TypeScript/NestJS (@Injectable, @Get) là tính năng ngôn ngữ để gắn metadata hoặc bọc method/class lúc định nghĩa; cùng tinh thần \"bọc thêm hành vi\" nhưng không phải cùng một thứ: pattern bọc đối tượng lúc runtime, còn @ áp vào khai báo.",
              "Decorator wraps an object in another object with the same interface to add behavior (logging, retry, caching, timing) without editing the original class or subclassing. Layers stack freely. Express middleware and HTTP client interceptors follow the same idea. TypeScript/NestJS @ decorators (@Injectable, @Get) are a language feature that attaches metadata or wraps methods/classes at definition time; same spirit of \"wrap to add behavior\", but not the same thing: the pattern wraps objects at runtime, @ applies to declarations.",
            ),
            code: { lang: "ts", src: `class CachedProductRepo implements ProductRepo {
  constructor(private inner: ProductRepo, private cache: Redis) {}
  async findById(id: string) {
    const hit = await this.cache.get("p:" + id);
    if (hit) return JSON.parse(hit) as Product;
    const p = await this.inner.findById(id);
    await this.cache.set("p:" + id, JSON.stringify(p), "EX", 60);
    return p;
  }
}

// ${t("Chồng lớp: log → cache → DB", "Stack layers: log → cache → DB")}
const repo = new LoggedProductRepo(new CachedProductRepo(new PgProductRepo(db), redis));` },
            href: DECORATOR, label: "Decorator",
          },
          {
            q: t("Adapter, Facade và Proxy khác nhau thế nào?", "Adapter vs Facade vs Proxy?"),
            a: t(
              "Cả ba đều \"đứng trước\" một đối tượng khác, khác nhau ở mục đích. Adapter đổi interface: SDK bên thứ ba có hàm và kiểu riêng, bọc lại để khớp với interface PaymentGateway của mình. Facade đơn giản hóa: gom nhiều bước của nhiều subsystem (kiểm kho, thanh toán, tạo vận đơn) thành một hàm checkout(). Proxy giữ nguyên interface, kiểm soát truy cập: lazy load, cache, kiểm quyền, rate limit, hoặc gọi qua mạng (gRPC stub là remote proxy).",
              "All three stand in front of another object; the difference is intent. Adapter converts an interface: a third-party SDK has its own methods and types, so wrap it to match your PaymentGateway interface. Facade simplifies: it bundles steps across several subsystems (stock check, payment, shipment) into one checkout(). Proxy keeps the same interface and controls access: lazy loading, caching, permission checks, rate limiting, or calling over the network (a gRPC stub is a remote proxy).",
            ),
            code: { lang: "ts", src: `// Adapter: ${t("SDK Stripe → interface của mình", "Stripe SDK → our interface")}
class StripeAdapter implements PaymentGateway {
  constructor(private stripe: Stripe) {}
  async pay(amount: number) {
    await this.stripe.paymentIntents.create({ amount, currency: "vnd" });
  }
}

// Facade: ${t("một hàm che nhiều subsystem", "one call hides many subsystems")}
class CheckoutFacade {
  constructor(private stock: StockService, private pay: PaymentGateway, private ship: ShippingService) {}
  async checkout(o: Order) {
    await this.stock.reserve(o.items);
    await this.pay.pay(o.total);
    return this.ship.createLabel(o);
  }
}` },
            href: ADAPTER, label: "Adapter",
          },
        ],
      },
      {
        id: "dp-behavioral",
        title: t("Behavioral: giao tiếp và chia trách nhiệm", "Behavioral: communication and responsibility"),
        lede: t("Cách các đối tượng gọi nhau, báo cho nhau và chia việc.", "How objects call, notify and divide work between each other."),
        items: [
          {
            q: t("Strategy là gì? Khác State thế nào?", "What is Strategy? How does it differ from State?"),
            a: [
              t(
                "Strategy đóng gói một họ thuật toán thay thế được cho nhau sau một interface, và client chọn dùng cái nào. Đây là cách chuẩn để bỏ chuỗi if/else theo loại: tính phí ship theo GHN/GHTK/tự giao, tính giảm giá, chọn cổng thanh toán. Nó chính là Open/Closed trong SOLID áp vào thực tế.",
                "Strategy wraps a family of interchangeable algorithms behind one interface, and the client picks which to use. It is the standard way to kill an if/else on type: shipping fee by carrier, discount calculation, payment provider. It is SOLID's Open/Closed in practice.",
              ),
              t(
                "State có cấu trúc giống hệt (cũng một interface, nhiều class) nhưng khác ý đồ: đối tượng tự đổi hành vi khi trạng thái bên trong đổi, và chính các state quyết định chuyển sang state tiếp theo. Ví dụ đơn hàng: Pending → Paid → Shipped → Delivered, gọi cancel() ở mỗi trạng thái cho kết quả khác nhau. Strategy thì do bên ngoài chọn, các strategy không biết nhau.",
                "State has the same structure (one interface, many classes) but a different intent: the object changes its own behavior as its internal state changes, and the states themselves decide the next state. Example order: Pending → Paid → Shipped → Delivered, where cancel() behaves differently in each state. With Strategy the outside chooses, and strategies do not know about each other.",
              ),
            ],
            code: [
              { lang: "ts", src: `// Strategy: ${t("bên ngoài chọn thuật toán", "the caller picks the algorithm")}
interface ShippingFee { calc(o: Order): number }
class GhnFee  implements ShippingFee { calc(o: Order) { return 30_000 + o.weight * 5_000; } }
class FreeFee implements ShippingFee { calc() { return 0; } }

const fee: ShippingFee = order.total >= 500_000 ? new FreeFee() : new GhnFee();
const total = order.total + fee.calc(order);` },
              { lang: "ts", src: `// State: ${t("trạng thái tự quyết bước tiếp theo", "the state decides the next step")}
interface OrderState { pay(o: Order): void; cancel(o: Order): void }

class Pending implements OrderState {
  pay(o: Order)    { o.state = new Paid(); }
  cancel(o: Order) { o.state = new Cancelled(); }
}
class Shipped implements OrderState {
  pay()    { throw new Error("already paid"); }
  cancel() { throw new Error("already shipped, create a return instead"); }
}` },
            ],
            href: STRATEGY, label: "Strategy",
          },
          {
            q: t("Observer là gì? Liên quan gì tới EventEmitter và pub/sub?", "What is Observer? How does it relate to EventEmitter and pub/sub?"),
            a: t(
              "Observer: một đối tượng (subject) giữ danh sách observer và báo cho tất cả khi có sự kiện, nên bên phát không cần biết ai đang nghe. Đặt hàng xong thì gửi email, trừ kho, cộng điểm mà OrderService không phải gọi từng service. EventEmitter của Node chính là Observer. Pub/sub (Kafka, RabbitMQ, Redis) là bản mở rộng qua mạng: có broker ở giữa, publisher và subscriber không biết nhau, có thể chạy khác process, và có thể bất đồng bộ, lưu bền. Lưu ý: listener lỗi trong EventEmitter chạy đồng bộ có thể làm hỏng luồng chính, và quên removeListener sẽ gây rò bộ nhớ.",
              "Observer: a subject keeps a list of observers and notifies them all when something happens, so the emitter does not know who is listening. After an order is placed, send email, reserve stock and add points without OrderService calling each one. Node's EventEmitter is Observer. Pub/sub (Kafka, RabbitMQ, Redis) is the networked version: a broker sits in the middle, publishers and subscribers do not know each other, can live in different processes, and delivery can be async and durable. Watch out: a throwing listener in a synchronous EventEmitter can break the main flow, and forgetting removeListener leaks memory.",
            ),
            diagram: <Flow id="dpobs" label="Observer" steps={[
              { title: "OrderService", sub: "emit(order.placed)", hl: true },
              { title: "EmailListener", sub: t("gửi mail", "send email") },
              { title: "StockListener", sub: t("trừ kho", "reserve stock") },
              { title: "PointsListener", sub: t("cộng điểm", "add points") },
            ]} caption={t("Bên phát không biết có bao nhiêu listener.", "The emitter does not know how many listeners exist.")} />,
            code: { lang: "ts", src: `import { EventEmitter } from "node:events";

export const events = new EventEmitter();

// ${t("Mỗi module tự đăng ký, OrderService không biết", "Each module subscribes itself; OrderService does not know")}
events.on("order.placed", (o: Order) => mailer.confirm(o));
events.on("order.placed", (o: Order) => stock.reserve(o.items));

class OrderService {
  async place(o: Order) {
    await this.repo.save(o);
    events.emit("order.placed", o);
  }
}` },
            href: OBSERVER, label: "Observer",
          },
          {
            q: t("Middleware của Express/NestJS là pattern gì?", "Which pattern is Express/NestJS middleware?"),
            a: t(
              "Chain of Responsibility: request đi qua một chuỗi handler, mỗi handler làm phần việc của mình (log, auth, validate, rate limit) rồi chuyển tiếp bằng next(), hoặc dừng chuỗi bằng cách trả response luôn. Thêm hay bớt một bước chỉ cần thêm hay bớt một handler trong chuỗi, không sửa các handler khác. Guard, interceptor, pipe của NestJS cũng là các mắt xích trong chuỗi này.",
              "Chain of Responsibility: the request passes through a chain of handlers, each doing its part (logging, auth, validation, rate limiting) and passing on with next(), or stopping the chain by responding immediately. Adding or removing a step means adding or removing one handler without touching the others. NestJS guards, interceptors and pipes are links in the same chain.",
            ),
            diagram: <Flow id="dpchain" label="Chain of Responsibility" steps={[
              { title: "logger", sub: "next()" },
              { title: "auth", sub: t("401 → dừng", "401 → stop"), hl: true },
              { title: "validate", sub: t("400 → dừng", "400 → stop") },
              { title: "handler", sub: t("xử lý", "handle") },
            ]} />,
            code: { lang: "ts", src: `const auth: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).end();  // ${t("dừng chuỗi", "stop the chain")}
  next();                                                        // ${t("chuyển tiếp", "pass it on")}
};

app.post("/orders", logger, auth, validate(OrderSchema), createOrder);` },
            href: CHAIN, label: "Chain of Responsibility",
          },
          {
            q: t("Command pattern dùng vào việc gì?", "What is the Command pattern used for?"),
            a: t(
              "Đóng gói một yêu cầu thành một đối tượng chứa đủ dữ liệu để thực thi sau. Khi yêu cầu đã là dữ liệu thì có thể xếp hàng (job queue như BullMQ), lưu lại để retry, ghi log/audit, hoặc làm undo/redo. Một job \"SendInvoice { orderId }\" đẩy vào queue cho worker xử lý chính là Command. Trong CQRS, phía ghi cũng nhận các command như PlaceOrder, CancelOrder.",
              "Wrap a request in an object holding everything needed to execute it later. Once a request is data you can queue it (job queues like BullMQ), store it for retries, log/audit it, or support undo/redo. A \"SendInvoice { orderId }\" job pushed to a queue for a worker is a Command. In CQRS, the write side also receives commands like PlaceOrder and CancelOrder.",
            ),
            code: { lang: "ts", src: `// ${t("Command là dữ liệu", "A command is data")}
type SendInvoice = { type: "SendInvoice"; orderId: string };

// ${t("Phía gọi: chỉ đẩy vào queue rồi trả lời ngay", "Caller: just enqueue and respond")}
await queue.add("SendInvoice", { orderId: o.id }, { attempts: 5, backoff: { type: "exponential", delay: 1000 } });

// ${t("Worker: thực thi khi rảnh, retry nếu lỗi", "Worker: executes later, retries on failure")}
new Worker("SendInvoice", async (job) => {
  await invoices.send(job.data.orderId);
});` },
            href: COMMAND, label: "Command",
          },
        ],
      },
      {
        id: "dp-architecture",
        title: t("Kiến trúc & microservice", "Architecture & microservices"),
        lede: t("Không thuộc 23 pattern GoF, nhưng được hỏi rất nhiều khi phỏng vấn backend.", "Not among the 23 GoF patterns, but asked constantly in backend interviews."),
        items: [
          {
            q: t("Repository pattern là gì? Đã dùng ORM rồi thì có cần không?", "What is the Repository pattern? Do you need it if you already use an ORM?"),
            a: t(
              "Repository là lớp đứng giữa nghiệp vụ và cách lưu trữ, cung cấp các hàm theo ngôn ngữ nghiệp vụ (findPendingOrders, save) thay vì để SQL hoặc lời gọi ORM rải khắp service. Lợi ích: service không biết DB là gì, test thì thay bằng bản in-memory, đổi ORM hay DB chỉ sửa một chỗ. Với ORM: TypeORM, Prisma đã cung cấp một kiểu repository chung, nhưng vẫn gắn chặt với ORM đó. Dự án nhỏ dùng thẳng là ổn; dự án theo Clean Architecture thì định nghĩa interface repository ở tầng nghiệp vụ và để ORM nằm trong phần hiện thực.",
              "A repository sits between business logic and storage, exposing methods in business language (findPendingOrders, save) instead of SQL or ORM calls scattered across services. Benefits: services do not know the DB, tests swap in an in-memory version, and changing ORM or DB touches one place. With an ORM: TypeORM and Prisma already give a generic repository, but it is tied to that ORM. Small projects can use it directly; in Clean Architecture, define the repository interface in the business layer and keep the ORM inside the implementation.",
            ),
            code: { lang: "ts", src: `// ${t("Tầng nghiệp vụ sở hữu interface", "The business layer owns the interface")}
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findPendingOlderThan(minutes: number): Promise<Order[]>;
  save(o: Order): Promise<void>;
}

// ${t("Hiện thực bằng Prisma", "Implemented with Prisma")}
class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}
  findPendingOlderThan(min: number) {
    return this.prisma.order.findMany({
      where: { status: "PENDING", createdAt: { lt: new Date(Date.now() - min * 60_000) } },
    });
  }
  /* ... */
}` },
            href: REPOSITORY, label: "Repository (Martin Fowler)",
          },
          {
            q: t("Circuit Breaker là gì? Vì sao cần?", "What is a Circuit Breaker and why do you need it?"),
            a: t(
              "Khi service bên dưới (cổng thanh toán, service khác) chậm hoặc chết, cứ tiếp tục gọi thì mỗi request phải chờ hết timeout, thread/connection bị giữ, lỗi lan ngược lên và kéo sập cả hệ thống (cascading failure). Circuit breaker đếm lỗi: vượt ngưỡng thì chuyển sang Open, trả lỗi ngay (fail fast) hoặc trả fallback mà không gọi nữa. Sau một khoảng thời gian chuyển sang Half-open, cho vài request thử; thành công thì Closed lại, thất bại thì Open tiếp. Thường đi cùng timeout và retry có backoff. Thư viện Node: opossum.",
              "When a downstream dependency (payment provider, another service) is slow or down, continuing to call it makes every request wait for the timeout, holds threads/connections, and the failure spreads upward until the whole system falls over (cascading failure). A circuit breaker counts failures: above a threshold it goes Open and fails fast or returns a fallback without calling. After a cooldown it goes Half-open and lets a few trial requests through; success closes it, failure opens it again. Usually paired with timeouts and retry with backoff. Node library: opossum.",
            ),
            diagram: <Flow id="dpcb" label="Circuit breaker" steps={[
              { title: "Closed", sub: t("gọi bình thường", "calls go through") },
              { title: "Open", sub: t("lỗi nhiều → fail fast", "too many errors → fail fast"), hl: true },
              { title: "Half-open", sub: t("thử vài request", "try a few requests") },
              { title: "Closed", sub: t("ổn → mở lại", "healthy → resume") },
            ]} />,
            code: { lang: "ts", src: `import CircuitBreaker from "opossum";

const breaker = new CircuitBreaker((amount: number) => momo.pay(amount), {
  timeout: 3000,                 // ${t("quá 3s coi như lỗi", "over 3s counts as failure")}
  errorThresholdPercentage: 50,  // ${t("50% lỗi thì Open", "50% errors → Open")}
  resetTimeout: 30_000,          // ${t("30s sau thử lại (Half-open)", "retry after 30s (Half-open)")}
});
breaker.fallback(() => ({ status: "PENDING_RETRY" }));

await breaker.fire(order.total);` },
            href: CIRCUIT, label: "Circuit Breaker (microservices.io)",
          },
          {
            q: t("Saga là gì? Choreography khác orchestration thế nào?", "What is a Saga? Choreography vs orchestration?"),
            a: [
              t(
                "Trong microservice mỗi service có DB riêng, nên không thể dùng một transaction ACID cho cả đặt hàng, trừ tiền, trừ kho. Saga chia thành chuỗi transaction cục bộ, mỗi bước có một bước bù (compensating action). Một bước thất bại thì chạy bù các bước đã xong theo thứ tự ngược: trừ kho lỗi thì hoàn tiền, rồi hủy đơn. Kết quả là nhất quán cuối cùng (eventual consistency), không phải nhất quán tức thì.",
                "In microservices each service owns its DB, so one ACID transaction cannot span placing the order, charging and reserving stock. A Saga splits it into a chain of local transactions, each with a compensating action. If a step fails, the completed steps are compensated in reverse: stock fails, so refund, then cancel the order. The result is eventual consistency, not immediate consistency.",
              ),
              t(
                "Choreography: không có ai điều phối, mỗi service nghe event và phát event tiếp theo. Đơn giản khi ít bước nhưng khó theo dõi luồng khi nhiều service. Orchestration: một orchestrator ra lệnh cho từng service và quyết định bù khi lỗi. Luồng tập trung, dễ đọc và debug hơn, đổi lại orchestrator là thêm một thành phần phải vận hành (ví dụ Temporal, AWS Step Functions).",
                "Choreography: no coordinator; each service listens for events and emits the next one. Simple with few steps, but the flow is hard to follow across many services. Orchestration: an orchestrator commands each service and decides compensation on failure. The flow is in one place, easier to read and debug, at the cost of one more component to run (e.g. Temporal, AWS Step Functions).",
              ),
            ],
            diagram: <Flow id="dpsaga" label="Saga" steps={[
              { title: t("Tạo đơn", "Create order"), sub: t("bù: hủy đơn", "undo: cancel order") },
              { title: t("Trừ tiền", "Charge"), sub: t("bù: hoàn tiền", "undo: refund") },
              { title: t("Trừ kho", "Reserve stock"), sub: t("lỗi → chạy bù ngược", "fails → compensate back"), hl: true },
            ]} />,
            code: { lang: "ts", src: `// Orchestration${t(" (rút gọn)", " (simplified)")}
async function placeOrderSaga(o: Order) {
  const done: Array<() => Promise<void>> = [];
  try {
    await orders.create(o);         done.push(() => orders.cancel(o.id));
    const tx = await payments.charge(o); done.push(() => payments.refund(tx.id));
    await stock.reserve(o.items);   done.push(() => stock.release(o.items));
  } catch (e) {
    for (const undo of done.reverse()) await undo();   // ${t("bù theo thứ tự ngược", "compensate in reverse")}
    throw e;
  }
}` },
            href: SAGA, label: "Saga (microservices.io)",
          },
          {
            q: t("Transactional Outbox giải quyết vấn đề gì?", "What problem does the Transactional Outbox solve?"),
            a: t(
              "Vấn đề dual write: lưu đơn vào DB rồi publish event lên Kafka là hai hệ thống khác nhau, không chung transaction. Lưu xong mà publish lỗi thì service khác không bao giờ biết có đơn; publish trước mà lưu lỗi thì phát ra event cho đơn không tồn tại. Outbox: ghi event vào bảng outbox trong cùng transaction với dữ liệu nghiệp vụ, nên hai thứ cùng thành công hoặc cùng thất bại. Một tiến trình riêng (poller, hoặc CDC như Debezium) đọc bảng outbox và publish lên broker, xong thì đánh dấu đã gửi. Event có thể bị gửi lặp, nên consumer phải idempotent.",
              "The dual-write problem: saving an order to the DB and publishing an event to Kafka are two systems without a shared transaction. Save succeeds but publish fails, and other services never learn about the order; publish first and the save fails, and you announced an order that does not exist. Outbox: write the event to an outbox table in the same transaction as the business data, so both succeed or both fail. A separate process (a poller, or CDC like Debezium) reads the outbox and publishes to the broker, then marks rows as sent. Events may be delivered more than once, so consumers must be idempotent.",
            ),
            diagram: <Flow id="dpoutbox" label="Outbox" steps={[
              { title: t("1 transaction", "1 transaction"), sub: "orders + outbox", hl: true },
              { title: "Relay", sub: t("poll / CDC", "poll / CDC") },
              { title: "Kafka", sub: "publish" },
              { title: "Consumer", sub: "idempotent" },
            ]} />,
            code: { lang: "ts", src: `await db.transaction(async (tx) => {
  await tx.insert(orders).values(order);
  await tx.insert(outbox).values({
    id: crypto.randomUUID(),
    topic: "order.placed",
    payload: JSON.stringify(order),
  });
});  // ${t("cả hai cùng commit hoặc cùng rollback", "both commit or both roll back")}

// Relay${t(" chạy nền", " running in the background")}
const rows = await db.select().from(outbox).where(isNull(outbox.sentAt)).limit(100);
for (const r of rows) {
  await producer.send({ topic: r.topic, messages: [{ key: r.id, value: r.payload }] });
  await db.update(outbox).set({ sentAt: new Date() }).where(eq(outbox.id, r.id));
}` },
            href: OUTBOX, label: "Transactional Outbox (microservices.io)",
          },
          {
            q: t("CQRS là gì? Khi nào nên dùng?", "What is CQRS and when should you use it?"),
            a: t(
              "Command Query Responsibility Segregation: tách mô hình ghi (command: đặt hàng, hủy đơn, có kiểm tra nghiệp vụ) khỏi mô hình đọc (query: danh sách đơn, báo cáo, tối ưu cho hiển thị). Mức nhẹ chỉ là tách class/hàm trong cùng DB. Mức nặng là hai kho riêng: ghi vào Postgres, đồng bộ qua event sang Elasticsearch hoặc bảng denormalized để đọc nhanh, chấp nhận dữ liệu đọc trễ một chút. Nên dùng khi tải đọc và ghi chênh lệch lớn hoặc màn hình đọc cần dữ liệu ghép từ nhiều nơi. Không nên dùng cho app CRUD đơn giản vì thêm độ phức tạp và độ trễ đồng bộ.",
              "Command Query Responsibility Segregation: separate the write model (commands: place order, cancel, with business checks) from the read model (queries: order lists, reports, shaped for display). The light version just splits classes/functions over the same DB. The heavy version uses two stores: write to Postgres, sync via events into Elasticsearch or denormalized tables for fast reads, accepting slightly stale reads. Use it when read and write loads differ greatly or read screens need data joined from many places. Avoid it for plain CRUD apps: it adds complexity and sync lag.",
            ),
            href: CQRS, label: "CQRS (microservices.io)",
          },
        ],
      },
      {
        id: "dp-practice",
        title: t("Tình huống thực tế", "In practice"),
        items: [
          {
            q: t("Kể một pattern bạn đã dùng trong dự án thật. Khi nào không nên dùng pattern?", "Name a pattern you used in a real project. When should you not use patterns?"),
            a: [
              t(
                "Cách trả lời tốt: nêu vấn đề trước, pattern sau. Ví dụ: \"Hệ thống có 3 cổng thanh toán, mỗi lần thêm cổng phải sửa hàm checkout dài 200 dòng và hay gây lỗi. Mình tách mỗi cổng thành một Strategy cùng interface PaymentGateway, dùng factory chọn theo cấu hình, bọc thêm Decorator để retry và log. Thêm ZaloPay chỉ mất một class và một dòng config, test từng cổng riêng được.\" Người phỏng vấn muốn thấy bạn hiểu vì sao dùng, không phải thuộc tên.",
                "A good answer states the problem first, then the pattern. For example: \"We had 3 payment providers and every new one meant editing a 200-line checkout function that kept breaking. I turned each provider into a Strategy behind a PaymentGateway interface, picked it with a factory based on config, and wrapped it with a Decorator for retries and logging. Adding ZaloPay became one class and one config line, and each provider could be tested alone.\" Interviewers want to see that you know why, not that you memorized names.",
              ),
              t(
                "Không nên dùng khi chưa có vấn đề thật: chỉ có một cách làm và ít khả năng đổi (YAGNI), code nhỏ mà thêm interface, factory, lớp bọc làm khó đọc hơn. Dấu hiệu lạm dụng: interface chỉ có một implementation không dùng để test, AbstractFactoryFactory, đọc một luồng phải nhảy qua 10 file. Anti-pattern hay gặp: God object (một class biết mọi thứ), Singleton dùng làm biến toàn cục, copy-paste thay vì tách hàm.",
                "Do not use one before there is a real problem: there is only one way to do it and little chance of change (YAGNI), or the code is small and extra interfaces, factories and wrappers make it harder to read. Signs of overuse: interfaces with one implementation not used for testing, an AbstractFactoryFactory, ten files to jump through to follow one flow. Common anti-patterns: God object (one class that knows everything), Singleton used as a global variable, copy-paste instead of extracting a function.",
              ),
            ],
            href: ANTI, label: "Anti-pattern",
          },
        ],
      },
    ],
  };
}
