import { Code } from "@/components/Code";

// Every release from 1.0 to the current one: [version, release month, highlights]
const RELEASES: [string, string, string][] = [
  ["1.0", "03/2012", "First stable release. The Go 1 compatibility promise: code written for 1.0 still builds on every 1.x."],
  ["1.1", "05/2013", "Race detector (go test -race). int is 64-bit on 64-bit machines."],
  ["1.2", "12/2013", "The scheduler can switch goroutines at function entry (partial preemption). Three-index slices a[i:j:k]."],
  ["1.3", "06/2014", "Contiguous stacks (copied when they grow) replace segmented stacks. Precise GC for the heap."],
  ["1.4", "12/2014", "Most of the runtime rewritten in Go. go generate, internal/ directories."],
  ["1.5", "08/2015", "Compiler written in Go (no more C). Concurrent GC: pauses drop from hundreds of ms to under 10 ms. GOMAXPROCS defaults to the CPU count."],
  ["1.6", "02/2016", "net/http supports HTTP/2 by default. vendor/ on by default."],
  ["1.7", "08/2016", "context package joins the standard library. SSA backend for amd64: faster, smaller binaries."],
  ["1.8", "02/2017", "GC pauses usually under 100 µs. sort.Slice. http.Server.Shutdown (graceful shutdown)."],
  ["1.9", "08/2017", "Type aliases (type A = B). sync.Map. math/bits."],
  ["1.10", "02/2018", "Build cache and test cache."],
  ["1.11", "08/2018", "Go modules (go.mod), experimental. WebAssembly."],
  ["1.12", "02/2019", "TLS 1.3 (opt-in). Module improvements."],
  ["1.13", "09/2019", "Error wrapping: %w, errors.Is, errors.As. GOPROXY defaults to proxy.golang.org. Literals 0b1010, 1_000_000."],
  ["1.14", "02/2020", "Asynchronous preemption: long-running loops no longer hold a P forever. Modules ready for production. defer is nearly free."],
  ["1.15", "08/2020", "Faster linker, smaller binaries."],
  ["1.16", "02/2021", "//go:embed. Modules on by default (GO111MODULE=on). io/fs. Apple M1 support."],
  ["1.17", "08/2021", "Register-based calling convention, about 5% faster. Module graph pruning."],
  ["1.18", "03/2022", "Generics (type parameters). Fuzzing (go test -fuzz). Workspaces (go.work). any = interface{}."],
  ["1.19", "08/2022", "GOMEMLIMIT (soft memory limit). atomic.Int64, atomic.Pointer[T] types."],
  ["1.20", "02/2023", "PGO preview. errors.Join (combine errors). context.WithCancelCause."],
  ["1.21", "08/2023", "min, max, clear. log/slog, slices, maps, cmp packages. PGO GA. toolchain line in go.mod; versions numbered 1.21.0."],
  ["1.22", "02/2024", "Loop variables are per-iteration (no more closures capturing the last value). for i := range 10. ServeMux routes by method and wildcard: \"GET /users/{id}\". math/rand/v2."],
  ["1.23", "08/2024", "Range over functions (iterators), iter package. unique package. Unstopped Timers/Tickers can be collected."],
  ["1.24", "02/2025", "Generic type aliases. Maps switch to Swiss Tables (faster). sync.Map rewritten. tool lines in go.mod. os.Root, weak package, runtime.AddCleanup, testing.B.Loop, json omitzero."],
  ["1.25", "08/2025", "GOMAXPROCS follows the container CPU limit (cgroup). Experimental Green Tea GC. testing/synctest GA. sync.WaitGroup.Go. Trace flight recorder."],
  ["1.26", "02/2026", "new(expr) takes an initial value. Self-referential generic types. Green Tea GC by default (10–40% less GC overhead). cgo ~30% faster. errors.AsType. go fix rewritten with modernizers."],
  ["1.27", "08/2026", "Generic methods (methods with their own type parameters). encoding/json/v2 GA; encoding/json runs on v2. uuid package. goroutineleak profile GA. Small allocations up to 30% cheaper. crypto/mldsa (post-quantum signatures)."],
];

