import { Code } from "@/components/Code";

export default function JsToolboxPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Everyday JavaScript toolbox contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#jt-destructure"><span>01</span>Destructuring and spread</a></li>
          <li><a href="#jt-array"><span>02</span>map, filter, reduce</a></li>
          <li><a href="#jt-rate"><span>03</span>Debounce and throttle</a></li>
          <li><a href="#jt-memory"><span>04</span>Memory management</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">javascript · toolbox</div>
          <h1>Everyday toolbox</h1>
          <p className="lede">Four things found in almost every project: unpacking data with destructuring, transforming arrays with map/filter/reduce, controlling how often a function runs, and avoiding memory leaks.</p>
          <div className="tape" aria-hidden="true">
            <div>destructuring</div>
            <div>spread</div>
            <div className="hw">reduce</div>
            <div>debounce</div>
            <div>WeakMap</div>
          </div>
        </header>

        <section id="jt-destructure">
          <h2><span className="n">01</span>Destructuring and spread</h2>
          <p>Destructuring pulls values out of an array or object into variables. Spread (<code>...</code>) expands elements to copy or merge. Both are <b>shallow</b>: nested objects are still shared by reference.</p>
          <Code lang="js">{`const [a, b = 0, ...rest] = [1, undefined, 3, 4]; // a=1, b=0 (default), rest=[3,4]

const { name, age, address: { city } = {}, ...others } = user;
const { id: userId } = user;                      // rename while extracting

// In function parameters, with defaults
function createUser({ name, role = "member" } = {}) {
  return { name, role };
}

// Swap without a temp variable
[x, y] = [y, x];

// Spread: copy and merge (later keys win)
const merged = { ...defaults, ...overrides };
const next = [...list, newItem];                  // does not mutate list`}</Code>
          <div className="note tip"><b>Immutable state updates:</b> <code>{"{ ...state, count: state.count + 1 }"}</code> builds a new object instead of editing the old one. React and Redux rely on this to detect changes.</div>
        </section>

        <section id="jt-array">
          <h2><span className="n">02</span>map, filter, reduce</h2>
          <p>Transform, select and combine arrays without mutating the original. Each takes a callback and returns a new result.</p>
          <Code lang="js">{`const nums = [1, 2, 3, 4];

nums.map((n) => n * 2);               // [2, 4, 6, 8]   one in, one out
nums.filter((n) => n % 2 === 0);      // [2, 4]         keep matches
nums.reduce((sum, n) => sum + n, 0);  // 10             fold into one value

// Group by with reduce
const byRole = users.reduce((acc, u) => {
  (acc[u.role] ??= []).push(u);
  return acc;
}, {});

nums.find((n) => n > 2);   // 3 (first match, or undefined)
nums.some((n) => n > 3);   // true
nums.every((n) => n > 0);  // true
nums.flatMap((n) => [n, n]);                     // map then flatten one level
users.map((u) => u.id).filter(Boolean);          // chain them`}</Code>
          <div className="pp">
            <div className="warnc"><span className="pl">Watch out</span>Always pass an initial value to <code>reduce</code>; without it an empty array throws <code>TypeError</code>. <code>sort</code>, <code>push</code>, <code>splice</code> <b>do</b> mutate the original array.</div>
            <div><span className="pl">Non-mutating versions</span><code>toSorted</code>, <code>toReversed</code>, <code>toSpliced</code>, <code>with</code> (ES2023) return a new array.</div>
          </div>
        </section>

        <section id="jt-rate">
          <h2><span className="n">03</span>Debounce and throttle</h2>
          <p>Events such as typing, scroll and resize fire very densely. These two techniques limit how often your function really runs.</p>
          <div className="pp">
            <div><span className="pl">Debounce</span>Waits until calls stop for a while, then runs <b>once</b>. Good for search boxes: call the API only after the user stops typing.</div>
            <div><span className="pl">Throttle</span>Runs at most <b>once per interval</b>, however often it is called. Good for scroll, resize and drag.</div>
          </div>
          <Code lang="js">{`function debounce(fn, delay) {
  let timer;                                   // kept alive by the closure
  return (...args) => {
    clearTimeout(timer);                       // every call resets the wait
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) {              // enough time passed since last run
      last = now;
      fn(...args);
    }
  };
}

input.addEventListener("input", debounce((e) => search(e.target.value), 300));
window.addEventListener("scroll", throttle(updateProgressBar, 100));`}</Code>
        </section>

        <section id="jt-memory">
          <h2><span className="n">04</span>Memory management</h2>
          <p>JS frees memory with a garbage collector: data that is no longer <b>reachable</b> from the roots (globals, the stack, ...) is reclaimed. A leak happens when a stray reference keeps data alive.</p>
          <ul className="plain">
            <li>Accidental globals from a missing declaration.</li>
            <li><code>setInterval</code> or event listeners that are never removed after the component or page is gone.</li>
            <li>Closures holding a reference to a large object that is no longer needed.</li>
            <li>Caches or <code>Map</code>s that grow without bound.</li>
          </ul>
          <Code lang="js">{`const onClick = () => {};
button.addEventListener("click", onClick);
// cleanup when the element or component goes away
button.removeEventListener("click", onClick);

const id = setInterval(tick, 1000);
clearInterval(id);

// WeakMap: keys do not keep objects alive
const meta = new WeakMap();
meta.set(someObject, { seenAt: Date.now() });   // entry disappears with someObject

// Remove many listeners at once with an AbortController
const ctrl = new AbortController();
window.addEventListener("resize", onResize, { signal: ctrl.signal });
window.addEventListener("scroll", onScroll, { signal: ctrl.signal });
ctrl.abort();                                    // removes every listener using this signal`}</Code>
          <div className="note tip"><b>Finding leaks:</b> Chrome DevTools, Memory tab, take two heap snapshots and compare. In Node.js use <code>node --inspect</code> or <code>process.memoryUsage()</code>.</div>
        </section>
      </main>
    </div>
  );
}
