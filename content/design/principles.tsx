import { Code } from "@/components/Code";

export default function PrinciplesPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục nguyên tắc">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#pr-why"><span>01</span>Pattern là gì</a></li>
          <li><a href="#pr-srp"><span>02</span>S · Single Responsibility</a></li>
          <li><a href="#pr-ocp"><span>03</span>O · Open/Closed</a></li>
          <li><a href="#pr-lsp"><span>04</span>L · Liskov Substitution</a></li>
          <li><a href="#pr-isp"><span>05</span>I · Interface Segregation</a></li>
          <li><a href="#pr-dip"><span>06</span>D · Dependency Inversion</a></li>
          <li><a href="#pr-refactor"><span>07</span>Refactor từng bước</a></li>
          <li><a href="#pr-more"><span>08</span>Nguyên tắc khác</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design · nguyên tắc nền</div>
          <h1>Nguyên tắc trước, pattern sau</h1>
          <p className="lede">Design pattern là lời giải đã được đặt tên cho các vấn đề thiết kế lặp đi lặp lại. Chúng đều xuất phát từ vài nguyên tắc nền, quan trọng nhất là <b>SOLID</b>. Hiểu nguyên tắc thì tự nhận ra khi nào cần pattern, khi nào không. Chưa vững class, interface, kế thừa thì xem tab <b>OOP</b> trước.</p>
          <div className="tape" aria-hidden="true">
            <div>S</div>
            <div>O</div>
            <div>L</div>
            <div>I</div>
            <div className="hw">D</div>
          </div>
        </header>
        <section id="pr-why">
          <h2><span className="n">01</span>Pattern là gì, chia nhóm thế nào</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Nhóm</th>
                  <th>Giải quyết</th>
                  <th>Số lượng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Creational</b></td>
                  <td>Cách <b>tạo</b> đối tượng mà không phụ thuộc lớp cụ thể</td>
                  <td className="n">5</td>
                </tr>
                <tr>
                  <td><b>Structural</b></td>
                  <td>Cách <b>ghép</b> lớp và đối tượng thành cấu trúc lớn hơn</td>
                  <td className="n">7</td>
                </tr>
                <tr>
                  <td><b>Behavioral</b></td>
                  <td>Cách các đối tượng <b>giao tiếp</b> và chia trách nhiệm</td>
                  <td className="n">11</td>
                </tr>
                <tr>
                  <td><b>Microservice</b></td>
                  <td>Vấn đề khi hệ thống chạy trên nhiều service, qua mạng</td>
                  <td>nhiều</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>23 pattern đầu đến từ cuốn <em>Design Patterns</em> (1994) của nhóm “Gang of Four” (GoF). Nhóm microservice được tổng hợp sau này từ kinh nghiệm xây hệ thống phân tán.</p>
          <div className="note"><b>Đừng ép pattern vào code.</b> Pattern có giá phải trả: thêm lớp, thêm gián tiếp. Viết đơn giản trước, khi thấy đau (sửa một chỗ phải đụng mười chỗ, khó test) thì mới tìm pattern phù hợp.</div>
        </section>
        <section id="pr-srp">
          <h2><span className="n">02</span>Single Responsibility</h2>
          <p>Mỗi module chỉ nên có <b>một lý do để thay đổi</b>, tức là phục vụ một nhóm người dùng hoặc một mối quan tâm.</p>
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
          <p>Mở để <b>mở rộng</b>, đóng để <b>sửa đổi</b>: thêm tính năng bằng cách thêm code mới, không sửa code đã chạy ổn.</p>
          <Code lang="ts">{`// Adding a new discount type means adding an object, not editing a switch
interface Discount { applies(o: Order): boolean; amount(o: Order): number; }

const discounts: Discount[] = [newCustomer, flashSale, voucher];
const totalDiscount = (o: Order) =>
  discounts.filter(d => d.applies(o)).reduce((s, d) => s + d.amount(o), 0);`}</Code>
          <p>Pattern liên quan: Strategy, Decorator, Observer, Template Method.</p>
        </section>
        <section id="pr-lsp">
          <h2><span className="n">04</span>Liskov Substitution</h2>
          <p>Lớp con phải <b>thay được lớp cha</b> mà không làm sai chương trình: không đòi hỏi thêm điều kiện đầu vào, không trả về ít hơn điều đã hứa, không ném lỗi bất ngờ.</p>
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
          <p>Không bắt client phụ thuộc vào phương thức nó không dùng. Chia interface lớn thành nhiều interface nhỏ theo vai trò.</p>
          <Code lang="ts">{`// Instead of one fat UserService interface:
interface UserReader { findById(id: string): Promise<User | null>; }
interface UserWriter { save(u: User): Promise<void>; }

// A customer report job only needs reading, so tests only mock one method
class CustomerReport { constructor(private users: UserReader) {} }`}</Code>
        </section>
        <section id="pr-dip">
          <h2><span className="n">06</span>Dependency Inversion</h2>
          <p>Module cấp cao (nghiệp vụ) không phụ thuộc module cấp thấp (database, HTTP); <b>cả hai cùng phụ thuộc vào abstraction</b>, và abstraction do phía nghiệp vụ định nghĩa. Đây là nền móng của Clean Architecture.</p>
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
          <h2><span className="n">07</span>Refactor từng bước: OrderService</h2>
          <p>Áp cả 5 nguyên tắc lên <b>một</b> đoạn code thật để thấy chúng bổ trợ nhau thế nào. Điểm xuất phát là một service thanh toán đơn hàng viết kiểu “chạy được là được”.</p>
          <h3>Code ban đầu</h3>
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
          <p>Một class làm 5 việc. Thêm ZaloPay phải sửa <code>if/else</code>. MySQL và SMTP bị <code>new</code> cứng bên trong nên không viết unit test được nếu không có DB và mail server thật.</p>
          <h3>Bước 1 · S: tách theo trách nhiệm</h3>
          <p>Phần nào có lý do thay đổi riêng thì tách thành class riêng. Đổi cách tính giá chỉ sửa <code>PriceCalculator</code>, đổi mẫu email chỉ sửa <code>EmailNotifier</code>.</p>
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
          <h3>Bước 2 · O: thay if/else bằng interface</h3>
          <p>Mỗi cổng thanh toán là một class cùng hiện thực một interface. Thêm cổng mới chỉ cần thêm class mới, không đụng vào code đang chạy ổn.</p>
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
          <h3>Bước 3 · L: class con không được phá hợp đồng</h3>
          <p>Thêm thanh toán khi nhận hàng (COD). Nếu <code>pay()</code> ném lỗi thì mọi chỗ đang dùng <code>PaymentGateway</code> sẽ hỏng khi nhận được COD.</p>
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
          <h3>Bước 4 · I: interface nhỏ theo khả năng</h3>
          <p>Khi cần thêm hoàn tiền và trả góp, đừng nhồi hết vào một interface. Nếu không, COD sẽ phải viết <code>refund()</code> rồi ném “not supported”, tức là lại vi phạm L.</p>
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
          <h3>Bước 5 · D: nhận dependency qua constructor</h3>
          <p><code>OrderService</code> chỉ biết interface. Việc chọn class cụ thể dồn về một chỗ duy nhất là composition root.</p>
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
          <p>Nhờ vậy unit test chỉ cần truyền object giả vào:</p>
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
          <h3>Trước và sau</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Thay đổi</th>
                  <th>Trước</th>
                  <th>Sau</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Thêm ZaloPay</b></td>
                  <td>Sửa <code>if/else</code> trong <code>checkout</code></td>
                  <td>Thêm 1 class</td>
                </tr>
                <tr>
                  <td><b>MySQL → Postgres</b></td>
                  <td>Sửa <code>OrderService</code></td>
                  <td>Viết <code>PostgresOrderRepo</code>, đổi 1 dòng ở composition root</td>
                </tr>
                <tr>
                  <td><b>Email → SMS</b></td>
                  <td>Sửa <code>OrderService</code></td>
                  <td>Viết <code>SmsNotifier</code></td>
                </tr>
                <tr>
                  <td><b>Unit test</b></td>
                  <td>Cần DB, SMTP, Momo thật</td>
                  <td>Truyền fake vào constructor</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note"><b>Đừng áp máy móc.</b> Script nhỏ hoặc logic chỉ có một cách làm mà tách ra 10 interface là over-engineering. Chỉ tách khi có <b>lý do thay đổi thật</b>: nhiều cổng thanh toán, cần test, cần đổi hạ tầng.</div>
        </section>
        <section id="pr-more">
          <h2><span className="n">08</span>Nguyên tắc khác</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Nguyên tắc</th>
                  <th>Ý nghĩa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Composition over inheritance</b></td>
                  <td>Ghép đối tượng lại thay vì kế thừa sâu. Phần lớn pattern GoF dựa trên ý này.</td>
                </tr>
                <tr>
                  <td><b>DRY</b></td>
                  <td>Mỗi kiến thức chỉ nằm một chỗ. Nhưng hai đoạn code giống nhau vì tình cờ thì không cần gộp.</td>
                </tr>
                <tr>
                  <td><b>KISS</b></td>
                  <td>Giải pháp đơn giản nhất chạy đúng thường là giải pháp tốt nhất.</td>
                </tr>
                <tr>
                  <td><b>YAGNI</b></td>
                  <td>Đừng xây cho nhu cầu tưởng tượng trong tương lai.</td>
                </tr>
                <tr>
                  <td><b>Law of Demeter</b></td>
                  <td>Chỉ nói chuyện với “hàng xóm gần”: tránh <code>order.customer.address.city.name</code>.</td>
                </tr>
                <tr>
                  <td><b>Tell, don't ask</b></td>
                  <td>Bảo đối tượng làm việc thay vì lấy dữ liệu của nó ra rồi tự quyết.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
