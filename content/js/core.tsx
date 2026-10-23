import { Code } from "@/components/Code";

export default function JsCorePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Mục lục JavaScript cốt lõi">
        <div className="label">Mục lục</div>
        <ol>
          <li><a href="#jc-scope"><span>01</span>Scope</a></li>
          <li><a href="#jc-closure"><span>02</span>Closure</a></li>
          <li><a href="#jc-hoist"><span>03</span>Hoisting và TDZ</a></li>
          <li><a href="#jc-this"><span>04</span>Từ khóa this</a></li>
          <li><a href="#jc-proto"><span>05</span>Prototype</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">javascript · core</div>
          <h1>JavaScript cốt lõi</h1>
          <p className="lede">Năm khái niệm nền: biến sống ở đâu (scope), hàm nhớ gì (closure), khai báo hoạt động thế nào trước khi chạy (hoisting), this trỏ vào đâu, và object kế thừa ra sao (prototype). Hiểu chắc năm thứ này là đọc được hầu hết code JS.</p>
          <div className="tape" aria-hidden="true">
            <div>scope</div>
            <div>closure</div>
            <div>hoisting</div>
            <div className="hw">this</div>
            <div>prototype</div>
          </div>
        </header>

        <section id="jc-scope">
          <h2><span className="n">01</span>Scope</h2>
          <p>Scope quyết định biến nào được truy cập ở đâu. Có ba tầng: <b>global</b> (cả chương trình), <b>function</b> (trong một hàm) và <b>block</b> (trong cặp <code>{"{ }"}</code>, chỉ với <code>let</code>/<code>const</code>). Biến luôn được tìm từ scope trong cùng ra ngoài.</p>
          <Code lang="js">{`const a = "global";            // scope global

function demo() {
  const b = "function";        // chỉ thấy bên trong demo()
  if (true) {
    const c = "block";         // chỉ thấy bên trong block này
    var d = "var";             // var bỏ qua block scope và rò ra cả hàm
  }
  console.log(a, b, d);        // ok
  // console.log(c);           // ReferenceError: c is not defined
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr><th></th><th>var</th><th>let</th><th>const</th></tr>
              </thead>
              <tbody>
                <tr><td>Phạm vi</td><td>function</td><td>block</td><td>block</td></tr>
                <tr><td>Gán lại</td><td>được</td><td>được</td><td>không</td></tr>
                <tr><td>Khai báo lại cùng tên</td><td>được</td><td>không</td><td>không</td></tr>
                <tr><td>Dùng trước khai báo</td><td><code>undefined</code></td><td>ReferenceError (TDZ)</td><td>ReferenceError (TDZ)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Quy ước:</b> dùng <code>const</code> mặc định, <code>let</code> khi cần gán lại, không dùng <code>var</code>. <code>const</code> chỉ cấm gán lại biến; object bên trong vẫn sửa được.</div>
        </section>

        <section id="jc-closure">
          <h2><span className="n">02</span>Closure</h2>
          <p>Closure là hàm <b>nhớ scope nơi nó được tạo</b>, kể cả khi hàm bên ngoài đã chạy xong. Biến được giữ lại chừng nào còn hàm tham chiếu tới nó.</p>
          <Code lang="js">{`function outer() {
  let count = 0;               // vẫn sống sau khi outer() kết thúc
  return function () {
    count++;
    return count;
  };
}

const counter = outer();
counter(); // 1
counter(); // 2
const other = outer();         // closure riêng, có count riêng
other();   // 1`}</Code>
          <p>Dùng để tạo state riêng tư, factory function, giữ ngữ cảnh cho callback và memoization.</p>
          <Code lang="js">{`// Memoize: lưu kết quả của hàm thuần trong closure
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}`}</Code>
          <div className="pp">
            <div className="warnc"><span className="pl">Bẫy kinh điển</span>Vòng <code>for (var i ...)</code> kèm <code>setTimeout</code> in cùng một giá trị, vì cả vòng chỉ có một biến <code>i</code>.</div>
            <div><span className="pl">Cách sửa</span>Dùng <code>let i</code>: mỗi vòng lặp có một binding riêng nên mỗi closure giữ giá trị của vòng đó.</div>
          </div>
          <Code lang="js">{`for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2`}</Code>
        </section>

        <section id="jc-hoist">
          <h2><span className="n">03</span>Hoisting và Temporal Dead Zone</h2>
          <p>Trước khi chạy, engine quét scope và ghi nhận mọi khai báo. Nhờ đó khai báo như được &quot;kéo lên&quot; đầu scope, nhưng mỗi loại xử lý khác nhau.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Loại</th><th>Dùng trước dòng khai báo</th></tr>
              </thead>
              <tbody>
                <tr><td><code>var</code></td><td>Được hoist, giá trị là <code>undefined</code></td></tr>
                <tr><td><code>let</code> / <code>const</code></td><td>Nằm trong Temporal Dead Zone: truy cập sẽ ném <code>ReferenceError</code></td></tr>
                <tr><td><code>function foo() {"{}"}</code></td><td>Hoist cả thân hàm, gọi được trước khi khai báo</td></tr>
                <tr><td><code>const foo = () =&gt; {"{}"}</code></td><td>Là biến <code>const</code>, tức TDZ (Temporal Dead Zone) như trên</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="js">{`console.log(x); // undefined (đã hoist, chưa được gán)
var x = 5;

console.log(y); // ReferenceError (đang trong TDZ tới khi dòng này chạy)
let y = 5;

hello();        // chạy được: function declaration được hoist nguyên cả hàm
function hello() { console.log("hi"); }`}</Code>
        </section>

        <section id="jc-this">
          <h2><span className="n">04</span>Từ khóa this</h2>
          <p>Giá trị của <code>this</code> được quyết định bởi <b>cách hàm được gọi</b>, không phải nơi định nghĩa. Ngoại lệ duy nhất là arrow function: nó không có <code>this</code> riêng mà dùng <code>this</code> của scope bao quanh.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Cách gọi</th><th><code>this</code> là</th></tr>
              </thead>
              <tbody>
                <tr><td><code>obj.method()</code></td><td><code>obj</code></td></tr>
                <tr><td><code>fn()</code></td><td><code>undefined</code> (strict mode, module, class) hoặc global</td></tr>
                <tr><td><code>new Person()</code></td><td>Object mới được tạo</td></tr>
                <tr><td><code>fn.call(x)</code>, <code>fn.apply(x)</code>, <code>fn.bind(x)</code></td><td><code>x</code>, chỉ định tường minh</td></tr>
                <tr><td>Arrow function</td><td><code>this</code> của scope bao quanh lúc định nghĩa</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="js">{`const user = {
  name: "Lan",
  hi() { return "hi " + this.name; },
};
user.hi();              // "hi Lan"

const hi = user.hi;
hi();                   // mất this: undefined.name gây lỗi trong strict mode

const bound = user.hi.bind(user);
bound();                // "hi Lan"

class Timer {
  seconds = 0;
  start() {
    // Arrow function giữ this trỏ tới instance Timer
    setInterval(() => this.seconds++, 1000);
  }
}`}</Code>
          <div className="note"><b>Lỗi hay gặp:</b> truyền method làm callback (<code>button.onclick = obj.method</code>, <code>arr.map(obj.method)</code>) làm mất <code>this</code>. Dùng arrow function hoặc <code>.bind</code>.</div>
        </section>

        <section id="jc-proto">
          <h2><span className="n">05</span>Prototype</h2>
          <p>Mỗi object có một liên kết ẩn tới object khác gọi là <b>prototype</b>. Khi truy cập thuộc tính không có trên object, engine đi dọc chuỗi prototype cho tới khi gặp hoặc tới <code>null</code>. Đây là cách JS kế thừa.</p>
          <Code lang="js">{`const animal = { eat() { return "eating"; } };
const dog = Object.create(animal);   // prototype của dog là animal
dog.bark = () => "woof";

dog.bark();   // thuộc tính của chính nó
dog.eat();    // tìm thấy trên chuỗi prototype: dog → animal → Object.prototype → null
Object.getPrototypeOf(dog) === animal;  // true
Object.hasOwn(dog, "eat");              // false: eat là thuộc tính kế thừa`}</Code>
          <p><code>class</code> chỉ là cú pháp gọn trên cơ chế prototype:</p>
          <Code lang="js">{`class Animal {
  eat() { return "eating"; }
}
class Dog extends Animal {
  bark() { return "woof"; }
}

const d = new Dog();
d.eat();                                          // kế thừa từ Animal.prototype
Object.getPrototypeOf(d) === Dog.prototype;       // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true`}</Code>
          <div className="note tip"><b>Ghi nhớ:</b> method của class nằm trên <code>prototype</code> và dùng chung cho mọi instance, còn field (<code>seconds = 0</code>) nằm trên từng instance.</div>
        </section>
      </main>
    </div>
  );
}
