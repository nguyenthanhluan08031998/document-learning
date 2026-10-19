import { Code } from "@/components/Code";

export default function StructuralPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Structural: cách ghép đối tượng">
        <div className="label">Mục lục</div>
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
          <h1>Structural: cách ghép đối tượng</h1>
          <p className="lede">Bảy pattern về cách bọc, nối và tổ chức các đối tượng thành cấu trúc lớn hơn mà vẫn linh hoạt.</p>
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
                  <td><a className="plink" href="#st-adapter">Adapter</a></td>
                  <td>Bộ chuyển đổi</td>
                  <td>Bọc đối tượng cũ trong một lớp hiện thực interface mới, chuyển đổi lời gọi qua lại.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-bridge">Bridge</a></td>
                  <td>Cầu nối</td>
                  <td>Tách thành hai hệ thống phân cấp, một bên giữ tham chiếu tới bên kia.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-composite">Composite</a></td>
                  <td>Cây đối tượng</td>
                  <td>Lá và nhánh cùng hiện thực một interface; nhánh gọi đệ quy xuống các con.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-decorator">Decorator</a></td>
                  <td>Bọc thêm chức năng</td>
                  <td>Bọc đối tượng trong một lớp cùng interface, làm thêm việc trước hoặc sau khi gọi vào đối tượng bên trong. Có thể bọc nhiều lớp chồng nhau.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-facade">Facade</a></td>
                  <td>Mặt tiền</td>
                  <td>Tạo một lớp với vài phương thức đơn giản, bên trong điều phối các subsystem.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-flyweight">Flyweight</a></td>
                  <td>Dùng chung phần giống nhau</td>
                  <td>Tách phần dữ liệu không đổi (intrinsic) ra dùng chung; mỗi đối tượng chỉ giữ phần riêng (extrinsic).</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#st-proxy">Proxy</a></td>
                  <td>Đại diện</td>
                  <td>Một đối tượng cùng interface đứng trước đối tượng thật và quyết định có chuyển lời gọi vào hay không.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="st-adapter">
          <h2><span className="n">01</span>Adapter <small className="vn">Bộ chuyển đổi</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Có một thư viện hoặc API bên ngoài với interface khác với interface mà code của bạn đang dùng.</div>
            <div><span className="pl">Ý tưởng</span>Bọc đối tượng cũ trong một lớp hiện thực interface mới, chuyển đổi lời gọi qua lại.</div>
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
            <div><span className="pl">Khi nào dùng</span>Tích hợp thư viện bên thứ ba, hệ thống cũ, đổi nhà cung cấp mà không sửa code nghiệp vụ.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Chỉ chuyển đổi, không nhét logic nghiệp vụ vào adapter.</div>
          </div>
        </section>
        <section id="st-bridge">
          <h2><span className="n">02</span>Bridge <small className="vn">Cầu nối</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Hai chiều thay đổi độc lập (loại thông báo × kênh gửi) khiến số lớp con nhân lên theo cấp số nhân.</div>
            <div><span className="pl">Ý tưởng</span>Tách thành hai hệ thống phân cấp, một bên giữ tham chiếu tới bên kia.</div>
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
  send(to: string) { this.channel.deliver(to, \`Đơn \${this.orderId} đã giao\`); }
}

new OrderShipped(new SmsChannel(), "42").send("0901...");
// N messages + M channels classes, instead of N x M subclasses like SmsOrderShipped`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Hai khía cạnh cùng phát triển: nền tảng × giao diện, loại báo cáo × định dạng xuất.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Hay bị nhầm với Adapter. Bridge thiết kế từ đầu để tách; Adapter vá cho hai thứ có sẵn khớp nhau.</div>
          </div>
        </section>
        <section id="st-composite">
          <h2><span className="n">03</span>Composite <small className="vn">Cây đối tượng</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Dữ liệu dạng cây (thư mục và file, menu và mục con, đơn hàng và combo) mà muốn xử lý nút lá và nút nhánh như nhau.</div>
            <div><span className="pl">Ý tưởng</span>Lá và nhánh cùng hiện thực một interface; nhánh gọi đệ quy xuống các con.</div>
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

const lunch = new Combo(0.1).add(new Product("Phở", 50000)).add(new Product("Trà đá", 5000));
const cart = new Combo().add(lunch).add(new Product("Bánh flan", 15000));
console.log(cart.price()); // 64500`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Cấu trúc cây: UI component, cây thư mục, tổ chức phòng ban, biểu thức.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Interface chung có thể buộc lá hiện thực các phương thức chỉ nhánh mới cần (như <code>add</code>).</div>
          </div>
        </section>
        <section id="st-decorator">
          <h2><span className="n">04</span>Decorator <small className="vn">Bọc thêm chức năng</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Muốn thêm log, cache, retry cho một service mà không sửa code gốc và không tạo lớp con cho từng tổ hợp.</div>
            <div><span className="pl">Ý tưởng</span>Bọc đối tượng trong một lớp cùng interface, làm thêm việc trước hoặc sau khi gọi vào đối tượng bên trong. Có thể bọc nhiều lớp chồng nhau.</div>
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
            <div><span className="pl">Khi nào dùng</span>Middleware, cache, retry, logging, kiểm tra quyền quanh một service. Middleware của Express hay interceptor của gRPC là cùng ý tưởng.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Thứ tự bọc quan trọng: log ngoài cache khác log trong cache. Đừng nhầm với cú pháp <code>@decorator</code> của TypeScript, dù có thể dùng nó để hiện thực.</div>
          </div>
        </section>
        <section id="st-facade">
          <h2><span className="n">05</span>Facade <small className="vn">Mặt tiền</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Một nghiệp vụ cần gọi nhiều subsystem theo đúng thứ tự; mọi nơi gọi đều phải biết chi tiết đó.</div>
            <div><span className="pl">Ý tưởng</span>Tạo một lớp với vài phương thức đơn giản, bên trong điều phối các subsystem.</div>
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
    await this.notifier.send(user.email, \`Đã đặt hàng, mã vận đơn \${tracking}\`);
    return { txId, tracking };
  }
}`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Đơn giản hóa thư viện phức tạp, gom một use case thành một điểm gọi, tầng service trong kiến trúc nhiều lớp.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Facade dễ phình thành “god object” làm mọi thứ. Giữ nó mỏng, chỉ điều phối.</div>
          </div>
        </section>
        <section id="st-flyweight">
          <h2><span className="n">06</span>Flyweight <small className="vn">Dùng chung phần giống nhau</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Hàng trăm nghìn đối tượng nhỏ cùng chứa một phần dữ liệu lặp lại, tốn bộ nhớ.</div>
            <div><span className="pl">Ý tưởng</span>Tách phần dữ liệu không đổi (intrinsic) ra dùng chung; mỗi đối tượng chỉ giữ phần riêng (extrinsic).</div>
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
            <div><span className="pl">Khi nào dùng</span>Tồn kho theo từng serial, danh sách sản phẩm lặp lại nhiều lần, game, bản đồ, cache chuỗi lặp lại.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Chỉ đáng làm khi đo thấy vấn đề bộ nhớ thật; code phức tạp hơn đáng kể.</div>
          </div>
        </section>
        <section id="st-proxy">
          <h2><span className="n">07</span>Proxy <small className="vn">Đại diện</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Cần kiểm soát truy cập tới một đối tượng: tải trễ, kiểm tra quyền, gọi từ xa, giới hạn tần suất.</div>
            <div><span className="pl">Ý tưởng</span>Một đối tượng cùng interface đứng trước đối tượng thật và quyết định có chuyển lời gọi vào hay không.</div>
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
            <div><span className="pl">Khi nào dùng</span>Lazy loading, phân quyền, stub gọi từ xa (gRPC client stub chính là proxy), rate limit.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Khác Decorator ở ý định: Proxy kiểm soát truy cập và thường tự quản lý đối tượng thật; Decorator thêm hành vi và nhận đối tượng từ bên ngoài.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
