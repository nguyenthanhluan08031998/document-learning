import Link from "next/link";
import { CodeCompare } from "@/components/CodeCompare";
import { findPage } from "@/lib/notebook";

// Short answers to the most common senior Go questions: [question, answer, page]
const QA: [string, string, string][] = [
  ["What are G, M, P?", "G is a goroutine, M an OS thread, P the right to run Go code plus its own queue. Number of Ps = GOMAXPROCS.", "runtime"],
  ["A goroutine makes a blocking syscall?", "The M is stuck with the G; sysmon hands the P to another M. Network I/O goes through the netpoller and pins no M.", "runtime"],
  ["What is work stealing?", "An idle P takes half the queue of another P chosen at random.", "runtime"],
  ["What is in hchan?", "buf (ring buffer), qcount, dataqsiz, sendx, recvx, sendq, recvq (sudog queues), closed, lock.", "concurrency"],
  ["Unbuffered vs buffered?", "Unbuffered: copied stack to stack, both sides must meet. Buffered: written to buf, blocks only when full/empty.", "concurrency"],
  ["What causes goroutine leaks?", "Blocking forever on a channel/lock: sending with no receiver, receiving with no close, forgotten context cancel.", "concurrency"],
  ["Channel or Mutex?", "Channels to move data and signal; a Mutex to protect shared state.", "concurrency"],
  ["Go's GC?", "Concurrent tri-colour mark & sweep with a write barrier, non-generational, non-compacting. 1.26: Green Tea.", "memory"],
  ["Where is STW?", "Two short phases: enabling the write barrier at the start and mark termination. Usually under 1 ms.", "memory"],
  ["Escape analysis?", "The compiler decides stack or heap; see it with -gcflags=-m. Returning &x escapes.", "memory"],
  ["GOGC, GOMEMLIMIT?", "GOGC: how much % the heap may grow before the next GC. GOMEMLIMIT: a soft limit; near it the GC runs more often.", "memory"],
  ["Passing a slice to a function?", "The header is copied: element changes are visible to the caller, append is not.", "data-structures"],
  ["Why are maps not thread-safe?", "No lock, to stay fast for the single-goroutine case; concurrent writes cause a fatal error.", "data-structures"],
  ["eface, iface?", "eface (any): _type + data. iface: itab (type + method table) + data.", "data-structures"],
  ["Cache stampede?", "singleflight merges same-key calls within a process, jittered TTLs, a short lock across instances.", "production"],
  ["100% CPU, OOM?", "Metrics → pprof CPU/heap/goroutine → compare profiles → fix the cause; GOMEMLIMIT as a stopgap.", "production"],
];

const label = (slug: string) => {
  const p = findPage("golang", slug)?.page;
  return p?.labelEn ?? p?.label;
};

