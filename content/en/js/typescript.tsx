import { Code } from "@/components/Code";

export default function JsTypescriptPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="TypeScript contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ts-why"><span>01</span>Why TypeScript</a></li>
          <li><a href="#ts-basic"><span>02</span>Basic types</a></li>
          <li><a href="#ts-shape"><span>03</span>interface and type</a></li>
          <li><a href="#ts-generic"><span>04</span>Generics</a></li>
          <li><a href="#ts-narrow"><span>05</span>Narrowing, unions</a></li>
          <li><a href="#ts-utility"><span>06</span>Utility types</a></li>
          <li><a href="#ts-config"><span>07</span>tsconfig, best practice</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">typescript</div>
          <h1>TypeScript</h1>
          <p className="lede">TypeScript is JavaScript plus a static type system. Types exist only at compile time and are erased, so what runs is still JavaScript. In return you catch bugs early and get autocomplete and safe refactoring.</p>
          <div className="tape" aria-hidden="true">
            <div>interface</div>
            <div>union</div>
            <div className="hw">generics</div>
            <div>narrowing</div>
            <div>strict</div>
          </div>
        </header>

        <section id="ts-why">
          <h2><span className="n">01</span>Why TypeScript</h2>
          <Code lang="ts">{`function total(price: number, qty: number): number {
  return price * qty;
}

total(10, "2");   // compile error: string is not assignable to number
total(10);        // compile error: expected 2 arguments`}</Code>
          <ul className="plain">
            <li>Wrong types, misspelled properties and unhandled <code>undefined</code> are stopped at build time instead of at runtime.</li>
            <li>Types are living documentation: read a function signature and you know what to pass.</li>
            <li>Rename or reshape data and the compiler points to every place to fix.</li>
            <li>Types do <b>not</b> check data at runtime (JSON from an API, user input). That still needs validation, for example with zod.</li>
          </ul>
        </section>

        <section id="ts-basic">
          <h2><span className="n">02</span>Basic types</h2>
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
          <div className="note tip"><b>Let TS infer:</b> no need to annotate a variable that has an initial value. Annotate function parameters, return types of exported functions, and places TS cannot infer.</div>
        </section>

        <section id="ts-shape">
          <h2><span className="n">03</span>interface and type</h2>
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
                <tr><td>Describe an object</td><td>Yes</td><td>Yes</td></tr>
                <tr><td>Union, tuple, primitives</td><td>No</td><td>Yes</td></tr>
                <tr><td>Extending</td><td><code>extends</code>, merges when declared twice</td><td><code>&amp;</code></td></tr>
              </tbody>
            </table>
          </div>
          <p>A simple convention: <code>interface</code> for object and class shapes, <code>type</code> for everything else. What matters is being consistent within a project.</p>
        </section>

        <section id="ts-generic">
          <h2><span className="n">04</span>Generics</h2>
          <p>Generics let one function or type work with many data types while keeping the type information, instead of falling back to <code>any</code>.</p>
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
          <h2><span className="n">05</span>Narrowing and discriminated unions</h2>
          <p>With a union type, TS narrows the type based on checks in your code: <code>typeof</code>, <code>instanceof</code>, <code>in</code>, equality, or a shared field.</p>
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
                <tr><th>Type</th><th>Meaning</th></tr>
              </thead>
              <tbody>
                <tr><td><code>Partial&lt;T&gt;</code></td><td>Every field becomes optional</td></tr>
                <tr><td><code>Required&lt;T&gt;</code></td><td>Every field becomes required</td></tr>
                <tr><td><code>Readonly&lt;T&gt;</code></td><td>Every field becomes readonly</td></tr>
                <tr><td><code>Pick&lt;T, K&gt;</code>, <code>Omit&lt;T, K&gt;</code></td><td>Keep or drop some fields</td></tr>
                <tr><td><code>Record&lt;K, V&gt;</code></td><td>Object with keys of type K and values of type V</td></tr>
                <tr><td><code>ReturnType&lt;F&gt;</code></td><td>Return type of function F</td></tr>
                <tr><td><code>Awaited&lt;T&gt;</code></td><td>The value type after awaiting a Promise</td></tr>
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
          <h2><span className="n">07</span>tsconfig and best practice</h2>
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
            <li><b>Turn on <code>strict</code></b> from day one. It includes <code>strictNullChecks</code>, the most effective catch for <code>undefined</code>/<code>null</code> bugs.</li>
            <li><b>Avoid <code>any</code>.</b> If you do not know the type, use <code>unknown</code> and narrow.</li>
            <li><b>Avoid <code>as</code> casts</b> unless you truly know better than the compiler; prefer type guards.</li>
            <li><b>Validate external data</b> (APIs, forms) at runtime, then derive the type from the schema.</li>
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
