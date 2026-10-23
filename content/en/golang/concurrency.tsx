import Link from "next/link";
import { CodeCompare } from "@/components/CodeCompare";
import { Box, Label, Markers } from "@/components/Svg";

const FIELDS: [string, string][] = [
  ["qcount", "elements currently held"],
  ["dataqsiz", "capacity (cap)"],
  ["buf", "pointer to the ring buffer"],
  ["sendx · recvx", "next write · read slot"],
  ["recvq · sendq", "queues of waiting Gs"],
  ["closed", "closed or not"],
  ["lock", "mutex guarding the struct"],
];
const SLOTS = ["A", "B", "C", "", "", ""];

export default function GoConcurrencyPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Channel and context contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gc-hchan"><span>01</span>Inside a channel</a></li>
          <li><a href="#gc-buffer"><span>02</span>Buffered, unbuffered</a></li>
          <li><a href="#gc-rules"><span>03</span>Behaviour table</a></li>
          <li><a href="#gc-mutex"><span>04</span>Channel or Mutex</a></li>
          <li><a href="#gc-leak"><span>05</span>Goroutine leaks</a></li>
          <li><a href="#gc-context"><span>06</span>Context</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · concurrency</div>
          <h1>Channels, Mutexes and Context</h1>
          <p className="lede">“Don&apos;t communicate by sharing memory; share memory by communicating.” Channels are the idiomatic tool, but a Mutex is still the right choice in many places. Context is how you stop a whole tree of goroutines.</p>
          <div className="tape" aria-hidden="true">
            <div>hchan</div>
            <div>sudog</div>
            <div>select</div>
            <div className="hw">sync.Mutex</div>
            <div>errgroup</div>
            <div>context.WithCancel</div>
          </div>
        </header>

        <section id="gc-hchan">
          <h2><span className="n">01</span>Inside a channel: hchan</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 300" role="img" aria-label="The hchan struct holds qcount, dataqsiz, buf, sendx, recvx, recvq, sendq, closed and lock; buf points to a 6-slot ring buffer holding A, B, C; recvx points at A, sendx at the next empty slot; sendq holds goroutines waiting to send when the buffer is full">
                <Markers id="hc" />
                <rect className="s-hl" x="16" y="16" width="300" height="270" rx="8" />
                <text className="s-tb" x="32" y="42">hchan</text>
                {FIELDS.map(([f, d], i) => (
                  <g key={f}>
                    <text className="s-tm" x="32" y={72 + i * 30} style={{ fill: "var(--ink)", fontWeight: 600 }}>{f}</text>
                    <text className="s-tm" x="150" y={72 + i * 30}>{d}</text>
                  </g>
                ))}

                <text className="s-lane" x="400" y="40">BUF · RING BUFFER (cap 6)</text>
                {SLOTS.map((v, i) => (
                  <g key={i}>
                    <rect className={v ? "s-disk" : "s-box"} x={400 + i * 70} y="56" width="62" height="44" rx="5" />
                    <text className="s-tb" x={431 + i * 70} y="83" textAnchor="middle">{v}</text>
                  </g>
                ))}
                <path className="s-ln" d="M316 130 C350 130 360 78 398 78" markerEnd="url(#hca)" />
                <path className="s-ln" d="M431 132 V104" markerEnd="url(#hca)" />
                <Label x={431} y={146} anchor="middle">recvx</Label>
                <path className="s-ln" d="M641 132 V104" markerEnd="url(#hca)" />
                <Label x={641} y={146} anchor="middle">sendx</Label>

                <text className="s-lane2" x="400" y="190">RECVQ · SENDQ (lists of sudog)</text>
                <Box x={400} y={204} w={110} h={44} title="sudog" sub="G7, &elem" />
                <Box x={530} y={204} w={110} h={44} title="sudog" sub="G9, &elem" />
                <path className="s-dl" d="M510 226 H528" />
                <Label x={660} y={222}>waiting Gs are parked, no CPU (Central Processing Unit);</Label>
                <Label x={660} y={238}>woken when the other side comes</Label>
              </svg>
            </div>
            <figcaption>Every send, receive and close takes <code>lock</code> first. A channel is a locked queue, not lock-free magic.</figcaption>
          </figure>
        </section>

        <section id="gc-buffer">
          <h2><span className="n">02</span>Buffered vs unbuffered at runtime level</h2>
          <div className="cmp">
            <div><h4>Unbuffered <code>make(chan T)</code></h4>No buf. A send completes only when a receiver is there: if one is already waiting in recvq, the runtime <b>copies the value straight from the sender&apos;s stack to the receiver&apos;s stack</b> and wakes it. It is a synchronisation point (handoff): both sides have definitely met.</div>
            <div><h4>Buffered <code>make(chan T, n)</code></h4>A send copies into <code>buf[sendx]</code> and returns at once if there is room; it blocks only when full. A receive takes from <code>buf[recvx]</code>. If a receiver is already waiting, the value is still copied directly. The buffer absorbs speed differences; it does not “fix” deadlocks.</div>
          </div>
        </section>

        <section id="gc-rules">
          <h2><span className="n">03</span>The behaviour table to memorise</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Operation</th><th>nil channel</th><th>Closed</th><th>Open</th></tr></thead>
              <tbody>
                <tr><td><b>send</b></td><td>Blocks forever</td><td className="c-bad">panic</td><td>Sends or blocks</td></tr>
                <tr><td><b>receive</b></td><td>Blocks forever</td><td>Zero value, ok = false (once the buffer is drained)</td><td>Receives or blocks</td></tr>
                <tr><td><b>close</b></td><td className="c-bad">panic</td><td className="c-bad">panic</td><td>Wakes every waiting receiver and sender (senders then panic)</td></tr>
              </tbody>
            </table>
          </div>
          <p>Rule: <b>only the sender closes</b>, and only when nobody will send again. A nil channel is handy in <code>select</code> to switch a case off.</p>
        </section>

        <section id="gc-mutex">
          <h2><span className="n">04</span>When to use a Channel, when a Mutex</h2>
          <div className="cmp">
            <div><h4>Channel</h4>Hand ownership of data between goroutines (pipelines, worker pools), signal done/cancel, limit how much runs at once (semaphore), combine several event sources with <code>select</code>.</div>
            <div><h4>sync.Mutex · RWMutex · atomic</h4>Protect shared state (cache, counter, map). Shorter, faster and easier to read than a channel. RWMutex when reads vastly outnumber writes; for a simple counter use <code>atomic.Int64</code>.</div>
          </div>
          <CodeCompare go={`type Counter struct {
    mu sync.Mutex
    m  map[string]int
}

func (c *Counter) Inc(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.m[key]++
}
// Never copy a struct holding a Mutex (pass *Counter). go vet reports copylocks.`} js={`// Node runs JS on a single thread, so a plain Map needs no lock.
// A mutex only matters for state shared across worker_threads (use Atomics).
class Counter {
  m = new Map();
  inc(key) {
    this.m.set(key, (this.m.get(key) ?? 0) + 1);
  }
}

// Closest thing to atomic.Int64: Atomics on a SharedArrayBuffer
const counter = new Int32Array(new SharedArrayBuffer(4));
Atomics.add(counter, 0, 1);`} />
        </section>

        <section id="gc-leak">
          <h2><span className="n">05</span>Goroutine leaks</h2>
          <p>A goroutine blocked forever on a channel or lock is never reclaimed by the GC (Garbage Collector): its stack and everything it references stay in memory. A goroutine count that keeps climbing is the clearest sign.</p>
          <CodeCompare go={`// Leak: after the timeout nobody reads ch, so the goroutine is stuck at ch <- r forever
func fetch(ctx context.Context) (Result, error) {
    ch := make(chan Result)            // fix: make(chan Result, 1)
    go func() { ch <- slowCall() }()
    select {
    case r := <-ch:
        return r, nil
    case <-ctx.Done():
        return Result{}, ctx.Err()
    }
}`} js={`// Leak: a promise that never settles keeps its closure (and timer) alive.
// Fix: always clear the timer and abort the underlying call.
async function fetchWithTimeout(ms) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), ms);
  try {
    return await slowCall({ signal: ac.signal });
  } finally {
    clearTimeout(timer); // forgetting this keeps the timer alive
  }
}`} />
          <ul className="plain">
            <li>Usual causes: sending on a channel nobody reads; reading a channel nobody closes; forgetting a context&apos;s <code>cancel()</code>; a <code>for range ch</code> worker whose producer never closes; forgetting <code>ticker.Stop()</code> (before 1.23).</li>
            <li>How to find them: watch <code>runtime.NumGoroutine()</code>, read <code>/debug/pprof/goroutine?debug=2</code>, test with <code>go.uber.org/goleak</code>. Since <b>1.27</b> the <code>goroutineleak</code> profile is GA: the runtime uses the GC to find goroutines blocked on something nothing can reach any more.</li>
          </ul>
        </section>

        <section id="gc-context">
          <h2><span className="n">06</span>Context: cancellation propagation</h2>
          <p>Contexts form a tree. Each <code>WithCancel</code>/<code>WithTimeout</code> creates a child and registers it in the parent&apos;s <code>children</code> set. When a parent is cancelled it closes its own <code>Done()</code> channel and cancels every child, all the way down to the leaves. Cancelling a child does not affect the parent.</p>
          <CodeCompare go={`func (h *Handler) GetOrder(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second) // client disconnects → r.Context() cancelled
    defer cancel()                       // always call it, even after a timeout: detaches from the parent, stops the timer

    order, err := h.repo.Find(ctx, r.PathValue("id")) // the DB (Database) driver honours ctx
    ...
}

// Background worker: takes ctx, exits on ctx.Done()
func worker(ctx context.Context, jobs <-chan Job) {
    for {
        select {
        case <-ctx.Done():
            return
        case j, ok := <-jobs:
            if !ok { return }
            process(ctx, j)
        }
    }
}`} js={`// AbortSignal plays the role of context.Context
app.get("/orders/:id", async (req, res) => {
  const ac = new AbortController();
  req.on("close", () => ac.abort()); // client disconnected
  const signal = AbortSignal.any([ac.signal, AbortSignal.timeout(2000)]);

  const order = await repo.find(req.params.id, { signal }); // driver must honor the signal
  ...
});

// Background worker: takes a signal, exits when it is aborted
async function worker(signal, jobs /* AsyncIterable<Job> */) {
  for await (const j of jobs) {
    if (signal.aborted) return;
    await process(signal, j);
  }
}`} />
          <ul className="plain">
            <li><b>Context leaks:</b> forgetting <code>cancel</code> keeps the child (and its timer) in the parent&apos;s tree until the parent is cancelled; under a root context that lives forever, that is a real leak. <code>go vet</code> checks for lostcancel.</li>
            <li>Do not store a context in a struct; pass it as the first parameter. <code>context.Value</code> is for request-scoped data only (trace ID, user), not business parameters.</li>
            <li>Newer: <code>WithCancelCause</code> (1.20), <code>WithoutCancel</code> and <code>AfterFunc</code> (1.21) to keep background work running after the request ends while keeping its values.</li>
            <li>Preventing races across several instances needs a lock outside the process: see <Link href="/en/concurrency/distributed-lock/" className="plink">Distributed lock</Link>.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
