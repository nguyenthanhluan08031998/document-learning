import Link from "next/link";
import { CodeCompare } from "@/components/CodeCompare";

export default function GoVsNodePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go vs Node.js contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gn-vars"><span>01</span>Declaring variables: var, let, const</a></li>
          <li><a href="#gn-scope"><span>02</span>Hoisting and block scope</a></li>
          <li><a href="#gn-types"><span>03</span>Types and conversion</a></li>
          <li><a href="#gn-errors"><span>04</span>Error handling</a></li>
          <li><a href="#gn-zero"><span>05</span>Zero value, nil, unused variables</a></li>
          <li><a href="#gn-conc"><span>06</span>Concurrency</a></li>
          <li><a href="#gn-sum"><span>07</span>Summary of differences</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · comparison</div>
          <h1>Go vs Node.js</h1>
          <p className="lede">For readers who know Node.js: Go has var and const but no let; no hoisting of locals; static types; errors are return values. Each section puts Go on the left and Node.js on the right.</p>
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
          <h2><span className="n">01</span>Declaring variables: var, let, const</h2>
          <p>Go has no <code>let</code>. It has <code>var</code> (explicit), <code>:=</code> (short form, inside functions only) and <code>const</code>. Go's <code>const</code> is a compile-time constant limited to numbers, strings and bools; JS <code>const</code> only blocks reassignment, the value inside can still change.</p>
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
          <h2><span className="n">02</span>Hoisting and block scope</h2>
          <p>Go uses block scope for every variable (each <code>{"{ }"}</code> is a scope) and <b>does not hoist</b> locals, so there is no <code>undefined</code> from early use. Only package-level declarations are order-independent.</p>
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
          <h2><span className="n">03</span>Types and conversion</h2>
          <p>Go is statically typed and never converts implicitly: adding an <code>int</code> to a <code>string</code> is a compile error and conversions are written out. There is no loose <code>==</code> versus strict <code>===</code>; Go's <code>==</code> is always strict.</p>
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
          <h2><span className="n">04</span>Error handling</h2>
          <p>Go has no exceptions for ordinary errors. A function returns an <code>error</code> value and the caller checks <code>err != nil</code>. <code>panic</code> is for programming bugs.</p>
          <CodeCompare go={`v, err := strconv.Atoi("abc")
if err != nil {
    return fmt.Errorf("parse: %w", err) // wrap it; the caller decides what to do
}
// panic/recover exists, but it is for bugs, not for control flow`} js={`try {
  JSON (JavaScript Object Notation).parse("abc");                // throws SyntaxError
  const v = parseInt("abc");        // NaN, does not throw
} catch (err) {
  throw new Error("parse failed", { cause: err }); // wrap with cause
}`} />
        </section>

        <section id="gn-zero">
          <h2><span className="n">05</span>Zero value, nil, unused variables</h2>
          <p>Every Go variable has a zero value (<code>0</code>, <code>""</code>, <code>nil</code>); there is no <code>undefined</code>. A declared but unused variable or import is a compile error.</p>
          <CodeCompare go={`var s string         // "" (zero value)
var p *User          // nil
var m map[string]int // nil map: reads are fine, writes panic
x := 1               // compile error: declared and not used`} js={`let s;               // undefined
let p = null;        // null is a separate value from undefined
const m = {};        // a plain object, ready to write
const x = 1;         // unused is fine (linters warn)`} />
        </section>

        <section id="gn-conc">
          <h2><span className="n">06</span>Concurrency</h2>
          <p>Node.js runs JS on one thread with an event loop and <code>async/await</code>. Go runs goroutines truly in parallel across cores, with no <code>await</code>; see also <Link className="plink" href="/golang/runtime/">Runtime &amp; GMP (Goroutine-Machine-Processor)</Link>.</p>
          <CodeCompare go={`var wg sync.WaitGroup
for _, u := range urls {
    wg.Go(func() { fetch(u) }) // goroutines run in parallel on many cores
}
wg.Wait()`} js={`await Promise.all(urls.map((u) => fetch(u))); // concurrent I/O (Input/Output) on one thread
// CPU (Central Processing Unit)-bound work blocks the event loop: move it to worker_threads`} />
        </section>

        <section id="gn-sum">
          <h2><span className="n">07</span>Summary of differences</h2>
          <div className="tbl">
            <table>
              <thead><tr><th></th><th>Go</th><th>Node.js</th></tr></thead>
              <tbody>
                <tr><td><b>Declaration</b></td><td>var, :=, const</td><td>var, let, const</td></tr>
                <tr><td><b>Scope</b></td><td>Block scope, no hoisting of locals</td><td>var hoisted; let/const block scope + TDZ (Temporal Dead Zone)</td></tr>
                <tr><td><b>Types</b></td><td>Static, no implicit conversion</td><td>Dynamic, implicit coercion</td></tr>
                <tr><td><b>Errors</b></td><td>Returned error values</td><td>throw / try-catch</td></tr>
                <tr><td><b>Empty values</b></td><td>Zero value, nil</td><td>undefined, null</td></tr>
                <tr><td><b>Concurrency</b></td><td>Parallel goroutines</td><td>Single-thread event loop</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
