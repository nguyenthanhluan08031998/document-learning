import { Code } from "@/components/Code";

export default function JsCorePage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Core JavaScript contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#jc-scope"><span>01</span>Scope</a></li>
          <li><a href="#jc-closure"><span>02</span>Closure</a></li>
          <li><a href="#jc-hoist"><span>03</span>Hoisting and TDZ</a></li>
          <li><a href="#jc-this"><span>04</span>The this keyword</a></li>
          <li><a href="#jc-proto"><span>05</span>Prototype</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">javascript · core</div>
          <h1>Core JavaScript</h1>
          <p className="lede">Five foundations: where variables live (scope), what a function remembers (closure), how declarations behave before code runs (hoisting), what this points to, and how objects inherit (prototype). With these five you can read most JS code.</p>
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
          <p>Scope decides where a variable can be accessed. There are three levels: <b>global</b> (the whole program), <b>function</b> (inside a function) and <b>block</b> (inside <code>{"{ }"}</code>, for <code>let</code>/<code>const</code> only). A name is looked up from the innermost scope outwards.</p>
          <Code lang="js">{`const a = "global";            // global scope

function demo() {
  const b = "function";        // visible only inside demo()
  if (true) {
    const c = "block";         // visible only inside this block
    var d = "var";             // var ignores block scope and leaks to the function
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
                <tr><td>Scope</td><td>function</td><td>block</td><td>block</td></tr>
                <tr><td>Reassign</td><td>yes</td><td>yes</td><td>no</td></tr>
                <tr><td>Redeclare in same scope</td><td>yes</td><td>no</td><td>no</td></tr>
                <tr><td>Use before declaration</td><td><code>undefined</code></td><td>ReferenceError (TDZ)</td><td>ReferenceError (TDZ)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="note tip"><b>Rule of thumb:</b> use <code>const</code> by default, <code>let</code> when you must reassign, never <code>var</code>. <code>const</code> only forbids reassigning the variable; an object it points to can still be mutated.</div>
        </section>

        <section id="jc-closure">
          <h2><span className="n">02</span>Closure</h2>
          <p>A closure is a function that <b>remembers the scope where it was created</b>, even after the outer function has finished. The variables stay alive as long as a function still references them.</p>
          <Code lang="js">{`function outer() {
  let count = 0;               // lives on after outer() returns
  return function () {
    count++;
    return count;
  };
}

const counter = outer();
counter(); // 1
counter(); // 2
const other = outer();         // a separate closure with its own count
other();   // 1`}</Code>
          <p>Used for private state, factory functions, keeping context for callbacks and memoization.</p>
          <Code lang="js">{`// Memoize: cache results of a pure function in a closure
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}`}</Code>
          <div className="pp">
            <div className="warnc"><span className="pl">Classic trap</span>A <code>for (var i ...)</code> loop with <code>setTimeout</code> prints the same value, because the whole loop shares one <code>i</code>.</div>
            <div><span className="pl">Fix</span>Use <code>let i</code>: each iteration gets its own binding, so each closure keeps that iteration&apos;s value.</div>
          </div>
          <Code lang="js">{`for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2`}</Code>
        </section>

        <section id="jc-hoist">
          <h2><span className="n">03</span>Hoisting and the Temporal Dead Zone</h2>
          <p>Before running, the engine scans a scope and registers every declaration. Declarations therefore seem to be &quot;pulled up&quot; to the top of the scope, but each kind behaves differently.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Kind</th><th>Used before its declaration line</th></tr>
              </thead>
              <tbody>
                <tr><td><code>var</code></td><td>Hoisted, value is <code>undefined</code></td></tr>
                <tr><td><code>let</code> / <code>const</code></td><td>In the Temporal Dead Zone: access throws <code>ReferenceError</code></td></tr>
                <tr><td><code>function foo() {"{}"}</code></td><td>The whole function is hoisted, callable before the declaration</td></tr>
                <tr><td><code>const foo = () =&gt; {"{}"}</code></td><td>A <code>const</code> variable, so the TDZ (Temporal Dead Zone) applies</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="js">{`console.log(x); // undefined (hoisted, not yet assigned)
var x = 5;

console.log(y); // ReferenceError (in the TDZ until this line runs)
let y = 5;

hello();        // works: function declarations are hoisted whole
function hello() { console.log("hi"); }`}</Code>
        </section>

        <section id="jc-this">
          <h2><span className="n">04</span>The this keyword</h2>
          <p>The value of <code>this</code> is set by <b>how a function is called</b>, not where it is defined. The one exception is the arrow function: it has no <code>this</code> of its own and uses the surrounding scope&apos;s.</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Call style</th><th><code>this</code> is</th></tr>
              </thead>
              <tbody>
                <tr><td><code>obj.method()</code></td><td><code>obj</code></td></tr>
                <tr><td><code>fn()</code></td><td><code>undefined</code> (strict mode, modules, classes) or the global object</td></tr>
                <tr><td><code>new Person()</code></td><td>The newly created object</td></tr>
                <tr><td><code>fn.call(x)</code>, <code>fn.apply(x)</code>, <code>fn.bind(x)</code></td><td><code>x</code>, set explicitly</td></tr>
                <tr><td>Arrow function</td><td><code>this</code> of the surrounding scope at definition time</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="js">{`const user = {
  name: "Lan",
  hi() { return "hi " + this.name; },
};
user.hi();              // "hi Lan"

const hi = user.hi;
hi();                   // this is lost: undefined.name throws in strict mode

const bound = user.hi.bind(user);
bound();                // "hi Lan"

class Timer {
  seconds = 0;
  start() {
    // Arrow keeps this pointing to the Timer instance
    setInterval(() => this.seconds++, 1000);
  }
}`}</Code>
          <div className="note"><b>Common bug:</b> passing a method as a callback (<code>button.onclick = obj.method</code>, <code>arr.map(obj.method)</code>) loses <code>this</code>. Use an arrow function or <code>.bind</code>.</div>
        </section>

        <section id="jc-proto">
          <h2><span className="n">05</span>Prototype</h2>
          <p>Every object has a hidden link to another object, its <b>prototype</b>. When a property is missing on the object, the engine walks the prototype chain until it finds it or reaches <code>null</code>. This is how JS does inheritance.</p>
          <Code lang="js">{`const animal = { eat() { return "eating"; } };
const dog = Object.create(animal);   // dog's prototype is animal
dog.bark = () => "woof";

dog.bark();   // own property
dog.eat();    // found on the prototype chain: dog → animal → Object.prototype → null
Object.getPrototypeOf(dog) === animal;  // true
Object.hasOwn(dog, "eat");              // false: eat is inherited`}</Code>
          <p><code>class</code> is just friendlier syntax over the prototype mechanism:</p>
          <Code lang="js">{`class Animal {
  eat() { return "eating"; }
}
class Dog extends Animal {
  bark() { return "woof"; }
}

const d = new Dog();
d.eat();                                          // inherited from Animal.prototype
Object.getPrototypeOf(d) === Dog.prototype;       // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true`}</Code>
          <div className="note tip"><b>Remember:</b> class methods live on the <code>prototype</code> and are shared by all instances, while fields (<code>seconds = 0</code>) live on each instance.</div>
        </section>
      </main>
    </div>
  );
}
