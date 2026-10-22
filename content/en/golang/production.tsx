import Link from "next/link";
import { CodeCompare } from "@/components/CodeCompare";
import { Box, Label, Markers } from "@/components/Svg";

const WORKERS = [30, 90, 150];

export default function GoProductionPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go in production contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gp-pool"><span>01</span>Worker pool</a></li>
          <li><a href="#gp-db"><span>02</span>Connection pool</a></li>
          <li><a href="#gp-sf"><span>03</span>Cache stampede</a></li>
          <li><a href="#gp-pprof"><span>04</span>pprof, trace</a></li>
          <li><a href="#gp-incident"><span>05</span>CPU 100%, OOM</a></li>
          <li><a href="#gp-alloc"><span>06</span>Low allocation</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · production</div>
          <h1>Go in production</h1>
          <p className="lede">Problems seniors face: processing millions of jobs without exhausting resources, configuring the DB connection pool, stopping a request pile-up when a cache entry expires, and debugging 100% CPU or OOM with pprof.</p>
          <div className="tape" aria-hidden="true">
            <div>errgroup</div>
            <div>backpressure</div>
            <div>SetMaxOpenConns</div>
            <div className="hw">singleflight</div>
            <div>pprof</div>
            <div>go tool trace</div>
          </div>
        </header>

        <section id="gp-pool">
          <h2><span className="n">01</span>Worker pools and pipelines</h2>
          <figure className="fig">
            <div className="scroll">
              <svg viewBox="0 0 900 220" role="img" aria-label="A producer pushes jobs into a buffered channel; a fixed set of N workers read jobs, process them and push results to a results channel; when the buffer is full the producer blocks, creating backpressure">
                <Markers id="wp" />
                <Box x={20} y={80} w={140} h={56} title="Producer" sub="Kafka, DB, file" />
                <Box x={220} y={80} w={160} h={56} title="jobs chan" sub="buffer = 2 × N" cls="s-disk" />
                <path className="s-ln" d="M160 108 H218" markerEnd="url(#wpa)" />
                {WORKERS.map((y, i) => (
                  <g key={y}>
                    <Box x={460} y={y} w={140} h={44} title={`worker ${i + 1}`} cls="s-hl" />
                    <path className="s-ln" d={`M380 108 L458 ${y + 22}`} markerEnd="url(#wpa)" />
                    <path className="s-ln" d={`M600 ${y + 22} L678 108`} markerEnd="url(#wpa)" />
                  </g>
                ))}
                <Box x={680} y={80} w={200} h={56} title="results chan" sub="collect, write in batches" cls="s-disk" />
                <Label x={220} y={170} color="var(--warn)">full → producer waits (backpressure)</Label>
                <Label x={460} y={214}>fixed N ≈ the limit of the slowest resource (DB, API)</Label>
              </svg>
            </div>
          </figure>
          <CodeCompare go={`func Run(ctx context.Context, jobs <-chan Job, workers int) error {
    g, ctx := errgroup.WithContext(ctx) // golang.org/x/sync/errgroup
    g.SetLimit(workers)                  // at most N goroutines at a time
    for {
        select {
        case <-ctx.Done():               // one job fails → cancel everything
            return g.Wait()
        case j, ok := <-jobs:
            if !ok { return g.Wait() }
            g.Go(func() error { return handle(ctx, j) }) // Go blocks once N are running
        }
    }
}`} js={`// p-limit: at most N jobs at once, first failure aborts the rest
import pLimit from "p-limit";

async function run(signal, jobs /* AsyncIterable<Job> */, workers) {
  const limit = pLimit(workers);
  const ac = new AbortController();
  const all = AbortSignal.any([signal, ac.signal]);
  const tasks = [];
  let firstErr;
  for await (const j of jobs) {
    if (all.aborted) break;
    tasks.push(limit(() => handle(all, j)).catch((e) => { firstErr ??= e; ac.abort(); }));
  }
  await Promise.all(tasks);
  if (firstErr) throw firstErr;
}`} />
          <ul className="plain">
            <li><b>Don&apos;t</b> <code>go handle(j)</code> per job: a million jobs means a million goroutines opening DB connections at once.</li>
            <li>Size workers to the bottleneck: CPU-bound work ≈ GOMAXPROCS; I/O-bound work by the limit of the DB/API behind it, then measure and tune.</li>
            <li>Write results in batches (batch insert) and use <code>context</code> to stop cleanly on deploy (graceful shutdown).</li>
          </ul>
        </section>

        <section id="gp-db">
          <h2><span className="n">02</span>The database/sql connection pool</h2>
          <CodeCompare go={`db, _ := sql.Open("pgx", dsn)       // sql.DB is a pool: create once, share across the app
db.SetMaxOpenConns(25)              // default 0 = unlimited
db.SetMaxIdleConns(25)              // default 2
db.SetConnMaxLifetime(30 * time.Minute)
db.SetConnMaxIdleTime(5 * time.Minute)

rows, err := db.QueryContext(ctx, q)
if err != nil { return err }
defer rows.Close()                  // forget Close → the connection never returns to the pool`} js={`import pg from "pg";

const pool = new pg.Pool({          // created once, shared by the whole app
  connectionString: dsn,
  max: 25,                          // default 10
  idleTimeoutMillis: 5 * 60_000,
  maxLifetimeSeconds: 30 * 60,
});

const client = await pool.connect();
try {
  const { rows } = await client.query(q);
} finally {
  client.release();                 // forgetting release: the connection never returns to the pool
}`} />
          <div className="tbl">
            <table>
              <thead><tr><th>Misconfiguration</th><th>Consequence</th></tr></thead>
              <tbody>
                <tr><td>Unlimited MaxOpenConns</td><td>Under load thousands of connections open, Postgres returns <code>too many connections</code>, every instance fails together</td></tr>
                <tr><td>MaxIdleConns = 2 (default) under load</td><td>Connections are constantly closed and reopened, paying TLS handshakes, latency rises</td></tr>
                <tr><td>No ConnMaxLifetime</td><td>Dead connections after a DB failover or a proxy/LB cutting them, <code>bad connection</code> errors</td></tr>
                <tr><td>MaxOpenConns too small, forgotten rows.Close / tx.Commit</td><td>Requests queue for a connection; <code>db.Stats().WaitCount</code> climbs</td></tr>
              </tbody>
            </table>
          </div>
          <p className="sub">Total connections = MaxOpenConns × instances; keep it below the DB&apos;s <code>max_connections</code> (or put PgBouncer in front). Locking across instances: <Link href="/en/concurrency/db-lock/" className="plink">locks in the DB</Link>, <Link href="/en/concurrency/distributed-lock/" className="plink">distributed lock</Link>.</p>
        </section>

        <section id="gp-sf">
          <h2><span className="n">03</span>Cache stampede and singleflight</h2>
          <p>A hot key expires and 1,000 requests all see a cache miss and all query the DB (thundering herd). <code>singleflight</code> merges in-flight calls for the same key: only one real call runs, the others wait and share its result.</p>
          <CodeCompare go={`var group singleflight.Group // golang.org/x/sync/singleflight

func (s *Service) Product(ctx context.Context, id string) (*Product, error) {
    if p, ok := s.cache.Get(id); ok {
        return p, nil
    }
    v, err, _ := group.Do("product:"+id, func() (any, error) {
        p, err := s.repo.Find(ctx, id)
        if err == nil { s.cache.Set(id, p, 5*time.Minute+jitter()) }
        return p, err
    })
    if err != nil { return nil, err }
    return v.(*Product), nil
}`} js={`const inflight = new Map(); // key -> Promise, the singleflight group

async function product(id) {
  const hit = cache.get(id);
  if (hit) return hit;

  const key = "product:" + id;
  if (!inflight.has(key)) {
    inflight.set(key, (async () => {
      try {
        const p = await repo.find(id);
        cache.set(id, p, 5 * 60_000 + jitter());
        return p;
      } finally {
        inflight.delete(key);
      }
    })());
  }
  return inflight.get(key);
}`} />
          <ul className="plain">
            <li>singleflight only merges within <b>one process</b>. With many instances add a short Redis lock, or refresh the cache before it expires.</li>
            <li>Add random jitter to TTLs so keys do not expire together.</li>
            <li>Mind the ctx: if the first request is cancelled the shared call fails too; use <code>context.WithoutCancel</code> inside if needed.</li>
          </ul>
        </section>

        <section id="gp-pprof">
          <h2><span className="n">04</span>pprof and the execution tracer</h2>
          <CodeCompare go={`import _ "net/http/pprof" // registers /debug/pprof/* on DefaultServeMux

go func() { log.Println(http.ListenAndServe("localhost:6060", nil)) }() // internal only`} js={`import inspector from "node:inspector";

// Built-in profiler: attach DevTools to this port (internal only)
inspector.open(9229, "127.0.0.1");

// Or profile from the command line
// node --cpu-prof --heap-prof app.js`} />
          <div className="tbl">
            <table>
              <thead><tr><th>Profile</th><th>Answers</th><th>Command</th></tr></thead>
              <tbody>
                <tr><td><b>CPU</b></td><td>Which functions burn CPU</td><td><code>go tool pprof http://host:6060/debug/pprof/profile?seconds=30</code></td></tr>
                <tr><td><b>Heap</b></td><td>inuse_space: who holds memory; alloc_space: who allocates the most</td><td><code>go tool pprof -sample_index=inuse_space .../heap</code></td></tr>
                <tr><td><b>Goroutine</b></td><td>How many goroutines and which line they are stuck on</td><td><code>curl .../goroutine?debug=2</code></td></tr>
                <tr><td><b>goroutineleak</b> (1.27)</td><td>Goroutines blocked forever on something nothing can reach</td><td><code>.../goroutineleak</code></td></tr>
                <tr><td><b>Block / Mutex</b></td><td>How long goroutines wait on channels and locks; enable with <code>runtime.SetBlockProfileRate</code>, <code>SetMutexProfileFraction</code></td><td><code>.../block</code>, <code>.../mutex</code></td></tr>
                <tr><td><b>Trace</b></td><td>Which P each goroutine ran on, GC, syscalls, scheduler waits over time</td><td><code>curl .../trace?seconds=5 &gt; t.out; go tool trace t.out</code></td></tr>
              </tbody>
            </table>
          </div>
          <p className="sub">In pprof: <code>top</code>, <code>list FuncName</code>, <code>-http=:8080</code> for the flame graph. Compare two heap profiles with <code>-diff_base</code> to see what grew. For rare incidents, <code>trace.FlightRecorder</code> (1.25) keeps the last few seconds of trace in memory and writes them out on error.</p>
        </section>

        <section id="gp-incident">
          <h2><span className="n">05</span>Scenario: 100% CPU or OOM</h2>
          <div className="cmp">
            <div>
              <h4>100% CPU</h4>
              <ol className="steps">
                <li><div><b>Narrow it down</b><div className="d">Since when, after which deploy, which endpoint, all instances or one.</div></div></li>
                <li><div><b>30 s CPU profile</b><div className="d">Read the top functions. Usual suspects: JSON/regex in a hot loop, busy-wait loops, excessive logging.</div></div></li>
                <li><div><b>Is it the GC?</b><div className="d">If runtime.gcBgMarkWorker and mallocgc lead: too many allocations, or GOMEMLIMIT too close to the live heap.</div></div></li>
                <li><div><b>Lock contention</b><div className="d">Mutex profile and trace show goroutines queuing.</div></div></li>
              </ol>
            </div>
            <div>
              <h4>OOM</h4>
              <ol className="steps">
                <li><div><b>Read the metrics</b><div className="d">Does RSS climb steadily (leak) or spike (one big request)? Compare go_memstats_heap_inuse with RSS.</div></div></li>
                <li><div><b>Goroutine count</b><div className="d">Rising over time → goroutine leak; read the goroutine profile.</div></div></li>
                <li><div><b>Heap profile, inuse_space</b><div className="d">Take two a few minutes apart and compare with -diff_base. Usual suspects: unbounded caches, maps never cleaned, sub-slices pinning big arrays, reading whole bodies/files into RAM.</div></div></li>
                <li><div><b>Stop the bleeding</b><div className="d">GOMEMLIMIT ≈ 90% of the container limit, cap request sizes, then fix the root cause.</div></div></li>
              </ol>
            </div>
          </div>
        </section>

        <section id="gp-alloc">
          <h2><span className="n">06</span>Zero/low allocation techniques</h2>
          <ul className="plain">
            <li>Preallocate with <code>make([]T, 0, n)</code>, <code>strings.Builder.Grow</code>; reuse buffers through <code>sync.Pool</code>.</li>
            <li>Use <code>Append</code>-style APIs: <code>strconv.AppendInt</code>, <code>time.AppendFormat</code>, writing straight into an existing <code>[]byte</code>.</li>
            <li>Avoid needless <code>[]byte</code> ↔ <code>string</code> conversions; avoid <code>fmt.Sprintf</code> in hot paths; avoid unnecessary interfaces and closures.</li>
            <li>Pass large structs by pointer, small ones by value (values live on the stack and give the GC no work).</li>
            <li>Confirm with <code>-benchmem</code> and <code>-gcflags=-m</code>; see also <Link className="plink" href="/en/golang/memory/">Memory &amp; GC</Link>.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
