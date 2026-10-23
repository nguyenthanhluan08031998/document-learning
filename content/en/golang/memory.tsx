import { CodeCompare } from "@/components/CodeCompare";
import { Box, Label, Markers } from "@/components/Svg";

// Tri-colour objects: [name, x, y, colour]
const OBJ: [string, number, number, "black" | "grey" | "white"][] = [
  ["A", 280, 70, "black"], ["B", 280, 170, "black"],
  ["C", 430, 50, "grey"], ["D", 430, 150, "grey"],
  ["E", 580, 50, "white"], ["F", 580, 150, "white"], ["X", 740, 110, "white"],
];
const EDGES: [number, number, number, number][] = [
  [180, 90, 262, 75], [180, 150, 262, 165], [298, 66, 412, 54], [298, 172, 412, 154], [448, 50, 562, 50], [448, 150, 562, 150],
];
const FILL = { black: "var(--ink)", grey: "var(--muted)", white: "var(--surface)" };

// GC cycle phases on a timeline: [label, x, width, stop-the-world]
const PHASES: [string, number, number, boolean][] = [
  ["STW", 40, 50, true], ["Mark (concurrent)", 90, 400, false], ["STW", 490, 50, true], ["Sweep (concurrent, lazy)", 540, 320, false],
];

export default function GoMemoryPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Memory and GC contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gm-escape"><span>01</span>Stack, heap, escape</a></li>
          <li><a href="#gm-tricolor"><span>02</span>Tri-colour GC</a></li>
          <li><a href="#gm-cycle"><span>03</span>GC cycle, STW</a></li>
          <li><a href="#gm-tune"><span>04</span>GOGC, GOMEMLIMIT</a></li>
          <li><a href="#gm-reduce"><span>05</span>Less GC pressure</a></li>
          <li><a href="#gm-padding"><span>06</span>Struct padding</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · memory</div>
          <h1>Memory, Escape Analysis and the GC</h1>
          <p className="lede">Stack variables are nearly free; heap variables must be cleaned up by the GC (Garbage Collector). Most performance work in Go is cutting heap allocations, and understanding the GC to tune GOGC and GOMEMLIMIT in the right places.</p>
          <div className="tape" aria-hidden="true">
            <div>-gcflags=-m</div>
            <div>tri-color</div>
            <div>write barrier</div>
            <div className="hw">GOMEMLIMIT</div>
            <div>sync.Pool</div>
            <div>Green Tea</div>
          </div>
        </header>

        <section id="gm-escape">
          <h2><span className="n">01</span>Stack, heap and escape analysis</h2>
          <p>Go does not let you choose where to allocate. The compiler runs <b>escape analysis</b>: if it can prove a variable does not outlive the function that created it, the variable goes on the stack (gone when the function returns); otherwise it <b>escapes</b> to the heap and the GC manages it.</p>
          <CodeCompare go={`func newInt() *int {
    x := 1      // tiny, but still on the heap: a pointer to x outlives the function
    return &x
}

func log(v int) {
    fmt.Println(v) // v is boxed into an any interface → usually escapes
}

func buf(n int) []byte {
    return make([]byte, n) // size unknown at compile time → heap
}

// go build -gcflags='-m' ./...
// ./main.go:2:5: moved to heap: x
// ./main.go:7:16: v escapes to heap`} js={`// V8 does escape analysis in the JIT; you cannot see or force it.
// Objects live on the heap, small integers (Smi) are stored inline.
function newInt() {
  const x = { v: 1 }; // heap object, collected once unreachable
  return x;
}

// Inspect the heap instead
// node --trace-gc app.js
// node --heapsnapshot-signal=SIGUSR2 app.js
console.log(process.memoryUsage().heapUsed);`} />
          <div className="pp">
            <div><span className="pl">Usually escapes</span>Returning a pointer to a local; assigning to an interface; a closure capturing a variable and outliving the function; storing in a global, map or channel; slices with a dynamic or very large size.</div>
            <div><span className="pl">Does not escape</span>Values returned by value; pointers only passed down to callees that do not keep them; <code>make([]T, 64)</code> with a small constant.</div>
          </div>
        </section>

        <section id="gm-tricolor">
          <h2><span className="n">02</span>GC: tri-colour mark &amp; sweep</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 250" role="img" aria-label="Tri-colour marking: roots point to A and B, already scanned and black; C and D are grey, waiting to be scanned; E and F are white and will be marked next; X is white with no references and is reclaimed">
                <Markers id="tc" />
                <Box x={20} y={60} w={160} h={110} title="Roots" sub="stacks, globals" cls="s-hl" />
                {EDGES.map(([x1, y1, x2, y2], i) => <path key={i} className="s-ln" d={`M${x1} ${y1} L${x2} ${y2}`} markerEnd="url(#tca)" />)}
                {OBJ.map(([n, x, y, c]) => (
                  <g key={n}>
                    <circle cx={x} cy={y} r="18" style={{ fill: FILL[c], stroke: "var(--ink)", strokeWidth: 1.5, strokeDasharray: n === "X" ? "4 3" : undefined }} />
                    <text className="s-tb" x={x} y={y + 5} textAnchor="middle" style={{ fill: c === "white" ? "var(--ink)" : "var(--surface)" }}>{n}</text>
                  </g>
                ))}
                <Label x={280} y={222} anchor="middle">black: scanned</Label>
                <Label x={430} y={222} anchor="middle">grey: to scan</Label>
                <Label x={580} y={222} anchor="middle">white: not seen yet</Label>
                <Label x={740} y={160} anchor="middle" color="var(--bad)">nothing points here</Label>
                <Label x={740} y={176} anchor="middle" color="var(--bad)">→ swept</Label>
              </svg>
            </div>
            <figcaption>Every object starts white; roots turn grey; grey objects are taken one by one and scanned, their children turn grey and they turn black. When no grey is left, whatever is still white is garbage.</figcaption>
          </figure>
          <ul className="plain">
            <li><b>Concurrent:</b> marking runs alongside your code (about 25% of the Central Processing Unit (CPU) by default). Because the program keeps changing pointers while marking, the compiler inserts a <b>write barrier</b> so a black object never points to a white object the GC does not know about.</li>
            <li><b>Non-generational, non-compacting:</b> no young/old generations like Java, objects never move. Size-class allocation keeps fragmentation low instead.</li>
            <li><b>GC assist:</b> a goroutine allocating fast during marking is made to help with marking, so that request&apos;s latency rises. This often hurts more than STW (Stop-The-World).</li>
            <li><b>Green Tea GC</b> (default since 1.26): scans memory page by page instead of chasing individual objects, using the CPU cache better and cutting GC time by 10–40%.</li>
          </ul>
        </section>

        <section id="gm-cycle">
          <h2><span className="n">03</span>The GC cycle and STW</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 150" role="img" aria-label="GC cycle: a short STW to turn on the write barrier, concurrent mark, a short STW for mark termination, concurrent sweep">
                {PHASES.map(([t, x, w, stw], i) => (
                  <g key={i}>
                    <rect className={stw ? "s-bad" : "s-hl"} x={x} y={40} width={w} height={44} rx="5" />
                    <text className="s-tb" x={x + w / 2} y={67} textAnchor="middle">{t}</text>
                  </g>
                ))}
                <Label x={65} y={104} anchor="middle">enable write barrier</Label>
                <Label x={515} y={104} anchor="middle">mark termination</Label>
                <Label x={290} y={120} anchor="middle">25% CPU + GC assist, the app keeps running</Label>
                <Label x={700} y={120} anchor="middle">pages swept lazily on allocation</Label>
                <Label x={40} y={26}>each STW is usually tens to hundreds of µs</Label>
              </svg>
            </div>
          </figure>
          <p>There are only two short STW phases: at the start of a cycle (finish the previous sweep, enable the write barrier) and at the end of marking (disable the write barrier, prepare to sweep). STW time barely depends on heap size. Long pauses usually mean goroutines that could not be stopped (before 1.14) or a CPU-starved machine.</p>
        </section>

        <section id="gm-tune">
          <h2><span className="n">04</span>GOGC and GOMEMLIMIT</h2>
          <div className="cmp">
            <div><h4>GOGC (default 100)</h4>The next GC runs when the heap has grown by GOGC% over the live heap after the last GC. Live 200 MB, GOGC=100 → GC at 400 MB. Higher GOGC: fewer GCs, more RAM (Random Access Memory). <code>GOGC=off</code> disables the GC.</div>
            <div><h4>GOMEMLIMIT (1.19)</h4>A soft limit on total runtime memory. Close to the limit the GC runs more often regardless of GOGC. Set it to about 80–90% of the container memory limit to avoid OOM (Out Of Memory) kills.</div>
          </div>
          <CodeCompare goLang="bash" jsLang="bash" go={`# 1 GiB container: sparse GCs while RAM is free, denser near 900 MiB
GOGC=200 GOMEMLIMIT=900MiB ./app

# print every GC: time, heap before/after, CPU %
GODEBUG=gctrace=1 ./app
# gc 12 @3.1s 2%: 0.03+1.8+0.02 ms clock, ... 180->184->95 MB, 190 MB goal, 8 P`} js={`# container 1 GiB: cap the old space so V8 collects before the OOM killer
node --max-old-space-size=900 app.js

# trace each GC: type, heap before -> after, time
node --trace-gc app.js
# ... Mark-Compact 180.0 (190.2) -> 95.1 (110.4) MB, 8.2 ms`} />
          <div className="note">If the live heap really sits close to GOMEMLIMIT, the GC runs nonstop (a death spiral) and CPU climbs. A soft limit does not replace fixing a leak.</div>
        </section>

        <section id="gm-reduce">
          <h2><span className="n">05</span>Reducing GC pressure</h2>
          <CodeCompare go={`// 1. Preallocate enough capacity
out := make([]Item, 0, len(in))

// 2. Reuse buffers through sync.Pool (gradually emptied by each GC; only for temporary data)
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}

func render(v any) []byte {
    b := bufPool.Get().(*bytes.Buffer)
    b.Reset()
    defer bufPool.Put(b)
    json.NewEncoder(b).Encode(v)
    return bytes.Clone(b.Bytes()) // copy out before the buffer goes back to the pool
}

// 3. Build strings with strings.Builder, append into an existing []byte (strconv.AppendInt...)
// 4. Prefer []T over []*T when it works: fewer objects for the GC to scan
// 5. Measure before optimising
//    go test -bench=. -benchmem   →  allocs/op
//    func BenchmarkX(b *testing.B) { for b.Loop() { X() } }  // b.Loop since 1.24`} js={`// 1. Preallocate
const out = new Array(input.length);

// 2. Buffers: Buffer.allocUnsafe draws from an internal pool; copy out what you keep
function render(v) {
  return Buffer.from(JSON.stringify(v));
}

// 3. Join strings with array.join, write into a preallocated Buffer
// 4. Prefer flat arrays of numbers (typed arrays) over arrays of objects: less for GC to trace
// 5. Measure before optimizing
//    node --cpu-prof app.js   ·   node --heap-prof app.js
//    benchmark with tinybench or mitata`} />
        </section>

        <section id="gm-padding">
          <h2><span className="n">06</span>Data alignment and struct padding</h2>
          <p>Each field must sit at an address divisible by its alignment (8 bytes for int64), so the compiler inserts padding between fields. Ordering fields from largest to smallest reduces the waste.</p>
          <CodeCompare go={`type Bad struct {  // 24 bytes
    a bool         // 1 + 7 padding
    b int64        // 8
    c bool         // 1 + 7 padding
}

type Good struct { // 16 bytes
    b int64        // 8
    a bool         // 1
    c bool         // 1 + 6 padding
}

fmt.Println(unsafe.Sizeof(Bad{}), unsafe.Sizeof(Good{})) // 24 16
// Tool: fieldalignment (golang.org/x/tools) suggests a better order`} js={`// JS objects have no manual layout: V8 picks hidden classes.
// Keep the object shape stable so inline caches stay fast.
const bad = { a: true };
bad.b = 1;                       // adding a field later changes the shape
const good = { a: true, b: 1 };  // same fields, same order, from the start

// Need an exact layout? Use a DataView over an ArrayBuffer
const buf = new DataView(new ArrayBuffer(16));
buf.setBigInt64(0, 1n); // b at offset 0
buf.setUint8(8, 1);     // a at offset 8
buf.setUint8(9, 1);     // c at offset 9
console.log(buf.byteLength); // 16`} />
          <p className="sub">Worth doing for structs with millions of copies in memory or in large slices. For ordinary structs, prefer the order that reads best.</p>
        </section>
      </main>
    </div>
  );
}
