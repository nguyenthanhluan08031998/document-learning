import { CodeCompare } from "@/components/CodeCompare";
import { Box, Label, Markers } from "@/components/Svg";

const ARR = ["10", "20", "30", "40", "50", "", ""];

export default function GoDataStructuresPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Slice, map, interface contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gd-slice"><span>01</span>Slices</a></li>
          <li><a href="#gd-append"><span>02</span>append, passing slices</a></li>
          <li><a href="#gd-map"><span>03</span>Maps</a></li>
          <li><a href="#gd-syncmap"><span>04</span>Maps and goroutines</a></li>
          <li><a href="#gd-iface"><span>05</span>Interfaces</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · data structures</div>
          <h1>Slices, Maps and Interfaces under the hood</h1>
          <p className="lede">The three most-used types are also three classic sources of bugs: slices sharing an array, maps that are unsafe with concurrent writers, and interfaces holding a nil pointer that are still not nil.</p>
          <div className="tape" aria-hidden="true">
            <div>ptr · len · cap</div>
            <div>append</div>
            <div className="hw">Swiss Tables</div>
            <div>sync.Map</div>
            <div>eface · iface</div>
            <div>itab</div>
          </div>
        </header>

        <section id="gd-slice">
          <h2><span className="n">01</span>A slice is a three-field header</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 240" role="img" aria-label="A 7-slot backing array; slice a has ptr to the first slot, len 5, cap 7; slice b equal to a[1:3] points at the second slot, len 2, cap 6, sharing the backing array with a">
                <Markers id="sl" />
                <Box x={20} y={20} w={190} h={60} title="a  []int" sub="ptr · len=5 · cap=7" cls="s-hl" />
                <Box x={20} y={150} w={190} h={60} title="b := a[1:3]" sub="ptr · len=2 · cap=6" cls="s-hl" />
                <text className="s-lane" x="620" y="96">BACKING ARRAY</text>
                {ARR.map((v, i) => (
                  <g key={i}>
                    <rect className={i >= 1 && i < 3 ? "s-disk" : "s-box"} x={300 + i * 80} y={108} width={72} height={44} rx="5" />
                    <text className="s-tb" x={336 + i * 80} y={135} textAnchor="middle">{v}</text>
                    <text className="s-tm" x={336 + i * 80} y={168} textAnchor="middle">[{i}]</text>
                  </g>
                ))}
                <path className="s-ln" d="M210 50 C260 50 300 70 330 106" markerEnd="url(#sla)" />
                <path className="s-ln" d="M210 180 C300 180 380 170 410 154" markerEnd="url(#sla)" />
                <Label x={300} y={210}>b[0] = 99 also changes a[1]: both slices point into one array</Label>
              </svg>
            </div>
            <figcaption>The slice header holds a pointer to the array, <code>len</code> (usable elements) and <code>cap</code> (from ptr to the end of the array). 24 bytes on a 64-bit machine.</figcaption>
          </figure>
        </section>

        <section id="gd-append">
          <h2><span className="n">02</span>append and passing slices to functions</h2>
          <ul className="plain">
            <li>With spare capacity, <code>append</code> writes into the old array and bumps len. Without it, it allocates a new array, copies over, and returns a new header pointing at it. That is why you write <code>s = append(s, x)</code>.</li>
            <li>Growth (since 1.18): under 256 capacity it doubles; above that it tapers from 2x towards about 1.25x, then rounds up to the allocator&apos;s size class.</li>
          </ul>
          <CodeCompare go={`func modify(s []int) {
    s[0] = 100          // the header is copied, but ptr points to the same array → caller sees it
    s = append(s, 4)    // only changes len/ptr of the copy → caller does not see it
}

s := make([]int, 3, 10)
modify(s)
fmt.Println(s, len(s)) // [100 0 0] 3  — the 4th element is in the array but beyond len

// Trap: appending to a sub-slice overwrites the parent's data
a := []int{1, 2, 3, 4}
b := a[:2]
b = append(b, 99)      // spare cap → writes into a[2]
fmt.Println(a)         // [1 2 99 4]
c := a[:2:2]           // three-index slice: cap = 2, append must allocate a new array

// Memory trap: a small slice of a big array keeps the whole big array alive
head := bytes.Clone(big[:64])`} js={`// Arrays are passed by reference: both changes are visible to the caller
function modify(arr) {
  arr[0] = 100;
  arr.push(4);
}
const s = new Array(3).fill(0);
modify(s);
console.log(s, s.length); // [100, 0, 0, 4] 4

// slice() copies; a typed-array view shares memory like a Go sub-slice
const a = new Int32Array([1, 2, 3, 4]);
const b = a.subarray(0, 2); // shares the buffer with a
b[0] = 99;                  // a[0] is now 99
const c = a.slice(0, 2);    // independent copy

// A small view keeps the whole ArrayBuffer alive: copy it to release the big one
const head = big.slice(0, 64);`} />
        </section>

        <section id="gd-map">
          <h2><span className="n">03</span>Maps under the hood</h2>
          <div className="cmp">
            <div><h4>Before 1.24: hmap + buckets</h4><code>hmap</code> holds an array of 2<sup>B</sup> buckets. Each bucket (bmap) has 8 key/value slots and 8 tophash bytes; when full it chains an overflow bucket. Above an average of 6.5 entries per bucket the table doubles; with too many overflow buckets it rebuilds at the same size. <b>Evacuation</b> is incremental: each write moves a few old buckets to the new array, so the map never stops as a whole.</div>
            <div><h4>Since 1.24: Swiss Tables</h4>Slots are grouped by 8, each group with a control word holding 7 hash bits per slot, so all 8 slots are matched at once. A large map is split into many small tables (up to 1024 slots); only the full table splits, so growth is spread out with no single big copy. Faster and smaller.</div>
          </div>
          <ul className="plain">
            <li>Iteration order is <b>deliberately random</b>; for a fixed order use <code>slices.Sorted(maps.Keys(m))</code>.</li>
            <li>You cannot take the address of a map element (<code>&amp;m[k]</code> does not compile) because elements may move as the map grows.</li>
            <li>Maps never shrink: deleting every entry keeps the bucket memory. Replace a temporarily huge map with a new one.</li>
          </ul>
        </section>

        <section id="gd-syncmap">
          <h2><span className="n">04</span>Maps and multiple goroutines</h2>
          <p>Maps have no internal lock so the common single-goroutine case stays fast. Two goroutines writing, or one writing while another reads, are detected by the runtime, which stops the whole program with <code>fatal error: concurrent map writes</code> (or <code>concurrent map read and map write</code>) — not recoverable.</p>
          <div className="tbl">
            <table>
              <thead><tr><th>Option</th><th>Fits when</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td><b>map + sync.RWMutex</b></td><td>Most cases; you want static types, len, controlled iteration</td><td>With heavy writes the lock becomes the bottleneck → shard it (N maps, N locks by key hash)</td></tr>
                <tr><td><b>sync.Map</b></td><td>Keys written once and read many times (cache), or each goroutine works on its own key set</td><td>Typed <code>any</code>, no len. Since 1.24 a concurrent hash-trie with faster writes</td></tr>
              </tbody>
            </table>
          </div>
          <CodeCompare jsLang="bash" go={`// Catch data races in tests and trial runs
go test -race ./...
go run -race .`} js={`# A single JS thread has no data race; races are logical (await interleaving).
# Test with real concurrency (worker_threads) through the built-in runner:
node --test`} />
        </section>

        <section id="gd-iface">
          <h2><span className="n">05</span>Interfaces: eface and iface</h2>
          <div className="cmp">
            <div><h4>eface · <code>any</code></h4>Two words: <code>_type</code> (the dynamic type) and <code>data</code> (pointer to the value).</div>
            <div><h4>iface · interface with methods</h4>Two words: <code>tab *itab</code> and <code>data</code>. The itab holds the interface type, the dynamic type and a table of function pointers <code>fun[]</code>; it is computed once and cached.</div>
          </div>
          <p><b>Interface satisfaction</b> is implicit: a type with all the methods satisfies the interface, no <code>implements</code> needed. Check at compile time with <code>var _ Repo = (*PgRepo)(nil)</code>.</p>
          <p><b>Cost of calling through an interface:</b> one indirect call via the itab, no inlining (unless PGO devirtualises it), and assigning a value to an interface often makes it escape to the heap. It matters in hot loops; it does not matter at the service/repository layer.</p>
          <CodeCompare go={`// The nil interface trap: an interface is nil only when both _type and data are nil
func find() error {
    var err *NotFoundError = nil
    return err             // returns iface{tab: *NotFoundError, data: nil}
}
fmt.Println(find() == nil) // false!  → return a literal nil when there is no error

// 1.26: errors.AsType instead of errors.As with a temporary variable
if nf, ok := errors.AsType[*NotFoundError](err); ok { ... }`} js={`// No nil-interface trap: null is a plain value
function find() {
  const err = null;
  return err;                   // null
}
console.log(find() === null);   // true

// Pitfall instead: null vs undefined
console.log(null == undefined, null === undefined); // true false

// Typed errors: instanceof replaces errors.As
if (err instanceof NotFoundError) { ... }`} />
        </section>
      </main>
    </div>
  );
}
