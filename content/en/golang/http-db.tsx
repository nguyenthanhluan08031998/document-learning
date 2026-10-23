import { Code } from "@/components/Code";

export default function GoHttpDbPage() {
  return (
    <div className="wrap">
      <nav className="toc" aria-label="Go HTTP server and database contents">
        <div className="label">Contents</div>
        <ol>
          <li><a href="#gh-http"><span>01</span>HTTP server with net/http</a></li>
          <li><a href="#gh-mw"><span>02</span>Middleware</a></li>
          <li><a href="#gh-shutdown"><span>03</span>Timeouts and graceful shutdown</a></li>
          <li><a href="#gh-db"><span>04</span>database/sql</a></li>
          <li><a href="#gh-layout"><span>05</span>Project layout</a></li>
        </ol>
      </nav>
      <main>
        <header className="hero">
          <div className="eyebrow">go · http &amp; database</div>
          <h1>HTTP server and Database</h1>
          <p className="lede">Two things almost every Go service has. Since Go 1.22, <code>net/http</code> is enough to build an API (Application Programming Interface) without a framework; <code>database/sql</code> gives queries, transactions and a connection pool. This page goes from a handler to a safe shutdown and a project layout.</p>
          <div className="tape" aria-hidden="true">
            <div>ServeMux</div>
            <div>middleware</div>
            <div className="hw">Shutdown</div>
            <div>QueryContext</div>
            <div>Tx</div>
          </div>
        </header>

        <section id="gh-http">
          <h2><span className="n">01</span>HTTP server with net/http</h2>
          <Code lang="go">{`type userHandler struct{ store UserStore }

func (h *userHandler) get(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.Atoi(r.PathValue("id"))        // Go 1.22: path parameter
    if err != nil {
        http.Error(w, "bad id", http.StatusBadRequest)
        return
    }
    u, err := h.store.Find(r.Context(), id)           // pass the request context down
    if errors.Is(err, ErrNotFound) {
        http.Error(w, "not found", http.StatusNotFound)
        return
    }
    if err != nil {
        log.Printf("get user %d: %v", id, err)
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }
    writeJSON(w, http.StatusOK, u)
}

func (h *userHandler) create(w http.ResponseWriter, r *http.Request) {
    var in struct {
        Name string \`json:"name"\`
    }
    r.Body = http.MaxBytesReader(w, r.Body, 1<<20)     // cap the body at 1 MiB
    if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
        http.Error(w, "invalid json", http.StatusBadRequest)
        return
    }
    // ... validate, save
    writeJSON(w, http.StatusCreated, map[string]string{"name": in.Name})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)                              // headers first, then the body
    json.NewEncoder(w).Encode(v)
}

func routes(h *userHandler) http.Handler {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /users/{id}", h.get)           // method + path pattern in one string
    mux.HandleFunc("POST /users", h.create)
    mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(204) })
    return mux
}`}</Code>
          <div className="note tip"><b>Do you need Gin, Echo or Fiber?</b> For ordinary APIs, <code>net/http</code> plus the standard router is enough. Frameworks help when you want built-in binding and validation; see the Production page for a detailed comparison.</div>
        </section>

        <section id="gh-mw">
          <h2><span className="n">02</span>Middleware</h2>
          <p>Middleware is a function that takes an <code>http.Handler</code> and returns a new <code>http.Handler</code> wrapped around it. Use it for logging, auth, recover and request ids.</p>
          <Code lang="go">{`type Middleware func(http.Handler) http.Handler

func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

type ctxKey struct{}                                     // unexported type: no key collisions

func auth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        user, err := verify(r.Header.Get("Authorization"))
        if err != nil {
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return                                       // do NOT call next
        }
        ctx := context.WithValue(r.Context(), ctxKey{}, user)
        next.ServeHTTP(w, r.WithContext(ctx))            // hand the user to handlers via context
    })
}

// Chain: the first one listed is the outermost
func chain(h http.Handler, ms ...Middleware) http.Handler {
    for i := len(ms) - 1; i >= 0; i-- {
        h = ms[i](h)
    }
    return h
}
handler := chain(routes(h), logging, auth)               // logging -> auth -> routes`}</Code>
        </section>

        <section id="gh-shutdown">
          <h2><span className="n">03</span>Timeouts and graceful shutdown</h2>
          <p><code>http.ListenAndServe</code> has <b>no timeouts</b> by default: a slow client can hold a connection forever. Always configure a full <code>http.Server</code>, and shut down in a controlled way so in-flight requests are not cut off (important when deploying on Kubernetes).</p>
          <Code lang="go">{`func main() {
    srv := &http.Server{
        Addr:              ":8080",
        Handler:           handler,
        ReadHeaderTimeout: 5 * time.Second,     // protects against slowloris
        ReadTimeout:       10 * time.Second,
        WriteTimeout:      30 * time.Second,
        IdleTimeout:       60 * time.Second,
    }

    // ctx is cancelled on SIGINT or SIGTERM
    ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
    defer stop()

    go func() {
        if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
            log.Fatal(err)
        }
    }()

    <-ctx.Done()                                // wait for the signal
    shutdownCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
    defer cancel()
    if err := srv.Shutdown(shutdownCtx); err != nil {   // stop accepting, wait for in-flight requests
        log.Printf("forced shutdown: %v", err)
    }
    db.Close()                                  // then release resources
}`}</Code>
          <div className="note"><b>On Kubernetes:</b> a pod receives SIGTERM and then has <code>terminationGracePeriodSeconds</code> (30 seconds by default). Your <code>Shutdown</code> timeout must be smaller than that.</div>
        </section>

        <section id="gh-db">
          <h2><span className="n">04</span>database/sql</h2>
          <p><code>database/sql</code> is a common interface; the concrete driver (<code>pgx</code> for PostgreSQL (Structured Query Language), <code>go-sql-driver/mysql</code>) is imported for its side effects. <code>*sql.DB</code> is a <b>connection pool</b>: create it once and share it across the program, do not open and close it per request.</p>
          <Code lang="go">{`db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))   // does not connect yet
if err != nil { log.Fatal(err) }
db.SetMaxOpenConns(20)                   // cap concurrent connections (DB has its own limit)
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(30 * time.Minute)
if err := db.PingContext(ctx); err != nil { log.Fatal(err) }   // verify the connection

// One row
func (s *Store) Find(ctx context.Context, id int) (*User, error) {
    var u User
    err := s.db.QueryRowContext(ctx,
        "SELECT id, name FROM users WHERE id = $1", id,   // placeholder: never build SQL with string concat
    ).Scan(&u.ID, &u.Name)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, ErrNotFound
    }
    return &u, err
}

// Many rows
rows, err := s.db.QueryContext(ctx, "SELECT id, name FROM users WHERE active = $1", true)
if err != nil { return nil, err }
defer rows.Close()                       // MUST close, or the connection is never returned to the pool
var out []User
for rows.Next() {
    var u User
    if err := rows.Scan(&u.ID, &u.Name); err != nil { return nil, err }
    out = append(out, u)
}
if err := rows.Err(); err != nil { return nil, err }   // errors that ended the iteration early`}</Code>
          <p><b>Transactions:</b> statements in the same transaction must use the same <code>tx</code>, not <code>db</code>.</p>
          <Code lang="go">{`func (s *Store) Transfer(ctx context.Context, from, to int, amount int64) (err error) {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil { return err }
    defer func() {
        if err != nil { tx.Rollback() }  // any error below rolls everything back
    }()

    if _, err = tx.ExecContext(ctx, "UPDATE accounts SET balance = balance - $1 WHERE id = $2", amount, from); err != nil {
        return err
    }
    if _, err = tx.ExecContext(ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", amount, to); err != nil {
        return err
    }
    return tx.Commit()                   // err is set if the commit fails, so the deferred rollback is a no-op then
}`}</Code>
          <ul className="plain">
            <li>Always use the <code>...Context</code> variants so a cancelled request also cancels its query.</li>
            <li>Nullable columns need <code>sql.NullString</code> or a pointer (<code>*string</code>) when scanning.</li>
            <li>To write less by hand: <code>sqlx</code> (scan into structs), <code>sqlc</code> (generate code from SQL files). See the Production page for how to choose.</li>
          </ul>
        </section>

        <section id="gh-layout">
          <h2><span className="n">05</span>Project layout</h2>
          <Code lang="text">{`shop/
  go.mod                      # module example.com/shop, go 1.22
  cmd/
    api/main.go               # one folder per binary; main only wires things together
    worker/main.go
  internal/                   # cannot be imported by other modules
    user/
      handler.go              # HTTP layer
      service.go              # business logic, depends on small interfaces
      store.go                # database access
    platform/
      postgres.go             # shared infrastructure (DB, logger, config)
  migrations/                 # SQL migration files`}</Code>
          <ul className="plain">
            <li><b>Group by feature</b> (<code>user</code>, <code>order</code>) rather than by layer (<code>controllers</code>, <code>models</code>): changing a feature touches one folder.</li>
            <li><b><code>main</code> only wires:</b> read config, create the DB (Database), create services, run the server. Logic lives in other packages so it can be tested.</li>
            <li><b>Manual dependency injection:</b> pass dependencies through constructors (<code>NewService(store)</code>); no DI framework needed.</li>
            <li>Handy commands: <code>go mod tidy</code>, <code>go vet ./...</code>, <code>go test ./...</code>, <code>go build ./cmd/api</code>.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
