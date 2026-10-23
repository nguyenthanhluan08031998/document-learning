import { Code } from "@/components/Code";

export default function JsAsyncPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Asynchronous JavaScript contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#ja-loop"><span>01</span>Event loop</a></li>
          <li><a href="#ja-promise"><span>02</span>Promise</a></li>
          <li><a href="#ja-await"><span>03</span>async / await</a></li>
          <li><a href="#ja-pitfalls"><span>04</span>Common pitfalls</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">javascript · async</div>
          <h1>Async: Event loop, Promise, async/await</h1>
          <p className="lede">JavaScript runs on a single thread, yet it can call the network, read files and set timers without standing still. The event loop coordinates this, a Promise represents a future result, and async/await lets you write that code like synchronous code.</p>
          <div className="tape" aria-hidden="true">
            <div>call stack</div>
            <div className="hw">microtask</div>
            <div>task queue</div>
            <div>Promise</div>
            <div>await</div>
          </div>
        </header>

        <section id="ja-loop">
          <h2><span className="n">01</span>Event loop</h2>
          <p>The event loop does one thing forever: when the <b>call stack</b> is empty, it takes the next job from the queues.</p>
          <ul className="plain">
            <li><b>Call stack:</b> the synchronous code currently running.</li>
            <li><b>Microtask queue:</b> callbacks of <code>Promise.then</code>, <code>await</code>, <code>queueMicrotask</code>. High priority.</li>
            <li><b>Task (macrotask) queue:</b> <code>setTimeout</code>, <code>setInterval</code>, I/O (Input/Output), UI (User Interface) events.</li>
          </ul>
          <p>Order: finish the stack, run <b>all</b> microtasks, take <b>one</b> task, repeat.</p>
          <Code lang="js">{`console.log("1 sync");
setTimeout(() => console.log("4 task"), 0);
Promise.resolve().then(() => console.log("3 microtask"));
console.log("2 sync");
// Output: 1 sync, 2 sync, 3 microtask, 4 task`}</Code>
          <div className="note"><b>Consequence:</b> long synchronous code (a huge loop, <code>JSON.parse</code> of a giant file) blocks the event loop: the browser freezes and a Node.js server stops accepting requests. Split heavy work into chunks or move it to a worker.</div>
        </section>

        <section id="ja-promise">
          <h2><span className="n">02</span>Promise</h2>
          <p>A Promise is an object representing the result of work that is not finished yet. It has three states: <b>pending</b>, <b>fulfilled</b> (succeeded, has a value) or <b>rejected</b> (failed, has an error). Once settled it never changes.</p>
          <Code lang="js">{`const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

fetch("/api/user")
  .then((res) => res.json())          // each then returns a new promise
  .then((user) => console.log(user))
  .catch((err) => console.error(err)) // catches any rejection above
  .finally(() => console.log("done"));`}</Code>
          <p>Running several promises together:</p>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Function</th><th>Result</th><th>Use when</th></tr>
              </thead>
              <tbody>
                <tr><td><code>Promise.all</code></td><td>Array of results; rejects as soon as one fails</td><td>Independent jobs that must all succeed</td></tr>
                <tr><td><code>Promise.allSettled</code></td><td>Array of <code>{"{ status, value | reason }"}</code>, never rejects</td><td>You want each outcome even if some fail</td></tr>
                <tr><td><code>Promise.race</code></td><td>The first to settle (success or failure)</td><td>Timeouts</td></tr>
                <tr><td><code>Promise.any</code></td><td>The first to succeed</td><td>Calling several fallback sources</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="js">{`// Timeout via race
const withTimeout = (p, ms) =>
  Promise.race([p, wait(ms).then(() => { throw new Error("timeout"); })]);`}</Code>
        </section>

        <section id="ja-await">
          <h2><span className="n">03</span>async / await</h2>
          <p><code>async</code> makes a function always return a Promise. <code>await</code> pauses that function (without blocking the main thread) until the Promise settles, then returns the value or throws the error. Catch errors with <code>try/catch</code> like normal code.</p>
          <Code lang="js">{`async function getUser(id) {
  try {
    const res = await fetch("/api/users/" + id);
    if (!res.ok) throw new Error("HTTP " + res.status); // fetch does not reject on 404/500
    return await res.json();
  } catch (err) {
    console.error("getUser failed", err);
    throw err;                                          // let the caller decide
  }
}

// Independent calls: run in parallel, not one after another
const [user, orders] = await Promise.all([getUser(1), getOrders(1)]);`}</Code>
          <p>Under the hood, each <code>await</code> is a point where the rest of the function is queued as a microtask to resume once the Promise is done.</p>
        </section>

        <section id="ja-pitfalls">
          <h2><span className="n">04</span>Common pitfalls</h2>
          <div className="pp">
            <div className="warnc"><span className="pl">Needlessly slow</span>Sequential <code>await</code> in a loop for independent jobs. Total time is the sum of every job.</div>
            <div><span className="pl">Fix</span>Build an array of promises and <code>Promise.all</code> it. If you need a concurrency limit, process in batches.</div>
          </div>
          <Code lang="js">{`// Slow: requests one by one
for (const id of ids) results.push(await getUser(id));

// Fast: all at once
const results2 = await Promise.all(ids.map(getUser));

// forEach does NOT wait for async callbacks
ids.forEach(async (id) => { await save(id); }); // returns before saves finish
for (const id of ids) await save(id);           // waits, in order`}</Code>
          <ul className="plain">
            <li><b>Forgetting <code>await</code>:</b> you get a Promise instead of a value, and errors become <i>unhandled rejections</i>.</li>
            <li><b>Swallowing errors in <code>catch</code>:</b> without a rethrow the caller thinks it succeeded.</li>
            <li><b><code>await</code> outside an async function:</b> only allowed at the top level of an ES module.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
