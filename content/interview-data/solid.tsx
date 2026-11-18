import { Flow } from "@/components/Flow";
import type { InterviewData } from "@/components/InterviewList";
import type { Locale } from "@/lib/notebook";

const SOLID = "https://en.wikipedia.org/wiki/SOLID";
const DIP = "https://en.wikipedia.org/wiki/Dependency_inversion_principle";
const LSP = "https://en.wikipedia.org/wiki/Liskov_substitution_principle";
const NEST_DI = "https://docs.nestjs.com/providers#dependency-injection";
const TS_CLASSES = "https://www.typescriptlang.org/docs/handbook/2/classes.html";
const COMPOSITION = "https://en.wikipedia.org/wiki/Composition_over_inheritance";

export default function build(l: Locale): InterviewData {
  const t = (vi: string, en: string) => (l === "vi" ? vi : en);
  return {
    eyebrow: t("phỏng vấn · oop, solid", "interview · oop, solid"),
    title: t("Phỏng vấn OOP & SOLID", "OOP & SOLID interview"),
    lede: t(
      "Bấm vào câu hỏi để xem đáp án, ví dụ và sơ đồ. Ví dụ viết bằng TypeScript quanh hệ thống bán hàng (order, payment). Bài học chi tiết ở BE → Thiết kế → Nguyên tắc.",
      "Click a question to see the answer, an example and a diagram. Examples are TypeScript around the shop system (orders, payments). The full lesson is in BE → Design → Principles.",
    ),
    items: [
      {
        q: t("SOLID là gì? Kể tên 5 nguyên tắc.", "What is SOLID? Name the 5 principles."),
        a: [
          t(
            "SOLID là 5 nguyên tắc thiết kế hướng đối tượng do Robert C. Martin (Uncle Bob) tổng hợp, giúp code dễ hiểu, dễ mở rộng, dễ test và ít vỡ khi thay đổi.",
            "SOLID is 5 object-oriented design principles collected by Robert C. Martin (Uncle Bob) that make code easier to understand, extend and test, and less fragile under change.",
          ),
          t(
            "S - Single Responsibility: mỗi class chỉ có một lý do để thay đổi. O - Open/Closed: mở để mở rộng, đóng để sửa đổi. L - Liskov Substitution: class con thay được class cha mà không làm sai chương trình. I - Interface Segregation: nhiều interface nhỏ, chuyên biệt tốt hơn một interface to. D - Dependency Inversion: phụ thuộc vào abstraction (interface), không phụ thuộc vào class cụ thể.",
            "S - Single Responsibility: a class has only one reason to change. O - Open/Closed: open for extension, closed for modification. L - Liskov Substitution: a subclass can replace its parent without breaking the program. I - Interface Segregation: many small, focused interfaces beat one big one. D - Dependency Inversion: depend on abstractions (interfaces), not on concrete classes.",
          ),
        ],
        diagram: <Flow id="solid" label="SOLID" steps={[
          { title: "S", sub: t("1 lý do để đổi", "1 reason to change") },
          { title: "O", sub: t("thêm, không sửa", "add, don't edit") },
          { title: "L", sub: t("con thay được cha", "child replaces parent"), hl: true },
          { title: "I", sub: t("interface nhỏ", "small interfaces") },
          { title: "D", sub: t("phụ thuộc interface", "depend on interfaces"), hl: true },
        ]} />,
        href: SOLID, label: "SOLID (Wikipedia)",
      },
      {
        q: t("Single Responsibility: \"một trách nhiệm\" nghĩa là gì?", "Single Responsibility: what does \"one responsibility\" mean?"),
        a: t(
          "Không phải \"một hàm\" hay \"làm một việc nhỏ\", mà là \"chỉ một lý do để thay đổi\", tức chỉ phục vụ một nhóm người hoặc một mối quan tâm. Ví dụ OrderService vừa tính tiền, vừa lưu DB, vừa gửi email thì sẽ phải sửa khi đổi cách tính giá, khi đổi DB, và khi đổi mẫu email: ba lý do, nên tách ra.",
          "It does not mean \"one function\" or \"one tiny task\" but \"only one reason to change\", serving one group of people or one concern. An OrderService that prices, saves to the DB and sends emails changes when pricing, the DB or the email template changes: three reasons, so split it.",
        ),
        code: { lang: "ts", src: `// ${t("Sai: 3 lý do để thay đổi", "Bad: 3 reasons to change")}
class OrderService {
  total(o: Order) { /* ${t("tính tiền, thuế", "pricing, tax")} */ }
  save(o: Order) { /* SQL */ }
  sendConfirmation(o: Order) { /* SMTP, ${t("mẫu email", "email template")} */ }
}

// ${t("Đúng: mỗi class một lý do", "Good: one reason each")}
class PriceCalculator { total(o: Order) { /* ... */ } }
class OrderRepository { save(o: Order) { /* ... */ } }
class OrderMailer     { sendConfirmation(o: Order) { /* ... */ } }` },
        href: SOLID, label: "SOLID (Wikipedia)",
      },
      {
        q: t("Open/Closed: làm sao thêm tính năng mà không sửa code cũ?", "Open/Closed: how do you add features without editing old code?"),
        a: t(
          "Đưa phần hay thay đổi ra sau một interface, mỗi biến thể là một class mới. Thêm phương thức thanh toán mới thì viết thêm class, không phải sửa chuỗi if/else hay switch đã chạy ổn định (sửa code cũ dễ làm hỏng chỗ đang chạy). Dấu hiệu vi phạm: switch theo type lặp lại ở nhiều nơi.",
          "Put the part that varies behind an interface, with each variant as a new class. Adding a payment method means writing a new class, not editing a working if/else or switch (editing old code risks breaking what works). Warning sign: the same switch on type repeated in many places.",
        ),
        code: { lang: "ts", src: `// ${t("Sai: thêm ZaloPay phải sửa hàm này", "Bad: adding ZaloPay means editing this")}
function pay(method: string, amount: number) {
  if (method === "card") { /* ... */ }
  else if (method === "momo") { /* ... */ }
}

// ${t("Đúng: thêm class mới, không đụng code cũ", "Good: add a class, touch no old code")}
interface PaymentMethod { pay(amount: number): Promise<void> }
class CardPayment implements PaymentMethod { async pay(a: number) { /* ... */ } }
class MomoPayment implements PaymentMethod { async pay(a: number) { /* ... */ } }
class ZaloPayPayment implements PaymentMethod { async pay(a: number) { /* ${t("mới", "new")} */ } }

const checkout = (m: PaymentMethod, amount: number) => m.pay(amount);` },
        href: SOLID, label: "SOLID (Wikipedia)",
      },
      {
        q: t("Liskov Substitution: ví dụ vi phạm kinh điển?", "Liskov Substitution: the classic violation?"),
        a: [
          t(
            "Chỗ nào dùng class cha thì thay bằng class con vẫn phải chạy đúng, không bất ngờ. Class con không được đòi hỏi đầu vào chặt hơn, không được trả kết quả lỏng hơn, không được ném lỗi mà cha không ném.",
            "Wherever the parent is used, a subclass must work correctly with no surprises. A subclass must not demand stricter input, return looser output, or throw errors the parent does not throw.",
          ),
          t(
            "Ví dụ kinh điển: Square kế thừa Rectangle. Đặt width của hình vuông thì height cũng đổi theo, nên code đang dùng Rectangle (đặt width 5, height 4, mong diện tích 20) bị sai. Ví dụ thực tế: GiftCardPayment kế thừa PaymentMethod nhưng refund() ném \"not supported\". Cách sửa: tách interface (Refundable) hoặc dùng composition thay vì kế thừa.",
            "Classic example: Square extends Rectangle. Setting a square's width also changes its height, so code that uses Rectangle (width 5, height 4, expects area 20) breaks. A real one: GiftCardPayment extends PaymentMethod but refund() throws \"not supported\". Fix it by splitting the interface (Refundable) or using composition instead of inheritance.",
          ),
        ],
        code: { lang: "ts", src: `class Rectangle {
  constructor(public width = 0, public height = 0) {}
  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
  area() { return this.width * this.height; }
}
class Square extends Rectangle {
  setWidth(w: number) { this.width = this.height = w; }    // ${t("đổi luôn height", "also changes height")}
  setHeight(h: number) { this.width = this.height = h; }
}

function resize(r: Rectangle) {
  r.setWidth(5); r.setHeight(4);
  console.log(r.area());   // Rectangle: 20, Square: 16  ← ${t("vi phạm LSP", "LSP violated")}
}` },
        href: LSP, label: "Liskov substitution principle",
      },
      {
        q: t("Interface Segregation là gì?", "What is Interface Segregation?"),
        a: t(
          "Không ép class implement những phương thức nó không dùng. Một interface to (vừa thanh toán, vừa hoàn tiền, vừa trả góp) khiến nhiều class phải viết hàm rỗng hoặc ném lỗi, và đổi một phương thức làm ảnh hưởng mọi class. Chia thành nhiều interface nhỏ, class nào cần gì implement nấy.",
          "Do not force classes to implement methods they do not use. One big interface (pay, refund, installments) makes many classes write empty methods or throw, and changing one method affects every class. Split it into small interfaces; each class implements only what it needs.",
        ),
        code: { lang: "ts", src: `// ${t("Sai", "Bad")}
interface PaymentGateway { pay(): void; refund(): void; installment(months: number): void }
class GiftCard implements PaymentGateway {
  pay() {}
  refund() { throw new Error("not supported"); }        // ${t("bị ép", "forced")}
  installment() { throw new Error("not supported"); }
}

// ${t("Đúng", "Good")}
interface Payable { pay(): void }
interface Refundable { refund(): void }
interface Installable { installment(months: number): void }
class GiftCardPay implements Payable { pay() {} }
class CardPay implements Payable, Refundable, Installable { pay() {} refund() {} installment() {} }` },
        href: SOLID, label: "SOLID (Wikipedia)",
      },
      {
        q: t("Dependency Inversion khác Dependency Injection thế nào?", "Dependency Inversion vs Dependency Injection?"),
        a: [
          t(
            "Dependency Inversion (chữ D trong SOLID) là nguyên tắc: module cấp cao (OrderService) và module cấp thấp (PostgresRepo, StripeClient) đều phụ thuộc vào abstraction (interface), không phụ thuộc trực tiếp vào nhau. Interface do phía cấp cao định nghĩa.",
            "Dependency Inversion (the D in SOLID) is a principle: high-level modules (OrderService) and low-level modules (PostgresRepo, StripeClient) both depend on abstractions (interfaces), not directly on each other. The interface is owned by the high-level side.",
          ),
          t(
            "Dependency Injection là kỹ thuật để làm được điều đó: đối tượng không tự new phụ thuộc mà nhận từ bên ngoài (qua constructor). IoC container như NestJS tự tạo và tiêm các phụ thuộc. Lợi ích lớn nhất: đổi DB hoặc cổng thanh toán không phải sửa OrderService, và khi test thì truyền mock vào dễ dàng.",
            "Dependency Injection is the technique that achieves it: an object does not new up its dependencies but receives them from outside (via the constructor). An IoC container such as NestJS creates and injects them for you. Biggest win: swapping the DB or payment provider needs no change to OrderService, and tests can pass in mocks easily.",
          ),
        ],
        diagram: <Flow id="soliddip" label="Dependency inversion" steps={[
          { title: "OrderService", sub: t("cấp cao", "high level") },
          { title: "OrderRepository", sub: "interface", hl: true },
          { title: "PostgresOrderRepo", sub: t("cấp thấp, implement", "low level, implements") },
        ]} caption={t("Cả hai phía cùng trỏ vào interface ở giữa.", "Both sides point at the interface in the middle.")} />,
        code: [
          { lang: "ts", src: `// ${t("Sai: dính chặt vào Postgres, khó test", "Bad: welded to Postgres, hard to test")}
class OrderService {
  private repo = new PostgresOrderRepo();
}

// ${t("Đúng: phụ thuộc interface, nhận qua constructor", "Good: depend on an interface, injected via the constructor")}
interface OrderRepository { save(o: Order): Promise<void> }

class OrderService {
  constructor(private readonly repo: OrderRepository) {}
  place(o: Order) { return this.repo.save(o); }
}

new OrderService(new PostgresOrderRepo());     // production
new OrderService({ save: async () => {} });    // test` },
          { lang: "ts", src: `// NestJS: ${t("container tự tiêm phụ thuộc", "the container injects dependencies")}
@Injectable()
export class OrderService {
  constructor(@Inject("OrderRepository") private readonly repo: OrderRepository) {}
}

@Module({
  providers: [OrderService, { provide: "OrderRepository", useClass: PostgresOrderRepo }],
})
export class OrderModule {}` },
        ],
        href: DIP, label: "Dependency inversion principle",
      },
      {
        q: t("4 tính chất của OOP?", "The 4 pillars of OOP?"),
        a: t(
          "Encapsulation (đóng gói): giấu dữ liệu bên trong, chỉ cho thay đổi qua phương thức (private, getter). Abstraction (trừu tượng): chỉ lộ ra cái cần dùng, giấu chi tiết cài đặt (interface). Inheritance (kế thừa): class con dùng lại code của class cha. Polymorphism (đa hình): cùng một lời gọi, mỗi đối tượng xử lý theo cách riêng (payment.pay() với Card, Momo khác nhau).",
          "Encapsulation: hide internal data and only allow changes through methods (private, getters). Abstraction: expose only what is needed and hide implementation details (interfaces). Inheritance: a subclass reuses its parent's code. Polymorphism: the same call is handled differently by each object (payment.pay() for Card vs Momo).",
        ),
        code: { lang: "ts", src: `class Order {
  private items: Item[] = [];                       // Encapsulation
  addItem(i: Item) {
    if (i.qty <= 0) throw new Error("qty > 0");     // ${t("giữ dữ liệu luôn hợp lệ", "keeps data valid")}
    this.items.push(i);
  }
  get total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); }
}

const methods: PaymentMethod[] = [new CardPayment(), new MomoPayment()];
for (const m of methods) await m.pay(100);          // Polymorphism` },
        href: TS_CLASSES, label: "TypeScript classes",
      },
      {
        q: t("Composition hay inheritance?", "Composition or inheritance?"),
        a: t(
          "Ưu tiên composition (ghép đối tượng: \"có một\") hơn inheritance (kế thừa: \"là một\"). Kế thừa ràng buộc chặt, cây kế thừa sâu khó đổi và dễ vi phạm Liskov. Composition linh hoạt hơn: đổi hành vi bằng cách đổi thành phần, có thể thay lúc runtime. Chỉ dùng kế thừa khi quan hệ \"là một\" thật sự đúng và class con dùng được toàn bộ hành vi của cha.",
          "Prefer composition (\"has a\") over inheritance (\"is a\"). Inheritance couples tightly; deep hierarchies are hard to change and easily break Liskov. Composition is more flexible: change behavior by swapping a part, even at runtime. Use inheritance only when \"is a\" truly holds and the subclass can use all of the parent's behavior.",
        ),
        code: { lang: "ts", src: `// ${t("Kế thừa: muốn vừa log vừa retry phải tạo thêm class", "Inheritance: logging + retry needs yet another class")}
class LoggingPayment extends CardPayment { /* ... */ }
class RetryingLoggingPayment extends LoggingPayment { /* ... */ }

// Composition: ${t("ghép tuỳ ý", "mix freely")}
class Retry implements PaymentMethod {
  constructor(private inner: PaymentMethod, private times = 3) {}
  async pay(a: number) {
    for (let i = 1; ; i++) {
      try { return await this.inner.pay(a); } catch (e) { if (i >= this.times) throw e; }
    }
  }
}
const payment = new Retry(new Logging(new CardPayment()));` },
        href: COMPOSITION, label: "Composition over inheritance",
      },
      {
        q: t("Áp dụng SOLID quá đà thì sao?", "What happens if you overdo SOLID?"),
        a: t(
          "Sinh ra quá nhiều interface chỉ có một implementation, quá nhiều lớp trung gian, đọc một tính năng phải nhảy qua mười file. SOLID là công cụ để quản lý thay đổi, không phải luật bắt buộc. Áp dụng khi có lý do thật: phần đó hay thay đổi, cần nhiều biến thể, hoặc cần mock khi test. Code đơn giản, ít đổi thì giữ đơn giản (KISS, YAGNI).",
          "You get many interfaces with a single implementation, layers of indirection, and ten files to jump through to read one feature. SOLID is a tool for managing change, not a law. Apply it when there is a real reason: that part changes often, needs several variants, or must be mocked in tests. Keep simple, stable code simple (KISS, YAGNI).",
        ),
        href: NEST_DI, label: "NestJS dependency injection",
      },
    ],
  };
}