export default function GoInterviewPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go interview contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gi-quick"><span>01</span>Quick answers</a></li>
          <li><a href="#gi-orm"><span>02</span>ORM or SQL</a></li>
          <li><a href="#gi-http"><span>03</span>HTTP frameworks</a></li>
          <li><a href="#gi-test"><span>04</span>Testing strategy</a></li>
          <li><a href="#gi-legacy"><span>05</span>Refactoring, upgrades</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · senior interview</div>
          <h1>Senior Go interview: cheat sheet</h1>
          <p className="lede">Senior interviewers rarely ask about syntax; they ask how the runtime works, about performance, system design and handling incidents. This page collects short answers linking to the detailed pages, plus the “senior mindset” part: the reasoning behind technology choices.</p>
        </header>

        <section id="gi-quick">
          <h2><span className="n">01</span>Quick answers</h2>
          <div className="tbl">
            <table>
              <thead><tr><th>Question</th><th>Key point</th><th>Details</th></tr></thead>
              <tbody>
                {QA.map(([q, a, p]) => (
                  <tr key={q}><td><b>{q}</b></td><td>{a}</td><td><Link className="plink" href={`/en/golang/${p}/`}>{label(p)}</Link></td></tr>
                ))}
                <tr><td><b>gRPC or REST (Representational State Transfer)?</b></td><td>gRPC (HTTP/2 + Protobuf) between internal services: fast, contract-first, streaming. REST + JSON (JavaScript Object Notation) for external clients, browsers, partners.</td><td><Link className="plink" href="/en/api/compare/">API (Application Programming Interface)</Link></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gi-orm">
          <h2><span className="n">02</span>ORM (GORM, Ent) or SQL (sqlx, pgx, sqlc)</h2>
          <div className="tbl">
            <table>
              <thead><tr><th></th><th>GORM (Object-Relational Mapping)</th><th>Ent</th><th>sqlc / sqlx / pgx</th></tr></thead>
              <tbody>
                <tr><td><b>Style</b></td><td>Method chains, runtime reflection</td><td>Schema defined in Go, generated typed code</td><td>Real SQL (Structured Query Language); sqlc generates typed Go functions from .sql files</td></tr>
                <tr><td><b>Strengths</b></td><td>Fast CRUD (Create, Read, Update, Delete), many plugins</td><td>Type safety, graph relations, migrations</td><td>Queries are visible, indexes/CTEs/locks can be tuned, fastest</td></tr>
                <tr><td><b>Weaknesses</b></td><td>Unpredictable generated queries, N+1, errors found at runtime</td><td>Another DSL to learn, lots of generated code</td><td>More SQL to write; dynamic queries must be assembled by hand</td></tr>
              </tbody>
            </table>
          </div>
          <p>A senior answer: a payment system under heavy load needs control over transactions and locks (<code>SELECT ... FOR UPDATE</code>), so prefer <b>sqlc + pgx</b>; internal admin/CRUD can use an ORM to move fast. What matters is the reasoning and the team agreeing, not the tool.</p>
        </section>

        <section id="gi-http">
          <h2><span className="n">03</span>net/http, Gin, Echo or Fiber</h2>
          <ul className="plain">
            <li><b>net/http</b>: since 1.22 the standard router has methods and path params (<code>GET /users/{"{id}"}</code>), enough for most APIs. No dependencies; middleware is just <code>func(http.Handler) http.Handler</code>.</li>
            <li><b>Gin, Echo, Chi</b>: built on net/http, adding binding, validation and ready-made middleware; Chi stays closest to the standard library.</li>
            <li><b>Fiber</b>: built on fasthttp, not compatible with <code>http.Handler</code>, so it cannot share standard middleware and tooling (OpenTelemetry, pprof handlers). Fast in benchmarks, but the HTTP (HyperText Transfer Protocol) layer is rarely the bottleneck.</li>
          </ul>
        </section>

        <section id="gi-test">
          <h2><span className="n">04</span>Testing strategy</h2>
          <div className="cmp">
            <div><h4>Unit tests + mocks</h4>Mock small interfaces at the service layer (gomock, testify/mock, or hand-written fakes). Fast, run on every save. Easy to over-mock: tests pass while the real SQL is wrong.</div>
            <div><h4>Integration + Testcontainers</h4>Start real Postgres, Redis, Kafka in Docker from the test. Catches SQL, migration, transaction and locking bugs. Slower; run in CI (Continuous Integration).</div>
          </div>
          <CodeCompare go={`// Table-driven test + parallel subtests
func TestCalcFee(t *testing.T) {
    cases := []struct{ name string; amount, want int64 }{
        {"zero", 0, 0},
        {"normal", 10_000, 150},
    }
    for _, c := range cases {
        t.Run(c.name, func(t *testing.T) {
            t.Parallel()
            if got := CalcFee(c.amount); got != c.want {
                t.Fatalf("CalcFee(%d) = %d, want %d", c.amount, got, c.want)
            }
        })
    }
}
// go test -race -cover ./...   ·   testing/synctest (1.25) for code with time and goroutines`} js={`import test from "node:test";
import assert from "node:assert/strict";

// Table-driven test + subtests run concurrently
test("calcFee", async (t) => {
  const cases = [
    { name: "zero", amount: 0, want: 0 },
    { name: "normal", amount: 10_000, want: 150 },
  ];
  for (const c of cases) {
    await t.test(c.name, { concurrency: true }, () => {
      assert.equal(calcFee(c.amount), c.want);
    });
  }
});
// node --test --experimental-test-coverage   ·   mock.timers to test code that uses time`} />
        </section>

        <section id="gi-legacy">
          <h2><span className="n">05</span>Refactoring legacy code and upgrading Go</h2>
          <ol className="steps">
            <li><div><b>Get tests around it first</b><div className="d">Write characterization tests that record today&apos;s behaviour, then change things.</div></div></li>
            <li><div><b>Bump go.mod step by step</b><div className="d">Read the release notes, run vet and test -race; keep old behaviour with godebug if needed.</div></div></li>
            <li><div><b>Use the tools</b><div className="d"><code>go fix ./...</code> (1.26+) rewrites to min/max, range over int, slices, any...; <code>//go:fix inline</code> migrates calls from an old API to a new one.</div></div></li>
            <li><div><b>Modernise selectively</b><div className="d">log → log/slog; hand-rolled routing → ServeMux 1.22; functions duplicated per type → generics; several modules in one repo → go.work. Do not rewrite just because new syntax exists.</div></div></li>
          </ol>
          <p className="sub">See the release milestones on the <Link className="plink" href="/en/golang/versions/">Versions</Link> page.</p>
        </section>
      </main>
    </div>
  );
}
