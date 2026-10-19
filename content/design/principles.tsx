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
          <li><a href="#pr-more"><span>07</span>Nguyên tắc khác</a></li>
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
          <Code lang="ts">{`class FileStorage { write(path: string, data: string) { /* ... */ } }

// Violation: callers of FileStorage do not expect write() to throw
class ReadOnlyStorage extends FileStorage {
  write() { throw new Error("read only"); }
}

// Better: model the capability explicitly
interface Readable { read(path: string): string; }
interface Writable { write(path: string, data: string): void; }`}</Code>
        </section>
        <section id="pr-isp">
          <h2><span className="n">05</span>Interface Segregation</h2>
          <p>Không bắt client phụ thuộc vào phương thức nó không dùng. Chia interface lớn thành nhiều interface nhỏ theo vai trò.</p>
          <Code lang="ts">{`// Instead of one fat UserService interface:
interface UserReader { findById(id: string): Promise<User | null>; }
interface UserWriter { save(u: User): Promise<void>; }

// A report job only needs reading, so tests only mock one method
class ActivityReport { constructor(private users: UserReader) {} }`}</Code>
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
        <section id="pr-more">
          <h2><span className="n">07</span>Nguyên tắc khác</h2>
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
