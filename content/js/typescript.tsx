import { Code } from "@/components/Code";

export default function JsTypescriptPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục TypeScript">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#ts-why"><span>01</span>Vì sao TypeScript</a></li>
          <li><a href="#ts-basic"><span>02</span>Kiểu cơ bản</a></li>
          <li><a href="#ts-shape"><span>03</span>interface và type</a></li>
          <li><a href="#ts-generic"><span>04</span>Generics</a></li>
          <li><a href="#ts-narrow"><span>05</span>Narrowing, union</a></li>
          <li><a href="#ts-utility"><span>06</span>Utility types</a></li>
          <li><a href="#ts-config"><span>07</span>tsconfig, best practice</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">typescript</div>
          <h1>TypeScript</h1>
          <p className="lede">TypeScript là JavaScript cộng hệ thống kiểu tĩnh. Kiểu chỉ tồn tại lúc biên dịch rồi bị xóa, nên code chạy vẫn là JavaScript. Đổi lại ta bắt lỗi sớm, có autocomplete và refactor an toàn.</p>
          <div className="tape" aria-hidden="true">
            <div>interface</div>
            <div>union</div>
            <div className="hw">generics</div>
            <div>narrowing</div>
            <div>strict</div>
          </div>
        </header>

        <section id="ts-why">
          <h2><span className="n">01</span>Vì sao TypeScript</h2>
          <Code lang="ts">{`function total(price: number, qty: number): number {
  return price * qty;
}

total(10, "2");   // compile error: string is not assignable to number
total(10);        // compile error: expected 2 arguments`}</Code>
          <ul className="plain">
            <li>Lỗi như sai kiểu, sai tên thuộc tính, quên xử lý <code>undefined</code> bị chặn lúc build thay vì lúc chạy.</li>
            <li>Kiểu là tài liệu sống: đọc chữ ký hàm là biết cần truyền gì.</li>
            <li>Đổi tên hoặc đổi cấu trúc dữ liệu, trình biên dịch chỉ ra mọi chỗ phải sửa.</li>
            <li>Kiểu <b>không</b> kiểm tra dữ liệu lúc chạy (JSON từ API, input người dùng). Phần đó vẫn cần validate, ví dụ bằng zod.</li>
          </ul>
        </section>

        <section id="ts-basic">
          <h2><span className="n">02</span>Kiểu cơ bản</h2>
          <Code lang="ts">{`const name: string = "Lan";
const age: number = 30;
const ok: boolean = true;
const ids: number[] = [1, 2, 3];
const pair: [string, number] = ["a", 1];      // tuple: fixed length and types

let anything: unknown;                         // safe "unknown": must narrow before use
let unsafe: any;                               // turns the checker off, avoid

function log(msg: string): void {}             // returns nothing
function fail(msg: string): never { throw new Error(msg); } // never returns

let id: string | number = 1;                   // union
const mode: "dev" | "prod" = "dev";            // literal type
const age2 = 30;                               // inferred as number, no annotation needed`}</Code>
          <div className="note tip"><b>Để TS suy luận:</b> không cần ghi kiểu cho biến đã có giá trị khởi tạo. Chỉ ghi kiểu ở tham số hàm, giá trị trả về của hàm export, và chỗ TS không suy ra được.</div>
        </section>

        <section id="ts-shape">
          <h2><span className="n">03</span>interface và type</h2>
          <Code lang="ts">{`interface User {
  id: string;
  name: string;
  email?: string;               // optional
  readonly createdAt: Date;     // cannot be reassigned
}

interface Admin extends User {  // interfaces extend
  permissions: string[];
}

type Status = "pending" | "success" | "failed";   // union of literals
type ID = string | number;
type AdminUser = User & { permissions: string[] }; // intersection
type Handler = (event: Event) => void;             // function type`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>interface</th><th>type</th></tr>
              </thead>
              <tbody>
                <tr><td>Mô tả object</td><td>Có</td><td>Có</td></tr>
                <tr><td>Union, tuple, kiểu nguyên thủy</td><td>Không</td><td>Có</td></tr>
                <tr><td>Mở rộng</td><td><code>extends</code>, tự gộp khi khai báo trùng tên</td><td><code>&amp;</code></td></tr>
              </tbody>
            </table>
          </div>
          <p>Quy ước đơn giản: <code>interface</code> cho hình dạng object và class, <code>type</code> cho mọi thứ còn lại. Quan trọng là nhất quán trong dự án.</p>
        </section>

        <section id="ts-generic">
          <h2><span className="n">04</span>Generics</h2>
          <p>Generics cho phép viết một hàm hoặc kiểu dùng được với nhiều kiểu dữ liệu mà vẫn giữ thông tin kiểu, thay vì phải rơi về <code>any</code>.</p>
          <Code lang="ts">{`function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2, 3]);      // number | undefined
first(["a", "b"]);     // string | undefined

interface ApiResponse<T> {
  data: T;
  error?: string;
}
type UserResponse = ApiResponse<User>;

// Constraint: K must be a key of T
function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
pick(user, "name");    // string
// pick(user, "nope"); // compile error`}</Code>
        </section>

        <section id="ts-narrow">
          <h2><span className="n">05</span>Narrowing và discriminated union</h2>
          <p>Với kiểu union, TS thu hẹp kiểu theo các phép kiểm tra trong code: <code>typeof</code>, <code>instanceof</code>, <code>in</code>, so sánh bằng, hoặc kiểm tra một trường chung.</p>
          <Code lang="ts">{`function format(v: string | number) {
  if (typeof v === "string") return v.toUpperCase(); // v: string
  return v.toFixed(2);                               // v: number
}

// Discriminated union: one shared field tells the variants apart
type Result =
  | { ok: true; data: string }
  | { ok: false; error: Error };

function handle(r: Result) {
  if (r.ok) console.log(r.data);   // TS knows "data" exists here
  else console.error(r.error);     // and "error" exists here
}

// Exhaustive check: adding a new variant makes this a compile error
type Shape = { kind: "circle"; r: number } | { kind: "square"; a: number };
function area(s: Shape) {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "square": return s.a ** 2;
    default: { const _never: never = s; return _never; }
  }
}`}</Code>
        </section>

        <section id="ts-utility">
          <h2><span className="n">06</span>Utility types</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Kiểu</th><th>Ý nghĩa</th></tr>
              </thead>
              <tbody>
                <tr><td><code>Partial&lt;T&gt;</code></td><td>Mọi field thành optional</td></tr>
                <tr><td><code>Required&lt;T&gt;</code></td><td>Mọi field bắt buộc</td></tr>
                <tr><td><code>Readonly&lt;T&gt;</code></td><td>Mọi field readonly</td></tr>
                <tr><td><code>Pick&lt;T, K&gt;</code>, <code>Omit&lt;T, K&gt;</code></td><td>Chọn hoặc bỏ bớt field</td></tr>
                <tr><td><code>Record&lt;K, V&gt;</code></td><td>Object có key kiểu K, value kiểu V</td></tr>
                <tr><td><code>ReturnType&lt;F&gt;</code></td><td>Kiểu trả về của hàm F</td></tr>
                <tr><td><code>Awaited&lt;T&gt;</code></td><td>Kiểu của giá trị sau khi await một Promise</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="ts">{`type UpdateUserDto = Partial<Omit<User, "id" | "createdAt">>;
type RoleMap = Record<"admin" | "member", string[]>;
type Data = Awaited<ReturnType<typeof getUser>>;   // the resolved value of getUser

// Class with access modifiers
class Account {
  constructor(
    public readonly id: string,
    private balance: number = 0,
  ) {}

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Invalid amount");
    this.balance += amount;
  }
}`}</Code>
        </section>

        <section id="ts-config">
          <h2><span className="n">07</span>tsconfig và best practice</h2>
          <Code lang="json">{`{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2022",
    "module": "NodeNext",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}`}</Code>
          <ul className="plain">
            <li><b>Bật <code>strict</code></b> ngay từ đầu. Nó gồm <code>strictNullChecks</code>, thứ bắt lỗi <code>undefined</code>/<code>null</code> hiệu quả nhất.</li>
            <li><b>Tránh <code>any</code>.</b> Chưa biết kiểu thì dùng <code>unknown</code> rồi narrow.</li>
            <li><b>Tránh ép kiểu <code>as</code></b> trừ khi bạn biết hơn trình biên dịch; ưu tiên type guard.</li>
            <li><b>Validate dữ liệu ngoài</b> (API, form) lúc chạy, rồi suy ra kiểu từ schema.</li>
          </ul>
          <Code lang="ts">{`// Type guard: a runtime check that narrows the type
function isUser(v: unknown): v is User {
  return typeof v === "object" && v !== null && "id" in v && "name" in v;
}

const data: unknown = await res.json();
if (isUser(data)) console.log(data.name);   // data: User`}</Code>
        </section>
      </main>
    </div>
  );
}
