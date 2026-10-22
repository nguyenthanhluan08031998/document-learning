import Link from "next/link";
import { CodeCompare } from "@/components/CodeCompare";

export default function GoVsNodePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục Go vs Node.js">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#gn-vars"><span>01</span>Khai báo biến: var, let, const</a></li>
          <li><a href="#gn-scope"><span>02</span>Hoisting và block scope</a></li>
          <li><a href="#gn-types"><span>03</span>Kiểu và ép kiểu</a></li>
          <li><a href="#gn-errors"><span>04</span>Xử lý lỗi</a></li>
          <li><a href="#gn-zero"><span>05</span>Zero value, nil, biến không dùng</a></li>
          <li><a href="#gn-conc"><span>06</span>Đồng thời</a></li>
          <li><a href="#gn-sum"><span>07</span>Tóm tắt khác biệt</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · so sánh</div>
          <h1>Go so với Node.js</h1>
          <p className="lede">Cho người đã quen Node.js: Go có var, const nhưng không có let; không hoisting biến cục bộ; kiểu tĩnh; lỗi là giá trị trả về. Mỗi mục đặt code Go bên trái, Node.js bên phải.</p>
          <div className="tape" aria-hidden="true">
            <div>var · := · const</div>
            <div>block scope</div>
            <div>static typing</div>
            <div>error values</div>
            <div>zero value</div>
            <div>goroutine</div>
          </div>
        </header>

        <section id="gn-vars">
          <h2><span className="n">01</span>Khai báo biến: var, let, const</h2>
          <p>Go không có <code>let</code>. Có <code>var</code> (khai báo tường minh), <code>:=</code> (khai báo ngắn, chỉ trong hàm) và <code>const</code>. <code>const</code> của Go là hằng lúc biên dịch, chỉ nhận số, chuỗi, bool; còn <code>const</code> của JS chỉ khoá phép gán lại, giá trị bên trong vẫn sửa được.</p>
          <CodeCompare go={`var a int = 1      // explicit type
var b = 2          // type inferred
c := 3             // short form, only inside functions
const Pi = 3.14    // compile-time constant; there is no let

var d int          // zero value: 0, never undefined
a, c = c, a        // swap without a temp variable`} js={`var a = 1;         // function scoped, hoisted
let b = 2;         // block scoped, reassignable
const c = 3;       // the binding cannot be reassigned
const arr = [1];
arr.push(2);       // allowed: const freezes the binding, not the value

let d;             // undefined
[a, c] = [c, a];   // swap with destructuring`} />
        </section>

        <section id="gn-scope">
          <h2><span className="n">02</span>Hoisting và block scope</h2>
          <p>Go dùng block scope cho mọi biến (mỗi cặp <code>{"{ }"}</code> là một scope) và <b>không hoisting</b> biến cục bộ, nên không có chuyện <code>undefined</code> do dùng sớm. Chỉ khai báo ở cấp package là không phụ thuộc thứ tự.</p>
          <CodeCompare go={`// No hoisting for locals: using a name before its declaration is a compile error
fmt.Println(x) // error: undefined: x
x := 1

// Block scope: every { } opens a scope, := declares a new variable in it
y := 1
if true {
    y := 2           // shadows the outer y (a new variable)
    fmt.Println(y)   // 2
}
fmt.Println(y)       // 1

// Package level is order-independent: functions and vars can be used before they appear
func main() { fmt.Println(helper()) }
func helper() int { return limit }
var limit = 10`} js={`// var is hoisted to the function and starts as undefined
console.log(a); // undefined
var a = 1;

// let/const are block scoped but hoisted into the temporal dead zone
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 1;

let y = 1;
if (true) {
  let y = 2;          // shadows the outer y, like := in Go
  console.log(y);     // 2
}
console.log(y);       // 1

// Function declarations are fully hoisted, like Go package-level functions
main();
function main() { console.log(helper()); }
function helper() { return 10; }`} />
        </section>

        <section id="gn-types">
          <h2><span className="n">03</span>Kiểu và ép kiểu</h2>
          <p>Go kiểu tĩnh và không tự ép kiểu: cộng <code>int</code> với <code>string</code> là lỗi biên dịch, đổi kiểu phải viết tường minh. Không có <code>==</code> lỏng và <code>===</code> chặt; <code>==</code> của Go luôn chặt.</p>
          <CodeCompare go={`n := 1
s := "1"
// fmt.Println(n + s)          // compile error: mismatched types int and string
v, _ := strconv.Atoi(s)        // explicit conversion
fmt.Println(n + v)             // 2
var f float64 = float64(n) / 2 // no implicit int to float conversion`} js={`const n = 1;
const s = "1";
console.log(n + s);                // "11": implicit coercion to string
console.log(n + Number(s));        // 2
console.log(1 == "1", 1 === "1");  // true false
console.log(n / 2);                // 0.5: one Number type for ints and floats`} />
        </section>

        <section id="gn-errors">
          <h2><span className="n">04</span>Xử lý lỗi</h2>
          <p>Go không có exception cho lỗi thường. Hàm trả <code>error</code> như một giá trị, người gọi kiểm tra <code>err != nil</code>. <code>panic</code> dành cho lỗi lập trình.</p>
          <CodeCompare go={`v, err := strconv.Atoi("abc")
if err != nil {
    return fmt.Errorf("parse: %w", err) // wrap it; the caller decides what to do
}
// panic/recover exists, but it is for bugs, not for control flow`} js={`try {
  JSON.parse("abc");                // throws SyntaxError
  const v = parseInt("abc");        // NaN, does not throw
} catch (err) {
  throw new Error("parse failed", { cause: err }); // wrap with cause
}`} />
        </section>

        <section id="gn-zero">
          <h2><span className="n">05</span>Zero value, nil, biến không dùng</h2>
          <p>Mọi biến Go có zero value (<code>0</code>, <code>""</code>, <code>nil</code>), không có <code>undefined</code>. Biến hay import khai báo mà không dùng là lỗi biên dịch.</p>
          <CodeCompare go={`var s string         // "" (zero value)
var p *User          // nil
var m map[string]int // nil map: reads are fine, writes panic
x := 1               // compile error: declared and not used`} js={`let s;               // undefined
let p = null;        // null is a separate value from undefined
const m = {};        // a plain object, ready to write
const x = 1;         // unused is fine (linters warn)`} />
        </section>

        <section id="gn-conc">
          <h2><span className="n">06</span>Đồng thời</h2>
          <p>Node.js chạy JS trên một thread với event loop và <code>async/await</code>. Go chạy goroutine song song thật trên nhiều core, không cần <code>await</code>; xem thêm <Link className="plink" href="/golang/runtime/">Runtime &amp; GMP</Link>.</p>
          <CodeCompare go={`var wg sync.WaitGroup
for _, u := range urls {
    wg.Go(func() { fetch(u) }) // goroutines run in parallel on many cores
}
wg.Wait()`} js={`await Promise.all(urls.map((u) => fetch(u))); // concurrent I/O on one thread
// CPU-bound work blocks the event loop: move it to worker_threads`} />
        </section>

        <section id="gn-sum">
          <h2><span className="n">07</span>Tóm tắt khác biệt</h2>
          <div className="tbl">
            <table>
              <thead><tr><th></th><th>Go</th><th>Node.js</th></tr></thead>
              <tbody>
                <tr><td><b>Khai báo</b></td><td>var, :=, const</td><td>var, let, const</td></tr>
                <tr><td><b>Scope</b></td><td>Block scope, không hoisting cục bộ</td><td>var hoisted; let/const block scope + TDZ</td></tr>
                <tr><td><b>Kiểu</b></td><td>Tĩnh, không tự ép kiểu</td><td>Động, ép kiểu ngầm</td></tr>
                <tr><td><b>Lỗi</b></td><td>Giá trị error trả về</td><td>throw / try-catch</td></tr>
                <tr><td><b>Giá trị rỗng</b></td><td>Zero value, nil</td><td>undefined, null</td></tr>
                <tr><td><b>Đồng thời</b></td><td>Goroutine song song</td><td>Event loop một thread</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
