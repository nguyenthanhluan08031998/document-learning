import { Code } from "@/components/Code";

export default function GoSyncPatternsPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go concurrency in practice contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gs-sync"><span>01</span>sync: Mutex, WaitGroup, Once</a></li>
          <li><a href="#gs-select"><span>02</span>select</a></li>
          <li><a href="#gs-errgroup"><span>03</span>errgroup</a></li>
          <li><a href="#gs-race"><span>04</span>Race detector</a></li>
          <li><a href="#gs-rules"><span>05</span>Goroutine rules</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · concurrency in practice</div>
          <h1>Concurrency in practice</h1>
          <p className="lede">The channel and context page explains the machinery. This page is the everyday toolbox: protect shared data with <code>sync</code>, wait on several things with <code>select</code>, run parallel work with errors and a limit using <code>errgroup</code>, and catch data races with <code>-race</code>.</p>
          <div className="tape" aria-hidden="true">
            <div>Mutex</div>
            <div>WaitGroup</div>
            <div className="hw">select</div>
            <div>errgroup</div>
            <div>-race</div>
          </div>
        </header>

        <section id="gs-sync">
          <h2><span className="n">01</span>sync: Mutex, WaitGroup, Once</h2>
          <Code lang="go">{`// Mutex: protect shared state
type Counter struct {
    mu sync.Mutex                // zero value is ready to use; never copy a struct holding it
    n  map[string]int
}
func (c *Counter) Inc(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()           // unlock on every path, including panics
    c.n[key]++
}

// RWMutex: many readers OR one writer. Worth it only for read-heavy data
type Cache struct {
    mu sync.RWMutex
    m  map[string]string
}
func (c *Cache) Get(k string) (string, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    v, ok := c.m[k]
    return v, ok
}

// WaitGroup: wait for a group of goroutines
var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1)                     // Add BEFORE starting the goroutine
    go func() {
        defer wg.Done()
        fetch(url)
    }()
}
wg.Wait()

// Once: run something exactly once, safe under concurrency (lazy init, singleton)
var (
    once sync.Once
    cfg  *Config
)
func GetConfig() *Config {
    once.Do(func() { cfg = loadConfig() })
    return cfg
}`}</Code>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Tool</th><th>Use when</th></tr>
              </thead>
              <tbody>
                <tr><td><code>sync.Mutex</code></td><td>Briefly protecting a region of shared data</td></tr>
                <tr><td><code>sync/atomic</code></td><td>A simple counter or flag (<code>atomic.Int64</code>, <code>atomic.Bool</code>)</td></tr>
                <tr><td><code>sync.Map</code></td><td>Rare: write-once read-many keys, or goroutines using disjoint keys. Default to <code>map</code> + <code>Mutex</code></td></tr>
                <tr><td><code>sync.Pool</code></td><td>Reusing temporary objects to reduce GC (Garbage Collector) (buffers)</td></tr>
                <tr><td>channel</td><td>Handing data or ownership between goroutines</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="gs-select">
          <h2><span className="n">02</span>select</h2>
          <p><code>select</code> waits on several channels at once and runs whichever case is ready first. The three most common uses: timeout, cancellation through a context, and a non-blocking attempt.</p>
          <Code lang="go">{`// 1. Timeout
select {
case res := <-results:
    handle(res)
case <-time.After(2 * time.Second):
    return errors.New("timeout")
}

// 2. Worker loop that stops on cancel
func worker(ctx context.Context, jobs <-chan Job) {
    for {
        select {
        case <-ctx.Done():
            return                      // always have a way out, or the goroutine leaks
        case j, ok := <-jobs:
            if !ok { return }           // channel closed
            process(j)
        }
    }
}

// 3. Non-blocking send: drop instead of waiting
select {
case events <- e:
default:
    metrics.Dropped.Inc()               // buffer full
}

// Periodic work
t := time.NewTicker(10 * time.Second)
defer t.Stop()
for {
    select {
    case <-t.C:
        flush()
    case <-ctx.Done():
        return
    }
}`}</Code>
          <div className="note"><b>Note:</b> if several cases are ready, Go picks <b>at random</b>, not in source order. Receiving from a <code>nil</code> channel blocks forever; people sometimes set a channel to <code>nil</code> on purpose to disable a case.</div>
        </section>

        <section id="gs-errgroup">
          <h2><span className="n">03</span>errgroup</h2>
          <p><code>golang.org/x/sync/errgroup</code> is a <code>WaitGroup</code> that also <b>returns the first error</b>, <b>cancels the context on failure</b> and <b>limits how many goroutines run at once</b>. Prefer it over hand-assembling a WaitGroup and an error channel.</p>
          <Code lang="go">{`func fetchAll(ctx context.Context, ids []int) ([]*User, error) {
    g, ctx := errgroup.WithContext(ctx)    // ctx is cancelled when any task returns an error
    g.SetLimit(8)                          // at most 8 running at once (backpressure)

    users := make([]*User, len(ids))       // each goroutine writes its own index: no lock needed
    for i, id := range ids {
        g.Go(func() error {                // Go 1.22+: i and id are per iteration
            u, err := getUser(ctx, id)
            if err != nil {
                return fmt.Errorf("user %d: %w", id, err)
            }
            users[i] = u
            return nil
        })
    }
    if err := g.Wait(); err != nil {       // waits for all, returns the first error
        return nil, err
    }
    return users, nil
}`}</Code>
          <div className="pp">
            <div><span className="pl">Useful when</span>Calling several services/DBs in parallel and merging results; processing a large batch with a bounded number of workers.</div>
            <div className="warnc"><span className="pl">Remember</span>Pass the <code>ctx</code> that errgroup returns into the inner calls, otherwise cancelling on error has no effect.</div>
          </div>
        </section>

        <section id="gs-race">
          <h2><span className="n">04</span>Race detector</h2>
          <p>A data race is two goroutines accessing the same variable, at least one writing, without synchronization. The result is undefined and often only shows up in production. Go ships a detector:</p>
          <Code lang="bash">{`go test -race ./...        # run tests with the race detector (CI should always do this)
go run -race main.go
go build -race             # race-enabled binary for staging; ~5-10x slower, more memory`}</Code>
          <Code lang="go">{`// Typical bug the detector finds
var hits int
for i := 0; i < 100; i++ {
    go func() { hits++ }()           // WARNING: DATA RACE
}
// Fix: atomic.Int64 for a counter, or a Mutex around the update
var hits2 atomic.Int64
go func() { hits2.Add(1) }()`}</Code>
          <div className="note tip"><b>It only finds races that actually happen</b> during the run, so you need good test coverage and repeated runs (<code>-count=10</code>). No warning does not prove the code is safe.</div>
        </section>

        <section id="gs-rules">
          <h2><span className="n">05</span>Goroutine rules</h2>
          <ul className="plain">
            <li><b>Always know how a goroutine ends:</b> finished work, <code>ctx.Done()</code>, or a closed channel. No exit path means a goroutine leak.</li>
            <li><b>The sender closes the channel</b>, never the receiver. Sending on a closed channel panics.</li>
            <li><b>Do not start goroutines in a library the caller cannot control.</b> Let the caller decide <code>go f()</code>.</li>
            <li><b>Bound parallelism</b> (<code>SetLimit</code>, semaphore, worker pool) instead of one goroutine per item of unbounded input.</li>
            <li><b>Prefer passing data over sharing memory</b> when ownership moves; use a mutex when only guarding a small shared state.</li>
            <li>Run <code>go test -race</code> in CI (Continuous Integration).</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
