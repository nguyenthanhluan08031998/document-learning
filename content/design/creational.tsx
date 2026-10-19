import { Code } from "@/components/Code";

export default function CreationalPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Creational: cách tạo đối tượng">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#cr-singleton"><span>01</span>Singleton</a></li>
          <li><a href="#cr-factory-method"><span>02</span>Factory Method</a></li>
          <li><a href="#cr-abstract-factory"><span>03</span>Abstract Factory</a></li>
          <li><a href="#cr-builder"><span>04</span>Builder</a></li>
          <li><a href="#cr-prototype"><span>05</span>Prototype</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">design pattern · creational</div>
          <h1>Creational: cách tạo đối tượng</h1>
          <p className="lede">Năm pattern giúp tách việc <b>tạo</b> đối tượng ra khỏi nơi <b>dùng</b> đối tượng, để code dùng chỉ biết interface chứ không biết lớp cụ thể.</p>
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
                  <td><a className="plink" href="#cr-singleton">Singleton</a></td>
                  <td>Một thể hiện duy nhất</td>
                  <td>Ẩn constructor, cung cấp một điểm truy cập trả về cùng một thể hiện.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#cr-factory-method">Factory Method</a></td>
                  <td>Phương thức tạo</td>
                  <td>Đưa việc tạo đối tượng vào một phương thức; lớp con hoặc tham số quyết định tạo loại cụ thể nào.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#cr-abstract-factory">Abstract Factory</a></td>
                  <td>Nhà máy trừu tượng</td>
                  <td>Một interface factory có nhiều phương thức tạo, mỗi hiện thực tạo ra một bộ đồng nhất.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#cr-builder">Builder</a></td>
                  <td>Xây từng bước</td>
                  <td>Tạo đối tượng qua chuỗi lời gọi có tên rõ ràng, cuối cùng gọi <code>build()</code>.</td>
                </tr>
                <tr>
                  <td><a className="plink" href="#cr-prototype">Prototype</a></td>
                  <td>Nhân bản</td>
                  <td>Sao chép một đối tượng mẫu rồi chỉnh phần khác biệt.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="cr-singleton">
          <h2><span className="n">01</span>Singleton <small className="vn">Một thể hiện duy nhất</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Cần đúng một đối tượng dùng chung cho cả ứng dụng, ví dụ cấu hình hoặc connection pool, và không muốn mỗi nơi tự tạo một bản.</div>
            <div><span className="pl">Ý tưởng</span>Ẩn constructor, cung cấp một điểm truy cập trả về cùng một thể hiện.</div>
          </div>
          <Code lang="ts">{`class Config {
  private static instance: Config | undefined;
  private constructor(readonly dbUrl: string) {}

  static get(): Config {
    // Lazily create the single instance on first access
    if (!Config.instance) Config.instance = new Config(process.env.DB_URL ?? "");
    return Config.instance;
  }
}

const a = Config.get();
const b = Config.get();
console.log(a === b); // true`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Tài nguyên dùng chung thật sự duy nhất: logger, config, pool.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Dễ thành biến toàn cục trá hình, khó test vì không thay được. Trong TypeScript, một module export sẵn một object (<code>export const config = …</code>) đã là singleton; ưu tiên dependency injection.</div>
          </div>
        </section>
        <section id="cr-factory-method">
          <h2><span className="n">02</span>Factory Method <small className="vn">Phương thức tạo</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Code tạo đối tượng bằng <code>new</code> rải khắp nơi, mỗi lần thêm loại mới phải sửa nhiều chỗ.</div>
            <div><span className="pl">Ý tưởng</span>Đưa việc tạo đối tượng vào một phương thức; lớp con hoặc tham số quyết định tạo loại cụ thể nào.</div>
          </div>
          <Code lang="ts">{`interface Notifier { send(to: string, msg: string): Promise<void>; }

class EmailNotifier implements Notifier {
  async send(to: string, msg: string) { /* call SMTP */ }
}
class SmsNotifier implements Notifier {
  async send(to: string, msg: string) { /* call SMS gateway */ }
}

type Channel = "email" | "sms";

function createNotifier(channel: Channel): Notifier {
  // The only place that knows concrete classes
  switch (channel) {
    case "email": return new EmailNotifier();
    case "sms": return new SmsNotifier();
  }
}

await createNotifier("sms").send("0901...", "Đơn hàng đã giao");`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Nơi dùng chỉ cần biết interface, loại cụ thể chọn theo cấu hình hay dữ liệu.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Đừng tạo factory cho lớp chỉ có một cách khởi tạo; thêm lớp trung gian vô ích.</div>
          </div>
        </section>
        <section id="cr-abstract-factory">
          <h2><span className="n">03</span>Abstract Factory <small className="vn">Nhà máy trừu tượng</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Cần tạo cả một <b>bộ</b> đối tượng đi cùng nhau (ví dụ storage + queue của AWS, hoặc của GCP) và không được trộn lẫn hai bộ.</div>
            <div><span className="pl">Ý tưởng</span>Một interface factory có nhiều phương thức tạo, mỗi hiện thực tạo ra một bộ đồng nhất.</div>
          </div>
          <Code lang="ts">{`interface Storage { put(key: string, data: Buffer): Promise<void>; }
interface Queue { publish(msg: string): Promise<void>; }

interface CloudFactory {
  createStorage(): Storage;
  createQueue(): Queue;
}

class AwsFactory implements CloudFactory {
  createStorage(): Storage { return new S3Storage(); }
  createQueue(): Queue { return new SqsQueue(); }
}
class GcpFactory implements CloudFactory {
  createStorage(): Storage { return new GcsStorage(); }
  createQueue(): Queue { return new PubSubQueue(); }
}

// Application code depends only on the abstract factory
function bootstrap(cloud: CloudFactory) {
  const storage = cloud.createStorage();
  const queue = cloud.createQueue();
  return { storage, queue };
}`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Nhiều họ sản phẩm thay thế nhau trọn gói: theme giao diện, nhà cung cấp cloud, môi trường test và production.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Thêm một loại sản phẩm mới phải sửa interface và mọi factory.</div>
          </div>
        </section>
        <section id="cr-builder">
          <h2><span className="n">04</span>Builder <small className="vn">Xây từng bước</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Đối tượng có nhiều tham số tùy chọn, constructor dài và dễ truyền nhầm thứ tự.</div>
            <div><span className="pl">Ý tưởng</span>Tạo đối tượng qua chuỗi lời gọi có tên rõ ràng, cuối cùng gọi <code>build()</code>.</div>
          </div>
          <Code lang="ts">{`class HttpRequest {
  constructor(
    readonly method: string, readonly url: string,
    readonly headers: Record<string, string>, readonly body?: string,
    readonly timeoutMs = 5000,
  ) {}
}

class RequestBuilder {
  private method = "GET";
  private headers: Record<string, string> = {};
  private body?: string;
  private timeoutMs = 5000;
  constructor(private url: string) {}

  post(body: unknown) { this.method = "POST"; this.body = JSON.stringify(body); return this; }
  header(k: string, v: string) { this.headers[k] = v; return this; }
  timeout(ms: number) { this.timeoutMs = ms; return this; }
  build() { return new HttpRequest(this.method, this.url, this.headers, this.body, this.timeoutMs); }
}

const req = new RequestBuilder("/orders")
  .post({ sku: "A1", qty: 2 })
  .header("Idempotency-Key", crypto.randomUUID())
  .timeout(3000)
  .build();`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Đối tượng phức tạp, nhiều tùy chọn: query builder, HTTP request, dữ liệu test.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Với TypeScript, một object tham số <code>{"{ url, method?, timeout? }"}</code> thường đã đủ; chỉ dùng Builder khi cần kiểm tra từng bước hoặc tạo theo nhiều giai đoạn.</div>
          </div>
        </section>
        <section id="cr-prototype">
          <h2><span className="n">05</span>Prototype <small className="vn">Nhân bản</small></h2>
          <div className="pp">
            <div><span className="pl">Vấn đề</span>Tạo đối tượng mới từ đầu tốn kém hoặc phức tạp, trong khi đã có sẵn một mẫu gần giống.</div>
            <div><span className="pl">Ý tưởng</span>Sao chép một đối tượng mẫu rồi chỉnh phần khác biệt.</div>
          </div>
          <Code lang="ts">{`interface Cloneable<T> { clone(): T; }

class ReportTemplate implements Cloneable<ReportTemplate> {
  constructor(public title: string, public sections: string[], public style: { font: string }) {}

  clone(): ReportTemplate {
    // Deep copy so the clone does not share nested objects
    return new ReportTemplate(this.title, [...this.sections], { ...this.style });
  }
}

const base = new ReportTemplate("Báo cáo tháng", ["Doanh thu", "Chi phí"], { font: "Inter" });
const q4 = base.clone();
q4.title = "Báo cáo quý 4";
q4.sections.push("Dự báo");

// structuredClone() also works for plain data objects`}</Code>
          <div className="pp">
            <div><span className="pl">Khi nào dùng</span>Nhiều đối tượng chỉ khác nhau vài thuộc tính, cấu hình mặc định, dữ liệu test.</div>
            <div className="warnc"><span className="pl">Lưu ý</span>Cẩn thận shallow copy: object lồng nhau bị dùng chung giữa bản gốc và bản sao.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
