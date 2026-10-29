import { Code } from "@/components/Code";

export default function GoTestingPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go testing contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gt-basic"><span>01</span>Basic tests, table-driven</a></li>
          <li><a href="#gt-fake"><span>02</span>Faking with interfaces</a></li>
          <li><a href="#gt-http"><span>03</span>Testing HTTP handlers</a></li>
          <li><a href="#gt-db"><span>04</span>Testing with a real database</a></li>
          <li><a href="#gt-bench"><span>05</span>Benchmark, fuzz, race</a></li>
          <li><a href="#gt-tips"><span>06</span>Good habits</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · testing</div>
          <h1>Testing in Go</h1>
          <p className="lede">Go ships its testing tools in the standard library: no framework needed. The convention: files end in <code>_test.go</code>, functions start with <code>Test</code>, and you run them with <code>go test</code>. The most familiar style is the <b>table-driven test</b>: one table of cases and one loop that runs them all.</p>
          <div className="tape" aria-hidden="true">
            <div>_test.go</div>
            <div className="hw">table-driven</div>
            <div>httptest</div>
            <div>-race</div>
            <div>Benchmark</div>
          </div>
        </header>

        <section id="gt-basic">
          <h2><span className="n">01</span>Basic tests, table-driven</h2>
          <Code lang="go">{`// port_test.go (same package as the code under test)
package config

import "testing"

func TestParsePort(t *testing.T) {
    tests := []struct {
        name    string
        in      string
        want    int
        wantErr bool
    }{
        {"valid", "8080", 8080, false},
        {"not a number", "abc", 0, true},
        {"out of range", "70000", 0, true},
        {"empty", "", 0, true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {   // each case is a subtest, so failures name the case
            t.Parallel()                      // run in parallel (safe since Go 1.22: tt is per iteration)
            got, err := parsePort(tt.in)
            if (err != nil) != tt.wantErr {
                t.Fatalf("parsePort(%q) error = %v, wantErr = %v", tt.in, err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("parsePort(%q) = %d, want %d", tt.in, got, tt.want)
            }
        })
    }
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Function</th><th>On failure</th></tr>
              </thead>
              <tbody>
                <tr><td><code>t.Errorf</code></td><td>Records the failure and <b>keeps going</b> so you see every error</td></tr>
                <tr><td><code>t.Fatalf</code></td><td>Records the failure and <b>stops</b> this test (when later steps make no sense)</td></tr>
                <tr><td><code>t.Helper()</code></td><td>Marks a helper so the failure line points at the caller</td></tr>
                <tr><td><code>t.Cleanup(fn)</code></td><td>Runs cleanup when the test ends, in reverse order of registration</td></tr>
                <tr><td><code>t.TempDir()</code></td><td>A temporary directory, removed after the test</td></tr>
              </tbody>
            </table>
          </div>
          <Code lang="bash">{`go test ./...                     # run every test in the project
go test -run TestParsePort ./config   # run only tests matching the name
go test -v ./...                  # print each test
go test -count=1 ./...            # skip the result cache, force a rerun
go test -cover ./...              # show code coverage
go test -coverprofile=c.out ./... && go tool cover -html=c.out   # see what is not covered`}</Code>
        </section>

        <section id="gt-fake">
          <h2><span className="n">02</span>Faking with interfaces</h2>
          <p>Because Go interfaces are satisfied implicitly, you fake a dependency by writing a small struct with the same methods, no mock library needed. The condition: the code under test must accept an <b>interface</b> rather than a concrete type (see the Errors &amp; Interfaces page).</p>
          <Code lang="go">{`// Service depends on the UserStore interface
type fakeStore struct {
    users map[int]*User
    err   error                       // set an error to exercise the failure branch
}

func (f fakeStore) Find(ctx context.Context, id int) (*User, error) {
    if f.err != nil {
        return nil, f.err
    }
    u, ok := f.users[id]
    if !ok {
        return nil, ErrNotFound
    }
    return u, nil
}

func TestService_Greet(t *testing.T) {
    svc := NewService(fakeStore{users: map[int]*User{1: {ID: 1, Name: "Lan"}}})

    got, err := svc.Greet(context.Background(), 1)
    if err != nil || got != "Hello Lan" {
        t.Fatalf("got %q, %v", got, err)
    }

    _, err = svc.Greet(context.Background(), 99)
    if !errors.Is(err, ErrNotFound) {    // check the error kind, not its text
        t.Fatalf("want ErrNotFound, got %v", err)
    }
}`}</Code>
          <div className="note tip"><b>Fake or mock?</b> A fake is a simple working implementation (as above). A mock (<code>gomock</code>, <code>mockery</code>) records calls so you can assert &quot;this was called exactly once with X&quot;. Prefer fakes because they couple less to the internals.</div>
        </section>

        <section id="gt-http">
          <h2><span className="n">03</span>Testing HTTP handlers</h2>
          <p>The <code>net/http/httptest</code> package lets you call a handler without opening a network port.</p>
          <Code lang="go">{`func TestGetUser(t *testing.T) {
    h := &userHandler{store: fakeStore{users: map[int]*User{1: {ID: 1, Name: "Lan"}}}}
    mux := routes(h)

    tests := []struct {
        name string
        path string
        want int
    }{
        {"found", "/users/1", http.StatusOK},
        {"not found", "/users/99", http.StatusNotFound},
        {"bad id", "/users/abc", http.StatusBadRequest},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            req := httptest.NewRequest(http.MethodGet, tt.path, nil)
            rec := httptest.NewRecorder()     // records the response instead of sending it over the network
            mux.ServeHTTP(rec, req)

            if rec.Code != tt.want {
                t.Errorf("status = %d, want %d, body = %s", rec.Code, tt.want, rec.Body)
            }
        })
    }
}

// Testing a client that calls an external API: start a fake server
func TestFetchRate(t *testing.T) {
    srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprint(w, \`{"usd_vnd": 25000}\`)
    }))
    defer srv.Close()

    rate, err := FetchRate(srv.URL)           // pass the fake server's address to the code under test
    if err != nil || rate != 25000 {
        t.Fatalf("got %v, %v", rate, err)
    }
}`}</Code>
        </section>

        <section id="gt-db">
          <h2><span className="n">04</span>Testing with a real database</h2>
          <p>Unit tests with fakes are fast but cannot catch mistakes in SQL (Structured Query Language) or migrations. For the data-access layer, add <b>integration tests</b> against a real PostgreSQL, usually started as a throwaway container with <code>testcontainers-go</code>.</p>
          <Code lang="go">{`func newTestDB(t *testing.T) *sql.DB {
    t.Helper()
    if testing.Short() {
        t.Skip("skipping the integration test under -short")
    }
    ctx := context.Background()

    // Start PostgreSQL in a container (the library's API changes between versions, check its docs)
    ctr, err := postgres.Run(ctx, "postgres:16-alpine",
        postgres.WithDatabase("shop"), postgres.WithUsername("test"), postgres.WithPassword("test"))
    if err != nil {
        t.Fatal(err)
    }
    t.Cleanup(func() { _ = ctr.Terminate(ctx) })     // remove the container when the test ends

    dsn, _ := ctr.ConnectionString(ctx, "sslmode=disable")
    db, err := sql.Open("pgx", dsn)
    if err != nil {
        t.Fatal(err)
    }
    runMigrations(t, db)                              // build the same schema as production
    return db
}

func TestStore_Find(t *testing.T) {
    store := NewStore(newTestDB(t))
    // ... insert sample data, call store.Find and check the result
}`}</Code>
          <ul className="plain">
            <li>Give each test its own data, or wrap it in a transaction and roll back, so tests do not affect each other.</li>
            <li>Separate integration tests with <code>testing.Short()</code> or a build tag, so CI (Continuous Integration) runs both while laptops run only the fast ones.</li>
          </ul>
        </section>

        <section id="gt-bench">
          <h2><span className="n">05</span>Benchmark, fuzz, race</h2>
          <Code lang="go">{`// Benchmark: measures time and memory allocations
func BenchmarkParsePort(b *testing.B) {
    for i := 0; i < b.N; i++ {            // Go 1.24+ can use: for b.Loop() { ... }
        parsePort("8080")
    }
}

// Fuzz: Go generates random inputs to find panics and surprising failures
func FuzzParsePort(f *testing.F) {
    f.Add("8080")                         // initial sample input
    f.Fuzz(func(t *testing.T, s string) {
        parsePort(s)                      // must never panic, whatever the string
    })
}`}</Code>
          <Code lang="bash">{`go test -bench=. -benchmem ./...          # run benchmarks, also print allocations
go test -fuzz=FuzzParsePort -fuzztime=30s # fuzz for 30 seconds
go test -race ./...                       # detect data races (CI should always enable this)`}</Code>
          <div className="note"><b>Reading benchmark output:</b> <code>ns/op</code> is nanoseconds per run, <code>allocs/op</code> is heap allocations per run. Together they let you compare before and after an optimization (see the Memory and Production pages).</div>
        </section>

        <section id="gt-tips">
          <h2><span className="n">06</span>Good habits</h2>
          <ul className="plain">
            <li><b>Test behaviour, not implementation:</b> check results visible from outside so refactoring inside does not break the tests.</li>
            <li><b>Name tests after the scenario:</b> <code>TestTransfer_InsufficientFunds</code> beats <code>TestTransfer2</code>.</li>
            <li><b>Use <code>errors.Is</code>/<code>errors.As</code></b> to check errors, never compare strings.</li>
            <li><b>Do not <code>time.Sleep</code> to wait:</b> use channels, <code>sync.WaitGroup</code> or an injected fake clock; otherwise tests are slow and flaky.</li>
            <li><b>Golden files:</b> for long output (JSON, HTML), store the expected result under <code>testdata/</code> and compare against it.</li>
            <li><b>Comparison helpers:</b> <code>github.com/google/go-cmp/cmp</code> prints readable diffs; <code>testify</code> has <code>assert</code>/<code>require</code> if your team prefers terser tests.</li>
            <li>Run <code>go vet ./...</code> and <code>go test -race ./...</code> in CI before every merge.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
