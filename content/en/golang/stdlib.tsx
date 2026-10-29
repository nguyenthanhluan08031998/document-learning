import { Code } from "@/components/Code";

export default function GoStdlibPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go standard library contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gl-io"><span>01</span>io.Reader and io.Writer</a></li>
          <li><a href="#gl-json"><span>02</span>encoding/json</a></li>
          <li><a href="#gl-time"><span>03</span>time</a></li>
          <li><a href="#gl-slog"><span>04</span>log/slog</a></li>
          <li><a href="#gl-misc"><span>05</span>strings, slices, maps</a></li>
          <li><a href="#gl-map"><span>06</span>Package map</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · standard library</div>
          <h1>The everyday standard library</h1>
          <p className="lede">Go's standard library is strong enough to build most services without outside dependencies. The key idea is <b>small interfaces</b> (<code>io.Reader</code>, <code>io.Writer</code>) that let you snap pieces together. This page walks through the packages you will meet every day.</p>
          <div className="tape" aria-hidden="true">
            <div className="hw">io.Reader</div>
            <div>json</div>
            <div>time</div>
            <div>slog</div>
            <div>slices</div>
          </div>
        </header>

        <section id="gl-io">
          <h2><span className="n">01</span>io.Reader and io.Writer</h2>
          <p>Two single-method interfaces that underpin almost all data handling: files, network connections, HTTP bodies, buffers, compression. Because they share an interface, they compose naturally.</p>
          <Code lang="go">{`type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }

// Copy from any source to any destination without loading the whole file into memory
func serveFile(w http.ResponseWriter, path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()
    _, err = io.Copy(w, f)                  // http.ResponseWriter is also an io.Writer
    return err
}

// Snap pieces together
limited := io.LimitReader(r.Body, 1<<20)    // read at most 1 MiB
both := io.MultiWriter(os.Stdout, logFile)  // write to two places at once
tee := io.TeeReader(src, hasher)            // read the source and feed the data to a hasher at the same time

data, err := io.ReadAll(limited)            // read everything (careful with large data)

// Read a large file line by line
sc := bufio.NewScanner(f)
sc.Buffer(make([]byte, 0, 64*1024), 1<<20)  // by default lines over 64 KiB fail, raise the limit if needed
for sc.Scan() {
    handle(sc.Text())
}
if err := sc.Err(); err != nil { /* handle the read error */ }`}</Code>
          <div className="note tip"><b>Convention:</b> a function that takes <code>io.Reader</code>/<code>io.Writer</code> instead of <code>[]byte</code> or <code>*os.File</code> can be tested with <code>strings.NewReader</code> and <code>bytes.Buffer</code>, and can stream large data.</div>
        </section>

        <section id="gl-json">
          <h2><span className="n">02</span>encoding/json</h2>
          <Code lang="go">{`type Order struct {
    ID        string    \`json:"id"\`
    Note      string    \`json:"note,omitempty"\`   // drop the field when empty
    Total     int64     \`json:"total"\`
    CreatedAt time.Time \`json:"created_at"\`        // time.Time encodes as RFC 3339 by itself
    secret    string                               // lowercase: unexported, so not in the JSON
}

// Struct -> JSON
b, err := json.Marshal(order)
json.NewEncoder(w).Encode(order)            // write straight to an io.Writer

// JSON -> struct, reading from a stream
dec := json.NewDecoder(r.Body)
dec.DisallowUnknownFields()                 // fail if the client sends an unknown field
var in Order
if err := dec.Decode(&in); err != nil {
    http.Error(w, "invalid json", http.StatusBadRequest)
    return
}

// When the shape is unknown
var any map[string]any
json.Unmarshal(b, &any)                     // numbers become float64, convert when using them

// Delay decoding part of the payload: keep the raw JSON
type Event struct {
    Type string          \`json:"type"\`
    Data json.RawMessage \`json:"data"\`     // read Type first, then decode Data according to it
}`}</Code>
          <ul className="plain">
            <li>Only <b>capitalized</b> fields are encoded. Forgetting to capitalize is the most common mistake.</li>
            <li>Big integers (64-bit ids) are best sent as strings to JavaScript, which loses precision above 2^53.</li>
            <li>If you need custom encoding (money, enums), implement <code>MarshalJSON</code>/<code>UnmarshalJSON</code> on that type.</li>
          </ul>
        </section>

        <section id="gl-time">
          <h2><span className="n">03</span>time</h2>
          <Code lang="go">{`d := 5 * time.Second                       // Duration is a type, not a bare number
timeout := 2*time.Minute + 30*time.Second

start := time.Now()
doWork()
elapsed := time.Since(start)                // the Duration that has passed
fmt.Println(elapsed.Milliseconds())

// Formats use a FIXED REFERENCE: 2006-01-02 15:04:05 (Go's reference moment, not a placeholder date)
t.Format("2006-01-02 15:04:05")
t.Format(time.RFC3339)                      // 2026-10-26T09:30:00+07:00, use this in APIs
parsed, err := time.Parse(time.RFC3339, "2026-10-26T09:30:00+07:00")

// Time zones
loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
local := t.In(loc)                          // only changes the display, same instant
utc := t.UTC()

// Arithmetic and comparison
tomorrow := t.Add(24 * time.Hour)
t.Before(other); t.After(other); t.Equal(other)   // use Equal, never == on time.Time

// Timers and tickers
timer := time.NewTimer(3 * time.Second)
defer timer.Stop()
tick := time.NewTicker(time.Second)
defer tick.Stop()                           // always Stop to release resources`}</Code>
          <div className="pp">
            <div><span className="pl">Do</span>Store and pass time in <b>UTC</b> (Coordinated Universal Time), use <code>RFC3339</code> in APIs, and convert to the user's zone only at the display layer.</div>
            <div className="warnc"><span className="pl">Avoid</span><code>time.After</code> in hot loops (every call creates a new timer that lives until it fires); use <code>time.NewTimer</code> with <code>Reset</code>. And never compare <code>time.Time</code> with <code>==</code>.</div>
          </div>
        </section>

        <section id="gl-slog">
          <h2><span className="n">04</span>log/slog</h2>
          <p><code>slog</code> (since Go 1.21) is the standard structured logger: each log line is a set of key-value pairs, emitted as JSON so log tools can read it. See the Operations group for more on structured logging.</p>
          <Code lang="go">{`logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,                  // print Info and above only
}))
slog.SetDefault(logger)

slog.Info("order created", "order_id", id, "total", 1200)
// {"time":"...","level":"INFO","msg":"order created","order_id":"o-1","total":1200}

// Attach shared fields to every line of one component
orderLog := logger.With("service", "order-svc")
orderLog.Error("payment failed", "order_id", id, "err", err)

// Pass the context so a handler can pull the request id out of it
slog.ErrorContext(ctx, "payment call failed", "err", err)

// Group related fields
slog.Info("request", slog.Group("http", "method", "GET", "path", "/users/1", "status", 200))`}</Code>
          <div className="note"><b>Never log sensitive data</b> (passwords, tokens, card numbers). Log an error once at the outermost layer instead of at every layer, so one failure is not written many times.</div>
        </section>

        <section id="gl-misc">
          <h2><span className="n">05</span>strings, slices, maps</h2>
          <Code lang="go">{`// strings
strings.Split("a,b,c", ",")                 // ["a" "b" "c"]
strings.Join([]string{"a", "b"}, "-")       // "a-b"
strings.Contains(s, "x"); strings.HasPrefix(s, "go"); strings.TrimSpace(s)
strings.ToLower(s); strings.ReplaceAll(s, "a", "b")

var sb strings.Builder                      // building a string in a loop: use Builder, not +=
for i := 0; i < 3; i++ {
    fmt.Fprintf(&sb, "%d,", i)
}
result := sb.String()

// strconv
n, err := strconv.Atoi("42")
s := strconv.Itoa(42)
f, err := strconv.ParseFloat("3.14", 64)

// slices and maps (Go 1.21+)
xs := []int{3, 1, 2}
slices.Sort(xs)                             // [1 2 3]
slices.Contains(xs, 2)                      // true
i, found := slices.BinarySearch(xs, 2)
slices.Reverse(xs)
ys := slices.Clone(xs)                      // an independent copy

m := map[string]int{"a": 1, "b": 2}
keys := slices.Sorted(maps.Keys(m))         // Go 1.23: collect the keys and sort them for a stable order
delete(m, "a")
maps.Copy(dst, m)

// Sort by a custom rule
slices.SortFunc(users, func(a, b User) int {
    return strings.Compare(a.Name, b.Name)
})`}</Code>
        </section>

        <section id="gl-map">
          <h2><span className="n">06</span>Package map</h2>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>You need to</th><th>Package</th></tr>
              </thead>
              <tbody>
                <tr><td>Read and write files, environment variables, flags</td><td><code>os</code>, <code>flag</code>, <code>path/filepath</code>, <code>bufio</code></td></tr>
                <tr><td>HTTP server and client</td><td><code>net/http</code>, <code>net/http/httptest</code>, <code>net/url</code></td></tr>
                <tr><td>Encode data</td><td><code>encoding/json</code>, <code>encoding/base64</code>, <code>encoding/csv</code></td></tr>
                <tr><td>Hashing, HMAC, secure randomness</td><td><code>crypto/sha256</code>, <code>crypto/hmac</code>, <code>crypto/rand</code></td></tr>
                <tr><td>Concurrency, cancellation</td><td><code>sync</code>, <code>sync/atomic</code>, <code>context</code></td></tr>
                <tr><td>Errors</td><td><code>errors</code>, <code>fmt</code> (<code>%w</code>)</td></tr>
                <tr><td>Regular expressions</td><td><code>regexp</code> (slower than plain string checks, use when truly needed)</td></tr>
                <tr><td>Embed files in the binary</td><td><code>embed</code> (<code>{"//go:embed"}</code>)</td></tr>
                <tr><td>Diagnostics</td><td><code>runtime/pprof</code>, <code>net/http/pprof</code>, <code>runtime/trace</code></td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