export default function GoVersionsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go versions contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gv-intro"><span>01</span>What is Go</a></li>
          <li><a href="#gv-table"><span>02</span>Releases</a></li>
          <li><a href="#gv-milestones"><span>03</span>Turning points</a></li>
          <li><a href="#gv-diff"><span>04</span>Code differences</a></li>
          <li><a href="#gv-support"><span>05</span>Support, upgrades</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · versions</div>
          <h1>Go: versions and release dates</h1>
          <p className="lede">Go ships a major release every six months (February and August). The current one is <b>Go 1.27</b> (08/2026). This page lists every release, the changes worth remembering, and how code differs between them.</p>
          <div className="tape" aria-hidden="true">
            <div>1.5 concurrent GC</div>
            <div>1.11 modules</div>
            <div>1.14 preemption</div>
            <div className="hw">1.18 generics</div>
            <div>1.22 loopvar</div>
            <div>1.23 iterators</div>
            <div>1.27 generic methods</div>
          </div>
        </header>

        <section id="gv-intro">
          <h2><span className="n">01</span>What is Go</h2>
          <p>Go (Golang) is a compiled, statically typed, garbage-collected language designed at Google by Robert Griesemer, Rob Pike and Ken Thompson starting in 2007. Open-sourced in <b>11/2009</b>; the stable <b>Go 1.0 shipped in 03/2012</b>.</p>
          <div className="pp">
            <div><span className="pl">One binary</span>Static binaries with no runtime to install, a great fit for small Docker images.</div>
            <div><span className="pl">Cheap concurrency</span>A goroutine costs a few KB of stack; hundreds of thousands can run at once. They talk over channels.</div>
            <div><span className="pl">Small language</span>Few keywords, one format (gofmt), no class inheritance; structs, interfaces and composition instead.</div>
            <div><span className="pl">Where it is used</span>Backends, microservices, CLIs, infrastructure: Docker, Kubernetes, Terraform and Prometheus are all written in Go.</div>
          </div>
        </section>

        <section id="gv-table">
          <h2><span className="n">02</span>Releases</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Release</th><th>Date</th><th>Highlights</th></tr></thead>
              <tbody>
                {RELEASES.map(([v, d, h]) => (
                  <tr key={v}><td className="v" style={{ whiteSpace: "nowrap" }}>Go {v}</td><td className="v">{d}</td><td>{h}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sub">Since 1.21 the first release of each line ends in .0 (go1.21.0); patches are 1.21.1, 1.21.2... Before that the first release was go1.20 and patches go1.20.1.</p>
        </section>

        <section id="gv-milestones">
          <h2><span className="n">03</span>Turning points to remember</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Milestone</th><th>Before</th><th>After</th></tr></thead>
              <tbody>
                <tr><td><b>1.5</b> · GC</td><td>Stop-the-world, pauses of hundreds of ms on large heaps</td><td>Concurrent mark &amp; sweep, pauses under 10 ms (1.8: under 100 µs)</td></tr>
                <tr><td><b>1.11–1.16</b> · Modules</td><td>GOPATH: all code in one directory, no pinned library versions</td><td>go.mod, go.sum: each project declares its versions and can live anywhere</td></tr>
                <tr><td><b>1.13</b> · Errors</td><td>Comparing error strings, losing the cause when wrapping</td><td><code>fmt.Errorf(&quot;...: %w&quot;, err)</code>, <code>errors.Is</code>, <code>errors.As</code></td></tr>
                <tr><td><b>1.14</b> · Preemption</td><td>A loop without function calls could hold a P forever and stall the GC</td><td>The runtime sends a signal to interrupt goroutines running over 10 ms</td></tr>
                <tr><td><b>1.18</b> · Generics</td><td>Rewrite functions per type or use interface{} plus type assertions</td><td><code>func Map[T, U any](s []T, f func(T) U) []U</code></td></tr>
                <tr><td><b>1.21</b> · Standard library</td><td>Third-party packages for structured logs and slice helpers</td><td>log/slog, slices, maps, min/max built in</td></tr>
                <tr><td><b>1.22</b> · Loop variables</td><td>One variable shared by all iterations; goroutines/closures saw the last value</td><td>A fresh variable per iteration</td></tr>
                <tr><td><b>1.23</b> · Iterators</td><td>Hand-written Next() or channels to iterate</td><td><code>for v := range seq</code> with <code>iter.Seq[T]</code></td></tr>
                <tr><td><b>1.24</b> · Maps</td><td>8-slot buckets plus overflow buckets</td><td>Swiss Tables, faster and smaller</td></tr>
                <tr><td><b>1.25–1.26</b> · Containers, GC</td><td>GOMAXPROCS = host CPUs even when the container gets 2</td><td>Follows the CPU limit; Green Tea GC by default</td></tr>
                <tr><td><b>1.27</b> · Generic methods</td><td>Methods could not have their own type parameters; use a free function</td><td><code>func (c *Cache) Get[T any](key string) (T, bool)</code></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gv-diff">
          <h2><span className="n">04</span>How code differs between releases</h2>
          <h3>Loop variables (1.22)</h3>
          <Code lang="go">{`for _, v := range []int{1, 2, 3} {
    go func() { fmt.Println(v) }()
}
// before 1.22: often prints 3 3 3 (all goroutines share v); you had to write v := v
// since 1.22:  prints 1 2 3 in any order (each iteration has its own v)`}</Code>

          <h3>Range over int (1.22) and iterators (1.23)</h3>
          <Code lang="go">{`for i := range 3 { fmt.Println(i) } // 0 1 2

// An iterator: a function taking yield; yield returns false to stop early
func Evens(n int) iter.Seq[int] {
    return func(yield func(int) bool) {
        for i := 0; i < n; i += 2 {
            if !yield(i) { return }
        }
    }
}
for v := range Evens(10) { fmt.Println(v) }
keys := slices.Sorted(maps.Keys(m)) // standard packages return iterators`}</Code>

          <h3>Generics (1.18), generic type aliases (1.24), generic methods (1.27)</h3>
          <Code lang="go">{`// 1.18: generic functions and types
func Map[T, U any](s []T, f func(T) U) []U {
    out := make([]U, 0, len(s))
    for _, v := range s { out = append(out, f(v)) }
    return out
}

// 1.24: aliases with type parameters
type Set[T comparable] = map[T]struct{}

// 1.27: a method with its own type parameter
type Store struct{ data map[string]any }
func (s *Store) Get[T any](key string) (T, bool) {
    v, ok := s.data[key].(T)
    return v, ok
}
n, _ := store.Get[int]("count")`}</Code>

          <h3>Standard router (1.22), WaitGroup.Go (1.25), new(expr) (1.26)</h3>
          <Code lang="go">{`mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id") // before 1.22 you needed gorilla/mux, chi...
})

var wg sync.WaitGroup
wg.Go(func() { work() }) // replaces wg.Add(1); go func() { defer wg.Done(); work() }()
wg.Wait()

p := new(int64(30)) // 1.26: pointer to an initial value, handy for optional *T fields`}</Code>
        </section>

        <section id="gv-support">
          <h2><span className="n">05</span>Support and upgrades</h2>
          <ul className="plain">
            <li>Each major release gets security fixes until <b>two newer releases</b> exist. Right now (10/2026) only 1.26 and 1.27 are supported.</li>
            <li>The <code>go 1.27</code> line in go.mod is the minimum language version; it also decides behaviour such as loopvar. A <code>toolchain go1.27.1</code> line makes go download the right toolchain.</li>
            <li>To upgrade: bump go.mod, run <code>go mod tidy</code>, <code>go vet ./...</code>, <code>go test -race ./...</code>, then <code>go fix ./...</code> so the modernizers rewrite code to newer idioms (min/max, range over int, slices.Contains...).</li>
            <li>Behaviour changes are toggled through GODEBUG. You can upgrade the toolchain first and keep old behaviour with a <code>godebug default=go1.25</code> line in go.mod, then fix things gradually.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
